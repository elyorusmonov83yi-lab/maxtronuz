import type { Metadata } from 'next';
import { db } from '@/server/db';
import { FinderClient } from './FinderClient';

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

async function getPageData() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings 
       WHERE \`key\` IN ('finder_seo', 'site_settings', 'translations')`
    );

    const data: Record<string, any> = {};
    if (rows && rows.length > 0) {
      for (const row of rows) {
        data[row.key] = safeJsonParse(row.value);
      }
    }
    return data;
  } catch (err) {
    console.error('Finder ma’lumotlarini yuklashda xatolik:', err);
    return {};
  }
}

function normalizePath(path?: string): string {
  if (!path) return '/equipment-finder';
  return path.startsWith('/') ? path : `/${path}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang: 'ru' = 'ru';
  const pageData = await getPageData();

  const seo = pageData.finder_seo || {};
  const site = pageData.site_settings || {};

  const baseUrl = getBaseUrl(site.baseUrl || site.url);
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const rawTitle = seo.title?.[lang] || 'Подбор оборудования — Интерактивный конфигуратор';
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description =
    seo.description?.[lang] ||
    'Онлайн конфигуратор для точного подбора контрольно-измерительных приборов и датчиков.';
  const rawPath = normalizePath(seo.canonicalPath);
  const canonicalUrl = `${baseUrl}${rawPath}`;

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
    title,
    description,
    alternates: {
      canonical: rawPath,
      languages: {
        ru: rawPath,
        uz: `/uz${rawPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: 'ru_RU',
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

export default async function FinderPage() {
  const lang: 'ru' = 'ru';
  const pageData = await getPageData();

  const seo = pageData.finder_seo || {};
  const site = pageData.site_settings || {};
  const t = pageData.translations || {};

  const baseUrl = getBaseUrl(site.baseUrl || site.url);
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';
  const title = seo.title?.[lang] || 'Подбор оборудования';
  const description = seo.description?.[lang] || '';

  const rawPath = normalizePath(seo.canonicalPath);
  const homePath = baseUrl;

  const homeLabel = t.breadcrumbHome?.[lang] || 'Главная';
  const pageLabel = t.breadcrumbFinder?.[lang] || 'Подбор оборудования';

  const finderJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${baseUrl}${rawPath}#app`,
        url: `${baseUrl}${rawPath}`,
        name: title,
        inLanguage: 'ru-RU',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        description,
        provider: {
          '@type': 'Organization',
          name: siteName,
          url: baseUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${baseUrl}${rawPath}#breadcrumb`,
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
            name: pageLabel,
            item: `${baseUrl}${rawPath}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(finderJsonLd) }}
      />
      <FinderClient
        lang={lang}
        translations={t}
        content={seo}
        siteSettings={site}
      />
    </>
  );
}