import { Suspense } from 'react';
import type { Metadata } from 'next';
import { db } from '@/server/db';
import CatalogPageClient from './CatalogPageClient';

type Props = {
  params: Promise<{ locale?: string }>;
};

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

// Baza orqali kerakli sozlamalar paketini olish
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const lang: 'ru' | 'uz' = resolvedParams?.locale === 'uz' ? 'uz' : 'ru';
  const bundle = await getCatalogSettingsBundle();

  const seo = bundle.catalog_seo || {};
  const site = bundle.site_settings || {};

  const baseUrl = site.baseUrl || site.url || '';
  const siteName = site.siteName?.[lang] || site.name || '';

  const rawTitle = seo.title?.[lang] || siteName;
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description = seo.description?.[lang] || site.description?.[lang] || '';
  const keywords = Array.isArray(seo.keywords?.[lang] || seo.keywords)
    ? seo.keywords?.[lang] || seo.keywords
    : (seo.keywords?.[lang] || seo.keywords || '')
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);

  let imageUrl = seo.ogImageUrl || site.defaultOgImage || '';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  const rawPath = normalizePath(seo.canonicalPath || '/catalog');
  const currentPath = lang === 'uz' ? `/uz${rawPath}` : rawPath;

  return {
    ...(baseUrl ? { metadataBase: new URL(baseUrl) } : {}),
    title,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: currentPath,
      languages: {
        ru: rawPath,
        uz: `/uz${rawPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: currentPath,
      siteName,
      locale: lang === 'uz' ? 'uz_UZ' : 'ru_RU',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: Number(seo.ogImageWidth) || 1200,
              height: Number(seo.ogImageHeight) || 630,
              alt: title,
            },
          ]
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function CatalogPage({ params }: Props) {
  const resolvedParams = await params;
  const lang: 'ru' | 'uz' = resolvedParams?.locale === 'uz' ? 'uz' : 'ru';
  const bundle = await getCatalogSettingsBundle();

  const seo = bundle.catalog_seo || {};
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = site.baseUrl || site.url || '';
  const siteName = site.siteName?.[lang] || site.name || '';
  const title = seo.title?.[lang] || siteName;
  const description = seo.description?.[lang] || site.description?.[lang] || '';

  const rawPath = normalizePath(seo.canonicalPath || '/catalog');
  const currentPath = lang === 'uz' ? `/uz${rawPath}` : rawPath;
  const homePath = lang === 'uz' ? `${baseUrl}/uz` : baseUrl;

  const homeLabel = t.breadcrumbHome?.[lang] || '';
  const catalogLabel = t.breadcrumbCatalog?.[lang] || title;
  const loadingText = t.loading?.[lang] || '...';

  // Kategoriyalar va tovarlarni dastlabki yuklash
  let categories: any[] = [];
  try {
    const [catRows]: any = await db.query(
      'SELECT id, slug, name, description, image, icon FROM categories ORDER BY sort_order ASC, id ASC'
    );
    categories = (catRows || []).map((cat: any) => ({
      ...cat,
      name: safeJsonParse(cat.name),
      description: safeJsonParse(cat.description),
    }));
  } catch (err) {
    console.error('Katalog toifalarini yuklashda xatolik:', err);
  }

  // Schema.org: CollectionPage + BreadcrumbList (statik so'zsiz)
  const catalogJsonLd = baseUrl
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${baseUrl}${currentPath}#collection`,
            url: `${baseUrl}${currentPath}`,
            name: title,
            inLanguage: lang === 'uz' ? 'uz-UZ' : 'ru-RU',
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
      }
    : null;

  return (
    <>
      {catalogJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogJsonLd) }}
        />
      )}
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