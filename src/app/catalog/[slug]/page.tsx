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

function getText(field: any, lang: string, fallback = ''): string {
  if (!field) return fallback;
  if (typeof field === 'string') {
    const parsed = safeJsonParse(field);
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
      return parsed[lang] || parsed.ru || parsed.uz || fallback;
    }
    return field;
  }
  if (typeof field === 'object') {
    return field[lang] || field.ru || field.uz || fallback;
  }
  return fallback;
}

async function getCategoryData(slug: string, lang: 'ru' | 'uz') {
  if (!slug) return null;
  try {
    const decodedSlug = decodeURIComponent(slug).trim().toLowerCase();
    const [allCats]: any = await db.query('SELECT * FROM categories ORDER BY id ASC');
    let targetCategory: any = null;

    const parsedCategories = (allCats || []).map((cat: any) => {
      const pSlug = safeJsonParse(cat.slug);
      const rawSlugStr = typeof cat.slug === 'string' ? cat.slug.toLowerCase().trim() : '';

      const isMatch =
        String(cat.id).toLowerCase() === decodedSlug ||
        rawSlugStr === decodedSlug ||
        String(pSlug?.ru || '').toLowerCase() === decodedSlug ||
        String(pSlug?.uz || '').toLowerCase() === decodedSlug;

      const parsedCat = {
        ...cat,
        slugParsed: pSlug,
        slug: pSlug?.[lang] || pSlug?.ru || cat.slug || cat.id,
        name: safeJsonParse(cat.name),
        description: safeJsonParse(cat.description),
        seoTitle: safeJsonParse(cat.seoTitle),
        seoDescription: safeJsonParse(cat.seoDescription),
        seoKeywords: safeJsonParse(cat.seoKeywords),
      };

      if (isMatch) {
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
    console.error('Bazada kategoriya qidirishda xatolik:', err);
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
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const lang = 'ru';

  const data = await getCategoryData(slug, lang);

  if (!data || !data.category) {
    return {
      title: 'Промышленные аккумуляторы и АКБ в Ташкенте — MAXTRON',
      description: 'Поставка промышленных аккумуляторов и оборудования со склада в Ташкенте.',
    };
  }

  const { category } = data;
  const bundle = await getSettingsBundle();
  const site = bundle.site_settings || {};
  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = getText(site.siteName, lang, 'MAXTRON');

  const catName = getText(category.name, lang, 'Категория');
  const rawTitle = getText(category.seoTitle, lang, catName);

  const title = rawTitle.includes('MAXTRON') ? rawTitle : `${rawTitle} — ${siteName}`;

  const description = getText(
    category.seoDescription,
    lang,
    getText(category.description, lang, `${catName} со склада в Ташкенте по выгодным ценам.`)
  );

  const rawKeys = getText(category.seoKeywords, lang, '');
  const keywords = rawKeys
    ? rawKeys.split(',').map((k: string) => k.trim()).filter(Boolean)
    : [];

  let imageUrl = category.ogImage || category.image || category.imageUrl || site.defaultOgImage || '/og-image.jpg';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  const ruSlug = category.slugParsed?.ru || slug;
  const uzSlug = category.slugParsed?.uz || ruSlug;

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
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const lang = 'ru';

  const data = await getCategoryData(slug, lang);
  if (!data) notFound();

  const { category, categories } = data;
  const bundle = await getSettingsBundle();
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = getText(site.siteName, lang, 'MAXTRON');
  const catName = getText(category.name, lang, 'Категория');
  const catDesc = getText(category.seoDescription, lang, getText(category.description, lang, ''));
  const currentPath = `/catalog/${category.slugParsed?.ru || slug}`;

  // Schema.org (JSON-LD) mikromarkirovkasi to'liq joyida
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
      ru: getText(category.seoTitle, 'ru', catName),
      uz: getText(category.seoTitle, 'uz', catName),
    },
    description: {
      ru: catDesc,
      uz: getText(category.seoDescription, 'uz', getText(category.description, 'uz', '')),
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