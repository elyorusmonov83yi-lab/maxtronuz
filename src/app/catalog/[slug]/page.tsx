import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/server/db';
import CatalogPageClient from '../CatalogPageClient';

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

async function getCategoryData(slug: string, lang: 'ru' | 'uz') {
  try {
    const decodedSlug = decodeURIComponent(slug).trim().toLowerCase();

    const [allCats]: any = await db.query('SELECT * FROM categories ORDER BY id ASC');
    let targetCategory: any = null;

    const parsedCategories = (allCats || []).map((cat: any) => {
      const pSlug = safeJsonParse(cat.slug);
      const parsedCat = {
        ...cat,
        slugParsed: pSlug,
        slug: pSlug?.[lang] || pSlug?.ru || cat.id,
        name: safeJsonParse(cat.name),
        description: safeJsonParse(cat.description),
        seoTitle: safeJsonParse(cat.seoTitle),
        seoDescription: safeJsonParse(cat.seoDescription),
        seoKeywords: safeJsonParse(cat.seoKeywords),
      };

      if (
        String(cat.id).toLowerCase() === decodedSlug ||
        String(pSlug?.ru || '').toLowerCase() === decodedSlug ||
        String(pSlug?.uz || '').toLowerCase() === decodedSlug ||
        String(cat.slug || '').toLowerCase() === decodedSlug
      ) {
        targetCategory = parsedCat;
      }
      return parsedCat;
    });

    if (!targetCategory) return null;

    return {
      category: targetCategory,
      categories: parsedCategories,
    };
  } catch (err) {
    console.error('Ошибка загрузки категории:', err);
    return null;
  }
}

async function getSettingsBundle() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings WHERE \`key\` IN ('site_settings', 'translations')`
    );
    const bundle: Record<string, any> = {};
    for (const r of rows || []) bundle[r.key] = safeJsonParse(r.value);
    return bundle;
  } catch {
    return {};
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = 'ru';
  const data = await getCategoryData(slug, lang);

  if (!data) return {};
  const { category } = data;

  const bundle = await getSettingsBundle();
  const site = bundle.site_settings || {};
  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const catName = category.name?.[lang] || category.name?.uz || 'Категория';
  const rawTitle = category.seoTitle?.[lang] || catName;
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description =
    category.seoDescription?.[lang] ||
    category.description?.[lang] ||
    `${catName} по выгодным ценам в Ташкенте и Узбекистане.`;

  const keywords = Array.isArray(category.seoKeywords?.[lang])
    ? category.seoKeywords[lang]
    : (category.seoKeywords?.[lang] || '')
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);

  let imageUrl = category.ogImage || category.image || category.imageUrl || site.defaultOgImage || '';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  const ruSlug = category.slugParsed?.ru || slug;
  const uzSlug = category.slugParsed?.uz || category.slugParsed?.ru || slug;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: `${baseUrl}/catalog/${ruSlug}`,
      languages: {
        ru: `${baseUrl}/catalog/${ruSlug}`,
        uz: `${baseUrl}/uz/catalog/${uzSlug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/catalog/${ruSlug}`,
      siteName,
      locale: 'ru_RU',
      type: 'website',
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const lang = 'ru';
  const data = await getCategoryData(slug, lang);

  if (!data) notFound();

  const { category, categories } = data;
  const bundle = await getSettingsBundle();
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';
  const catName = category.name?.[lang] || 'Категория';
  const catDesc = category.seoDescription?.[lang] || category.description?.[lang] || '';
  const currentPath = `/catalog/${category.slugParsed?.ru || slug}`;

  const categoryJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${baseUrl}${currentPath}#collection`,
        url: `${baseUrl}${currentPath}`,
        name: catName,
        inLanguage: 'ru-RU',
        description: catDesc,
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
            name: t.breadcrumbHome?.ru || 'Главная',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: t.breadcrumbCatalog?.ru || 'Каталог',
            item: `${baseUrl}/catalog`,
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

  const categorySeo = {
    title: {
      ru: category.seoTitle?.ru || catName,
      uz: category.seoTitle?.uz || catName,
    },
    description: {
      ru: catDesc,
      uz: category.seoDescription?.uz || category.description?.uz || '',
    },
    ogImageUrl: category.ogImage || category.image || category.imageUrl || '',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />
      <CatalogPageClient
        lang={lang}
        initialCategories={categories}
        selectedCategoryId={category.id}
        categorySeo={categorySeo}
        siteSettings={site}
        translations={t}
      />
    </>
  );
}