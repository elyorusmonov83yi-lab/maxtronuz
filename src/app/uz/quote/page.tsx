import { Suspense } from 'react';
import type { Metadata } from 'next';
import { db } from '@/server/db';
import { QuoteClient } from '@/app/quote/QuoteClient';

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
  const lang: 'uz' = 'uz';
  const bundle = await getQuoteSettingsBundle();
  const seo = bundle.quote_seo || {};
  const site = bundle.site_settings || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const title =
    seo.title?.[lang] ||
    seo.seoTitle?.[lang] ||
    'Tijoriy taklif so‘rovi — MAXTRON';

  const description =
    seo.description?.[lang] ||
    seo.seoDescription?.[lang] ||
    'Sanoat uskunalari va nazorat-o‘lchov asboblari uchun rasmiy tijoriy taklif (KP) olish formasi.';

  const canonicalPath = seo.canonicalPath || '/quote';
  const currentPath = `/uz${canonicalPath}`;

  let imageUrl = seo.ogImage?.[lang] || seo.ogImageUrl || site.defaultOgImage || '';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
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
      canonical: currentPath,
      languages: {
        ru: canonicalPath,
        uz: currentPath,
      },
    },
    openGraph: {
      title: seo.ogTitle?.[lang] || title,
      description: seo.ogDescription?.[lang] || description,
      url: currentPath,
      siteName,
      locale: 'uz_UZ',
      type: 'website',
    },
    twitter: {
      card: (seo.twitterCard as 'summary' | 'summary_large_image') || 'summary_large_image',
      title: seo.twitterTitle?.[lang] || title,
      description: seo.twitterDescription?.[lang] || description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function UzbekQuotePage() {
  const lang: 'uz' = 'uz';
  const bundle = await getQuoteSettingsBundle();
  const seo = bundle.quote_seo || {};
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const title = seo.title?.[lang] || seo.seoTitle?.[lang] || 'Tijoriy taklif so‘rovi';
  const description = seo.description?.[lang] || seo.seoDescription?.[lang] || '';

  const canonicalPath = seo.canonicalPath || '/quote';
  const currentPath = `/uz${canonicalPath}`;
  const homePath = `${baseUrl}/uz`;

  const homeBreadcrumb = t.breadcrumbHome?.[lang] || 'Bosh sahifa';
  const quoteBreadcrumb = t.breadcrumbQuote?.[lang] || title;
  const loadingText = t.loading?.[lang] || 'Yuklanmoqda...';

  const quoteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${baseUrl}${currentPath}#webpage`,
        url: `${baseUrl}${currentPath}`,
        name: title,
        inLanguage: 'uz-UZ',
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
        '@id': `${baseUrl}${currentPath}#breadcrumb`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quoteJsonLd) }}
      />
      <Suspense fallback={<div className="py-20 text-center text-xs text-gray-500">{loadingText}</div>}>
        <QuoteClient lang={lang} content={seo} translations={t} siteSettings={site} />
      </Suspense>
    </>
  );
}