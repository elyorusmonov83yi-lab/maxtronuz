import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/server/db';
import CategoryDetailView from '@/components/views/CategoryDetailView';

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

    // 1. Bazadagi barcha toifalarni olish
    const [allCats]: any = await db.query('SELECT * FROM categories ORDER BY id ASC');
    let targetCategory: any = null;

    const parsedCategories = (allCats || []).map((cat: any) => {
      const pSlug = safeJsonParse(cat.slug);
      const parsedCat = {
        ...cat,
        slugParsed: pSlug,
        name: safeJsonParse(cat.name),
        description: safeJsonParse(cat.description),
        seoTitle: safeJsonParse(cat.seoTitle),
        seoDescription: safeJsonParse(cat.seoDescription),
        seoKeywords: safeJsonParse(cat.seoKeywords),
      };

      if (
        String(cat.id).toLowerCase() === decodedSlug ||
        String(pSlug?.uz || '').toLowerCase() === decodedSlug ||
        String(pSlug?.ru || '').toLowerCase() === decodedSlug ||
        String(cat.slug || '').toLowerCase() === decodedSlug
      ) {
        targetCategory = parsedCat;
      }
      return parsedCat;
    });

    if (!targetCategory) return null;

    // 2. Aynan shu toifaga tegishli mahsulotlarni bazadan to'g'ridan-to'g'ri olish
    const [productsRows]: any = await db.query(
      'SELECT * FROM products WHERE categoryId = ? OR category = ?',
      [targetCategory.id, targetCategory.id]
    );

    const products = (productsRows || []).map((p: any) => ({
      ...p,
      name: safeJsonParse(p.name),
      slugParsed: safeJsonParse(p.slug),
      description: safeJsonParse(p.description),
    }));

    return {
      category: targetCategory,
      categories: parsedCategories,
      products,
    };
  } catch (err) {
    console.error('Kategoriya ma’lumotlarini yuklashda xatolik:', err);
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
  const lang = 'uz';
  const data = await getCategoryData(slug, lang);

  if (!data) return {};
  const { category } = data;

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
    `${catName} Toshkent va butun O‘zbekiston bo‘ylab rasmiy kafolat bilan.`;

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
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
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
  const data = await getCategoryData(slug, lang);

  if (!data) notFound();

  const { category, categories, products } = data;
  const bundle = await getSettingsBundle();
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.uz || site.name || 'MAXTRON';
  const catName = category.name?.uz || 'Kategoriya';
  const catDesc = category.seoDescription?.uz || category.description?.uz || '';
  const currentPath = `/uz/catalog/${category.slugParsed?.uz || slug}`;

  // Google SEO uchun to'liq Schema.org mikroformati (CollectionPage + BreadcrumbList)
  const categoryJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${baseUrl}${currentPath}#collection`,
        url: `${baseUrl}${currentPath}`,
        name: catName,
        inLanguage: 'uz-UZ',
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
      <CategoryDetailView
        lang={lang}
        category={category}
        categories={categories}
        products={products}
        siteSettings={site}
        translations={t}
      />
    </>
  );
}