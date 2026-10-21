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
      
      // Slug oddiy qator bo'lishi ham, JSON bo'lishi ham mumkin:
      const rawSlugStr = typeof cat.slug === 'string' ? cat.slug.toLowerCase().trim() : '';
      const slugRu = (pSlug?.ru || rawSlugStr || String(cat.id)).toLowerCase();
      const slugUz = (pSlug?.uz || rawSlugStr || String(cat.id)).toLowerCase();

      // CamelCase va snake_case ustunlarini qamrab olamiz:
      const nameParsed = safeJsonParse(cat.name);
      const descParsed = safeJsonParse(cat.description);
      const seoTitleParsed = safeJsonParse(cat.seoTitle || cat.seo_title);
      const seoDescParsed = safeJsonParse(cat.seoDescription || cat.seo_description);
      const seoKeysParsed = safeJsonParse(cat.seoKeywords || cat.seo_keywords);

      const parsedCat = {
        ...cat,
        slugParsed: pSlug,
        slug: pSlug?.[lang] || pSlug?.ru || cat.slug || cat.id,
        name: nameParsed,
        description: descParsed,
        seoTitle: seoTitleParsed,
        seoDescription: seoDescParsed,
        seoKeywords: seoKeysParsed,
      };

      // Qidirilayotgan slug bilan tekshirish:
      if (
        String(cat.id).toLowerCase() === decodedSlug ||
        rawSlugStr === decodedSlug ||
        slugRu === decodedSlug ||
        slugUz === decodedSlug
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

  if (!data) {
    return {
      title: 'Каталог промышленного оборудования — MAXTRON',
      description: 'Поставка контрольно-измерительных приборов и промышленного оборудования в Ташкенте.',
    };
  }

  const { category } = data;
  const bundle = await getSettingsBundle();
  const site = bundle.site_settings || {};
  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  // Nomi va sarlavhasini olish:
  const catName = category.name?.[lang] || (typeof category.name === 'string' ? category.name : 'Категория');
  const rawTitle = category.seoTitle?.[lang] || (typeof category.seoTitle === 'string' ? category.seoTitle : '') || catName;
  
  // "MAXTRON | MAXTRON" takrorlanishining oldini olish:
  const title = rawTitle.includes('MAXTRON')
    ? rawTitle
    : `${rawTitle} — ${siteName}`;

  const description =
    category.seoDescription?.[lang] ||
    (typeof category.seoDescription === 'string' ? category.seoDescription : '') ||
    category.description?.[lang] ||
    `${catName} со склада в Ташкенте по выгодным ценам. Официальная гарантия и доставка.`;

  const rawKeys = category.seoKeywords?.[lang] || (typeof category.seoKeywords === 'string' ? category.seoKeywords : '');
  const keywords = Array.isArray(rawKeys)
    ? rawKeys
    : String(rawKeys)
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);

  let imageUrl = category.ogImage || category.image || category.imageUrl || site.defaultOgImage || '/og-image.jpg';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  const ruSlug = category.slugParsed?.ru || (typeof category.slug === 'string' ? category.slug : slug);
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
  const catName = category.name?.[lang] || (typeof category.name === 'string' ? category.name : 'Категория');
  const catDesc = category.seoDescription?.[lang] || category.description?.[lang] || '';
  const currentPath = `/catalog/${category.slugParsed?.ru || (typeof category.slug === 'string' ? category.slug : slug)}`;

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