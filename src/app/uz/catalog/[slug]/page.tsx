import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/server/db';
import CatalogPageClient from '../../../catalog/CatalogPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
};

function safeJsonParse(data: unknown): Record<string, any> {
  if (!data) return {};
  if (typeof data === 'object') return data as Record<string, any>;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return {};
}

async function getCategoryBySlug(slug: string, lang: 'ru' | 'uz') {
  try {
    const [rows]: any = await db.query(
      `SELECT * FROM categories 
       WHERE id = ? 
          OR slug = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.uz')) = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.ru')) = ? 
       LIMIT 1`,
      [slug, slug, slug, slug]
    );

    if (rows && rows.length > 0) {
      const cat = rows[0];
      return {
        ...cat,
        name: safeJsonParse(cat.name),
        description: safeJsonParse(cat.description),
        seoTitle: safeJsonParse(cat.seoTitle),
        seoDescription: safeJsonParse(cat.seoDescription),
        seoKeywords: safeJsonParse(cat.seoKeywords),
        slugParsed: safeJsonParse(cat.slug),
      };
    }

    const [allCats]: any = await db.query('SELECT * FROM categories');
    for (const cat of allCats || []) {
      const parsedSlug = safeJsonParse(cat.slug);
      if (
        cat.id === slug ||
        cat.slug === slug ||
        parsedSlug.uz === slug ||
        parsedSlug.ru === slug
      ) {
        return {
          ...cat,
          name: safeJsonParse(cat.name),
          description: safeJsonParse(cat.description),
          seoTitle: safeJsonParse(cat.seoTitle),
          seoDescription: safeJsonParse(cat.seoDescription),
          seoKeywords: safeJsonParse(cat.seoKeywords),
          slugParsed: parsedSlug,
        };
      }
    }

    return null;
  } catch (err) {
    console.error('Kategoriyani yuklashda xatolik:', err);
    return null;
  }
}

async function getSettingsBundle() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings WHERE \`key\` IN ('site_settings', 'translations')`
    );
    const bundle: Record<string, any> = {};
    for (const row of rows || []) {
      bundle[row.key] = safeJsonParse(row.value);
    }
    return bundle;
  } catch {
    return {};
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = 'uz';
  const category = await getCategoryBySlug(slug, lang);

  if (!category) return {};

  const bundle = await getSettingsBundle();
  const site = bundle.site_settings || {};
  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.uz || site.name || 'MAXTRON';

  const catName = category.name?.uz || category.name?.ru || 'Kategoriya';
  const rawTitle = category.seoTitle?.uz || catName;
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description =
    category.seoDescription?.uz ||
    category.description?.uz ||
    `${catName} O‘zbekistonda rasmiy kafolat bilan.`;

  const keywords = Array.isArray(category.seoKeywords?.uz)
    ? category.seoKeywords.uz
    : (category.seoKeywords?.uz || '')
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);

  let imageUrl = category.ogImage || category.image || category.imageUrl || site.defaultOgImage || '';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  const uzSlug = category.slugParsed?.uz || slug;
  const ruSlug = category.slugParsed?.ru || category.slugParsed?.uz || slug;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: `${baseUrl}/uz/catalog/${uzSlug}`,
      languages: {
        ru: `${baseUrl}/catalog/${ruSlug}`,
        uz: `${baseUrl}/uz/catalog/${uzSlug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/uz/catalog/${uzSlug}`,
      siteName,
      locale: 'uz_UZ',
      type: 'website',
      images: imageUrl ? [{ url: imageUrl, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function UzCategoryPage({ params }: Props) {
  const { slug } = await params;
  const lang = 'uz';
  const category = await getCategoryBySlug(slug, lang);

  if (!category) {
    notFound();
  }

  const bundle = await getSettingsBundle();
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};
  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.uz || site.name || 'MAXTRON';

  const catName = category.name?.uz || 'Kategoriya';
  const currentPath = `/uz/catalog/${category.slugParsed?.uz || slug}`;

  let allCategories: any[] = [];
  try {
    const [rows]: any = await db.query(
      'SELECT id, slug, name, description, image, icon FROM categories ORDER BY id ASC'
    );
    allCategories = (rows || []).map((c: any) => {
      const parsedSlug = safeJsonParse(c.slug);
      return {
        ...c,
        slug: parsedSlug.uz || parsedSlug.ru || c.id,
        name: safeJsonParse(c.name),
        description: safeJsonParse(c.description),
      };
    });
  } catch (err) {
    console.error('Kategoriyalar ro‘yxati xatosi:', err);
  }

  const categoryJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${baseUrl}${currentPath}#collection`,
        url: `${baseUrl}${currentPath}`,
        name: catName,
        inLanguage: 'uz-UZ',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          name: siteName,
          url: baseUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${baseUrl}${currentPath}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: t.breadcrumbHome?.uz || 'Bosh sahifa',
            item: `${baseUrl}/uz`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: t.breadcrumbCatalog?.uz || 'Katalog',
            item: `${baseUrl}/uz/catalog`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: catName,
            item: `${baseUrl}${currentPath}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <CatalogPageClient
        lang={lang}
        initialCategories={allCategories}
        selectedCategoryId={category.id}
        siteSettings={site}
        translations={t}
      />
    </>
  );
}