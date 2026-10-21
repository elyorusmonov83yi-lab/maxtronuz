import type { Metadata } from 'next';
import { db } from '@/server/db';
import AboutClient from './AboutClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params?: Promise<{ locale?: string }>;
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

// Domenni aniqlash
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

    // 1. Asosiy kontent (aboutContent)
    const content = bundle.about || bundle.about_content || {};

    // 2. SEO sozlamalari (Admin panel: pageSeoSettings.about yoki seo.pageSeo.about)
    const rawSeo = bundle.seo || bundle.seo_settings || bundle.page_seo || {};
    const aboutSeo =
      rawSeo?.about ||
      rawSeo?.pageSeo?.about ||
      bundle.about_seo ||
      {};

    return {
      content,
      seo: aboutSeo,
      siteSettings: bundle.site_settings || {},
      translations: bundle.translations || {},
    };
  } catch (err) {
    console.error('About ma’lumotlarini yuklashda xatolik:', err);
    return {
      content: {},
      seo: {},
      siteSettings: {},
      translations: {},
    };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const lang: 'ru' | 'uz' = resolvedParams?.locale === 'uz' ? 'uz' : 'ru';

  const { seo, siteSettings } = await getAboutDataBundle();

  const baseUrl = getBaseUrl(siteSettings.baseUrl || siteSettings.url);
  const siteName = siteSettings.siteName?.[lang] || siteSettings.name || 'MAXTRON';

  // Admin panel: title (uz/ru)
  const rawTitle =
    (typeof seo.title === 'object' ? seo.title?.[lang] : seo.title) ||
    (lang === 'uz' ? 'Kompaniya haqida' : 'О компании');

  const title =
    siteName && !rawTitle.includes(siteName)
      ? `${rawTitle} — ${siteName}`
      : rawTitle;

  // Admin panel: description (uz/ru)
  const description =
    (typeof seo.description === 'object' ? seo.description?.[lang] : seo.description) ||
    siteSettings.description?.[lang] ||
    (lang === 'uz'
      ? 'Toshkentda nazorat-o‘lchov asboblari va sanoat uskunalarini yetkazib berish.'
      : 'Поставки промышленного контрольно-измерительного оборудования в Ташкенте.');

  // Admin panel: keywords (uz/ru)
  const rawKeywords =
    typeof seo.keywords === 'object' ? seo.keywords?.[lang] : seo.keywords || '';
  const keywords =
    typeof rawKeywords === 'string' && rawKeywords.trim()
      ? rawKeywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : [];

  // Admin panel: ogTitle (uz/ru)
  const ogTitle =
    (typeof seo.ogTitle === 'object' ? seo.ogTitle?.[lang] : seo.ogTitle) || title;

  // Admin panel: ogImage
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

  const currentPath = lang === 'uz' ? '/uz/about' : '/about';
  const canonicalUrl = `${baseUrl}${currentPath}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: currentPath,
      languages: {
        ru: '/about',
        uz: '/uz/about',
      },
    },
    openGraph: {
      title: ogTitle,
      description,
      url: canonicalUrl,
      siteName,
      locale: lang === 'uz' ? 'uz_UZ' : 'ru_RU',
      type: 'website',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [imageUrl],
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const resolvedParams = params ? await params : undefined;
  const lang: 'ru' | 'uz' = resolvedParams?.locale === 'uz' ? 'uz' : 'ru';

  const { content, seo, siteSettings, translations } = await getAboutDataBundle();

  const baseUrl = getBaseUrl(siteSettings.baseUrl || siteSettings.url);
  const siteName = siteSettings.siteName?.[lang] || siteSettings.name || 'MAXTRON';

  const rawTitle =
    (typeof seo.title === 'object' ? seo.title?.[lang] : seo.title) ||
    (lang === 'uz' ? 'Kompaniya haqida' : 'О компании');

  const title =
    siteName && !rawTitle.includes(siteName)
      ? `${rawTitle} — ${siteName}`
      : rawTitle;

  const description =
    (typeof seo.description === 'object' ? seo.description?.[lang] : seo.description) ||
    '';

  const currentPath = lang === 'uz' ? '/uz/about' : '/about';
  const homePath = baseUrl;

  const homeLabel = translations.breadcrumbHome?.[lang] || (lang === 'uz' ? 'Bosh sahifa' : 'Главная');
  const aboutLabel = translations.breadcrumbAbout?.[lang] || title;

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${baseUrl}${currentPath}#webpage`,
        url: `${baseUrl}${currentPath}`,
        name: title,
        inLanguage: lang === 'uz' ? 'uz-UZ' : 'ru-RU',
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
            name: aboutLabel,
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