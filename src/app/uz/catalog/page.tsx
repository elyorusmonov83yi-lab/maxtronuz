import { Suspense } from 'react';
import type { Metadata } from 'next';
import { db } from '@/server/db';
import CatalogPageClient from '../../catalog/CatalogPageClient';

// Har bir so'rovda Aiven bazasidan yangi SEO ma'lumotlarini olish uchun
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Xavfsiz JSON parser
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

// Domenni dinamik va to'g'ri aniqlash
function getBaseUrl(dbUrl?: string): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (dbUrl && dbUrl.trim().startsWith('http')) {
    return dbUrl.trim().replace(/\/+$/, '');
  }
  return 'https://maxtron.uz';
}

// Bazadan barcha kerakli sozlamalarni olish (catalog_seo, site_settings, translations)
async function getCatalogSettingsBundle() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings 
       WHERE \`key\` IN ('catalog_seo', 'site_settings', 'translations')`
    );

    const bundle: Record<string, any> = {};
    if (rows && rows.length > 0) {
      for (const row of rows) {
        bundle[row.key] = safeJsonParse(row.value);
      }
    }
    return bundle;
  } catch (err) {
    console.error('Katalog sozlamalarini yuklashda xatolik:', err);
    return {};
  }
}

function normalizePath(path: string): string {
  if (!path) return '/catalog';
  return path.startsWith('/') ? path : `/${path}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = 'uz';
  const bundle = await getCatalogSettingsBundle();

  const seo = bundle.catalog_seo || {};
  const site = bundle.site_settings || {};

  const baseUrl = getBaseUrl(site.baseUrl || site.url);
  const siteName = site.siteName?.uz || site.siteName?.ru || site.name || 'MAXTRON';

  // 1. Dinamik O'zbekcha Title
  const rawTitle = seo.title?.uz || site.catalogTitle?.uz || 'KIPiA uskunalari va datchiklar katalogi';
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  // 2. Dinamik O'zbekcha Description
  const description =
    seo.description?.uz ||
    site.catalogDescription?.uz ||
    'O‘zbekistonda sanoat nazorat-o‘lchov asboblari, manometrlar, bosim datchiklari va sarf o‘lchagichlar katalogi.';

  // 3. Kalit so'zlar
  const keywords = Array.isArray(seo.keywords?.uz || seo.keywords)
    ? seo.keywords?.uz || seo.keywords
    : (seo.keywords?.uz || seo.keywords || '')
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);

  // 4. Rasm URL va zaxira fallback
  let rawImg = seo.ogImageUrl || site.defaultOgImage || '';
  if (typeof rawImg === 'string' && rawImg.startsWith('data:')) {
    rawImg = '';
  }

  let imageUrl = '';
  if (rawImg) {
    imageUrl = rawImg.startsWith('http')
      ? rawImg
      : `${baseUrl}/${rawImg.replace(/^\/+/, '')}`;
  } else {
    imageUrl = `${baseUrl}/og-image.jpg`;
  }

  const rawPath = normalizePath(seo.canonicalPath || '/catalog');
  const currentPath = `/uz${rawPath}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: currentPath,
      languages: {
        ru: rawPath,
        uz: currentPath,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${currentPath}`,
      siteName,
      locale: 'uz_UZ',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: Number(seo.ogImageWidth) || 1200,
          height: Number(seo.ogImageHeight) || 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function UzCatalogPage() {
  const lang = 'uz';
  const bundle = await getCatalogSettingsBundle();

  const seo = bundle.catalog_seo || {};
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = getBaseUrl(site.baseUrl || site.url);
  const siteName = site.siteName?.uz || site.siteName?.ru || site.name || 'MAXTRON';
  const rawTitle = seo.title?.uz || site.catalogTitle?.uz || 'MAXTRON uskunalar katalogi';
  const title = siteName && !rawTitle.includes(siteName) ? `${rawTitle} — ${siteName}` : rawTitle;
  const description = seo.description?.uz || site.catalogDescription?.uz || '';

  const rawPath = normalizePath(seo.canonicalPath || '/catalog');
  const currentPath = `/uz${rawPath}`;
  const homePath = `${baseUrl}/uz`;

  const homeLabel = t.breadcrumbHome?.uz || 'Bosh sahifa';
  const catalogLabel = t.breadcrumbCatalog?.uz || title;
  const loadingText = t.loading?.uz || 'Yuklanmoqda...';

  // 1. Kategoriyalarni serverda (SSR) to'liq yuklash
  let categories: any[] = [];
  try {
    const [catRows]: any = await db.query(
      'SELECT id, parentId, slug, name, description, image, icon FROM categories ORDER BY id ASC'
    );
    categories = (catRows || []).map((cat: any) => ({
      ...cat,
      parentId: cat.parentId || null,
      name: safeJsonParse(cat.name),
      description: safeJsonParse(cat.description),
    }));
  } catch (err) {
    console.error('O‘zbekcha katalog toifalarini yuklashda xatolik:', err);
  }

  // 2. Schema.org: CollectionPage + BreadcrumbList
  const catalogJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${baseUrl}${currentPath}#collection`,
        url: `${baseUrl}${currentPath}`,
        name: title,
        inLanguage: 'uz-UZ',
        description,
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
            name: homeLabel,
            item: homePath,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: catalogLabel,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogJsonLd) }}
      />
      <Suspense fallback={<div className="py-20 text-center text-xs text-gray-500">{loadingText}</div>}>
        <CatalogPageClient
          lang={lang}
          initialCategories={categories}
          siteSettings={site}
          catalogSeo={seo}
          translations={t}
        />
      </Suspense>
    </>
  );
}