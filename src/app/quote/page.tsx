import { Suspense } from 'react';
import type { Metadata } from 'next';
import { db } from '@/server/db';
import { QuoteClient } from './QuoteClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function safeParse(val: any): Record<string, any> {
  if (!val) return {};
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
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

async function getQuoteSettingsBundle() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings 
       WHERE \`key\` IN ('quote_seo', 'site_settings', 'translations')`
    );

    const bundle: Record<string, any> = {};
    if (rows && rows.length > 0) {
      for (const row of rows) {
        bundle[row.key] = safeParse(row.value);
      }
    }
    return bundle;
  } catch (err) {
    console.error('Quote sozlamalarini yuklashda xatolik:', err);
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const lang: 'ru' = 'ru';
  const bundle = await getQuoteSettingsBundle();
  const seo = bundle.quote_seo || {};
  const site = bundle.site_settings || {};

  const baseUrl = getBaseUrl(site.baseUrl || site.url);
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const title =
    seo.title?.[lang] ||
    seo.seoTitle?.[lang] ||
    'Запрос коммерческого предложения';

  const description =
    seo.description?.[lang] ||
    seo.seoDescription?.[lang] ||
    'Оформить официальный запрос коммерческого предложения на поставку контрольно-измерительных приборов.';

  const canonicalPath = seo.canonicalPath || '/quote';
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  let rawImg =
    seo.ogImage?.[lang] ||
    seo.ogImageUrl ||
    site.defaultOgImage ||
    '';

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

  const keywords = Array.isArray(seo.keywords?.[lang] || seo.keywords)
    ? seo.keywords?.[lang] || seo.keywords
    : (seo.keywords?.[lang] || seo.keywords || '')
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: canonicalPath,
      languages: {
        ru: canonicalPath,
        uz: `/uz${canonicalPath}`,
      },
    },
    openGraph: {
      title: seo.ogTitle?.[lang] || title,
      description: seo.ogDescription?.[lang] || description,
      url: canonicalUrl,
      siteName,
      locale: 'ru_RU',
      images: [
        {
          url: imageUrl,
          width: Number(seo.ogImageWidth) || 1200,
          height: Number(seo.ogImageHeight) || 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: (seo.twitterCard as 'summary' | 'summary_large_image') || 'summary_large_image',
      title: seo.twitterTitle?.[lang] || title,
      description: seo.twitterDescription?.[lang] || description,
      images: [imageUrl],
    },
  };
}

export default async function QuotePage() {
  const lang: 'ru' = 'ru';
  const bundle = await getQuoteSettingsBundle();
  const seo = bundle.quote_seo || {};
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = getBaseUrl(site.baseUrl || site.url);
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const title = seo.title?.[lang] || seo.seoTitle?.[lang] || 'Запрос КП';
  const description = seo.description?.[lang] || seo.seoDescription?.[lang] || '';

  const canonicalPath = seo.canonicalPath || '/quote';
  const homePath = baseUrl;

  const homeBreadcrumb = t.breadcrumbHome?.[lang] || 'Главная';
  const quoteBreadcrumb = t.breadcrumbQuote?.[lang] || title;
  const loadingText = t.loading?.[lang] || 'Загрузка формы...';

  const quoteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${baseUrl}${canonicalPath}#webpage`,
        url: `${baseUrl}${canonicalPath}`,
        name: title,
        inLanguage: 'ru-RU',
        description: description,
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          name: siteName,
          url: baseUrl,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${baseUrl}${canonicalPath}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: homeBreadcrumb,
            item: homePath,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: quoteBreadcrumb,
            item: `${baseUrl}${canonicalPath}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quoteJsonLd) }}
      />
      <Suspense fallback={<div className="py-20 text-center text-xs text-gray-500">{loadingText}</div>}>
        <QuoteClient lang={lang} content={seo} translations={t} siteSettings={site} />
      </Suspense>
    </>
  );
}