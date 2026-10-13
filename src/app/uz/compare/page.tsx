import type { Metadata } from 'next';
import { db } from '@/server/db';
import { CompareClient } from '@/app/compare/CompareClient';

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

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const rawTitle = seo.title?.[lang] || 'Uskunalarni solishtirish';
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description = seo.description?.[lang] || site.description?.[lang] || '';
  const currentPath = '/uz/compare';

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
      url: currentPath,
      siteName,
      locale: 'uz_UZ',
      type: 'website',
    },
  };
}

export default async function UzComparePage() {
  const lang: 'uz' = 'uz';
  const bundle = await getCompareBundle();

  const seo = bundle.compare_seo || {};
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
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