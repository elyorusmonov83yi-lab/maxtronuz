import type { Metadata } from 'next';
import { db } from '@/server/db';
import { FinderClient } from './FinderClient';

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

function normalizePath(path: string): string {
  if (!path) return '/equipment-finder';
  return path.startsWith('/') ? path : `/${path}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang: 'ru' = 'ru';
  const pageData = await getPageData();

  const seo = pageData.finder_seo || {};
  const site = pageData.site_settings || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const rawTitle = seo.title?.[lang] || 'Подбор оборудования — Интерактивный конфигуратор';
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description = seo.description?.[lang] || 'Онлайн конфигуратор для точного подбора контрольно-измерительных приборов и датчиков.';
  const rawPath = normalizePath(seo.canonicalPath);

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
      url: rawPath,
      siteName,
      locale: 'ru_RU',
      type: 'website',
    },
  };
}

export default async function FinderPage() {
  const lang: 'ru' = 'ru';
  const pageData = await getPageData();

  const seo = pageData.finder_seo || {};
  const site = pageData.site_settings || {};
  const t = pageData.translations || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
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