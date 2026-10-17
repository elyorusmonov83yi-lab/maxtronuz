import type { Metadata } from 'next';
import { db } from '@/server/db';
import { CompareClient } from '@/app/compare/CompareClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

async function getCompareBundle() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings 
       WHERE \`key\` IN ('compare_seo', 'site_settings', 'translations')`
    );

    const bundle: Record<string, any> = {};
    if (rows && rows.length > 0) {
      for (const row of rows) {
        bundle[row.key] = safeJsonParse(row.value);
      }
    }
    return bundle;
  } catch (err) {
    console.error('Compare sozlamalarini yuklashda xatolik:', err);
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const lang: 'uz' = 'uz';
  const bundle = await getCompareBundle();

  const seo = bundle.compare_seo || {};
  const site = bundle.site_settings || {};

  const baseUrl = getBaseUrl(site.baseUrl || site.url);
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const rawTitle = seo.title?.[lang] || 'Uskunalarni solishtirish';
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description =
    seo.description?.[lang] ||
    site.description?.[lang] ||
    'MAXTRON sanoat va nazorat-o‘lchov uskunalari parametrlarini o‘zaro solishtirish.';

  const currentPath = '/uz/compare';
  const canonicalUrl = `${baseUrl}${currentPath}`;

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

  return {
    metadataBase: new URL(baseUrl),
    robots: {
      index: false,
      follow: true,
    },
    title,
    description,
    alternates: {
      canonical: currentPath,
      languages: {
        ru: '/compare',
        uz: '/uz/compare',
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: 'uz_UZ',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
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

export default async function UzComparePage() {
  const lang: 'uz' = 'uz';
  const bundle = await getCompareBundle();

  const seo = bundle.compare_seo || {};
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = getBaseUrl(site.baseUrl || site.url);
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';
  const title = seo.title?.[lang] || 'Uskunalarni solishtirish';

  const currentPath = '/uz/compare';
  const homePath = `${baseUrl}/uz`;

  const homeLabel = t.breadcrumbHome?.[lang] || 'Bosh sahifa';
  const compareLabel = t.breadcrumbCompare?.[lang] || 'Solishtirish';

  const compareJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
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
            name: compareLabel,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }}
      />
      <CompareClient
        lang={lang}
        siteSettings={site}
        compareSeo={seo}
        translations={t}
      />
    </>
  );
}