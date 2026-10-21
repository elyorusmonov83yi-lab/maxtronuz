import type { Metadata } from 'next';
import { db } from '@/server/db';
import AboutClient from '@/app/about/AboutClient';

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

async function getAboutDataBundle() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings 
       WHERE \`key\` IN ('about', 'about_content', 'seo', 'seo_settings', 'page_seo', 'site_settings', 'translations')`
    );

    const bundle: Record<string, any> = {};
    if (rows && rows.length > 0) {
      for (const row of rows) {
        bundle[row.key] = safeJsonParse(row.value);
      }
    }

    // 1. Asosiy kontent
    const content = bundle.about || bundle.about_content || {};

    // 2. SEO sozlamalari (Admin panel: pageSeo.about)
    const rawSeo = bundle.seo || bundle.seo_settings || bundle.page_seo || {};
    const aboutSeo =
      rawSeo?.pageSeo?.about ||
      rawSeo?.about ||
      bundle.about_seo ||
      {};

    return {
      content,
      seo: aboutSeo,
      siteSettings: bundle.site_settings || {},
      translations: bundle.translations || {},
    };
  } catch (err) {
    console.error('UZ About ma’lumotlarini yuklashda xatolik:', err);
    return {
      content: {},
      seo: {},
      siteSettings: {},
      translations: {},
    };
  }
}

function normalizePath(path: string): string {
  if (!path) return '/uz/about';
  return path.startsWith('/') ? path : `/${path}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = 'uz';
  const { seo, siteSettings } = await getAboutDataBundle();

  const baseUrl = getBaseUrl(siteSettings.baseUrl || siteSettings.url);
  const siteName = siteSettings.siteName?.[lang] || siteSettings.name || 'MAXTRON';

  // Admin panel: pageSeo.about.title.uz
  const rawTitle =
    (typeof seo.title === 'object' ? seo.title?.[lang] : seo.title) ||
    'Biz haqimizda — MAXTRON';

  const title =
    siteName && !rawTitle.includes(siteName)
      ? `${rawTitle} — ${siteName}`
      : rawTitle;

  // Admin panel: pageSeo.about.description.uz
  const description =
    (typeof seo.description === 'object' ? seo.description?.[lang] : seo.description) ||
    siteSettings.description?.[lang] ||
    'Toshkentda nazorat-o‘lchov asboblari va sanoat avtomatikasini yetkazib berish.';

  // Admin panel: pageSeo.about.keywords.uz
  const rawKeywords =
    typeof seo.keywords === 'object' ? seo.keywords?.[lang] : seo.keywords || '';
  const keywords =
    typeof rawKeywords === 'string' && rawKeywords.trim()
      ? rawKeywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : [];

  // Admin panel: pageSeo.about.ogTitle.uz
  const ogTitle =
    (typeof seo.ogTitle === 'object' ? seo.ogTitle?.[lang] : seo.ogTitle) || title;

  // Admin panel: pageSeo.about.ogDescription.uz
  const ogDescription =
    (typeof seo.ogDescription === 'object' ? seo.ogDescription?.[lang] : seo.ogDescription) || description;

  // Admin panel: pageSeo.about.ogImage
  let rawImg =
    seo.ogImage ||
    seo.ogImageUrl ||
    siteSettings.defaultOgImage ||
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

  const rawPath = normalizePath(seo.canonicalPath || '/uz/about');
  const canonicalUrl = `${baseUrl}${rawPath}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: rawPath,
      languages: {
        ru: '/about',
        uz: '/uz/about',
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonicalUrl,
      siteName,
      locale: 'uz_UZ',
      type: 'website',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: Number(seo.ogImageWidth) || 1200,
          height: Number(seo.ogImageHeight) || 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [imageUrl],
    },
  };
}

export default async function AboutPageUz() {
  const lang = 'uz';
  const { content, seo, siteSettings, translations } = await getAboutDataBundle();

  const baseUrl = getBaseUrl(siteSettings.baseUrl || siteSettings.url);
  const siteName = siteSettings.siteName?.[lang] || siteSettings.name || 'MAXTRON';

  const rawTitle =
    (typeof seo.title === 'object' ? seo.title?.[lang] : seo.title) ||
    'Biz haqimizda — MAXTRON';

  const title =
    siteName && !rawTitle.includes(siteName)
      ? `${rawTitle} — ${siteName}`
      : rawTitle;

  const description =
    (typeof seo.description === 'object' ? seo.description?.[lang] : seo.description) ||
    '';

  const rawPath = normalizePath(seo.canonicalPath || '/uz/about');
  const homePath = `${baseUrl}/uz`;

  const homeLabel = translations.breadcrumbHome?.[lang] || 'Bosh sahifa';
  const aboutLabel = translations.breadcrumbAbout?.[lang] || title;

  // Schema.org Structured Data
  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${baseUrl}${rawPath}#webpage`,
        url: `${baseUrl}${rawPath}`,
        name: title,
        inLanguage: 'uz-UZ',
        description,
        mainEntity: {
          '@type': 'Organization',
          '@id': `${baseUrl}/#organization`,
          name: siteName,
          url: baseUrl,
          logo: siteSettings.logoUrl
            ? `${baseUrl}/${siteSettings.logoUrl.replace(/^\/+/, '')}`
            : undefined,
          description,
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
            name: aboutLabel,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <AboutClient
        lang={lang}
        content={content}
        seo={seo}
        siteSettings={siteSettings}
        translations={translations}
      />
    </>
  );
}