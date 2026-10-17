import { Metadata } from 'next';
import { db } from '@/server/db';
import HomePageClient from '@/app/HomePageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Xavfsiz JSON parser
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
function getBaseUrl(canonicalFromDb?: string): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (canonicalFromDb && canonicalFromDb.trim().startsWith('http')) {
    return canonicalFromDb.trim().replace(/\/+$/, '');
  }
  return 'https://maxtron.uz';
}

// Baza orqali sozlamalarni olish
async function getSettingsBundle() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings 
       WHERE \`key\` IN ('home', 'site_settings', 'seo')`
    );

    const bundle: Record<string, any> = {};
    if (rows && rows.length > 0) {
      for (const row of rows) {
        bundle[row.key] = safeParse(row.value);
      }
    }
    return bundle;
  } catch (err) {
    console.error('Sozlamalarni yuklashda xatolik:', err);
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const lang: 'uz' = 'uz';

  const bundle = await getSettingsBundle();
  const home = bundle.home || {};
  const site = bundle.site_settings || {};
  const seoSettings = bundle.seo || {};

  const baseUrl = getBaseUrl(home.canonicalUrl);
  const siteName =
    site.siteName?.uz ||
    home.heroTitle?.uz ||
    'MAXTRON';

  const title =
    home.seoTitle?.uz ||
    home.ogTitle?.uz ||
    home.heroTitle?.uz ||
    siteName;

  const description =
    home.seoDescription?.uz ||
    home.ogDescription?.uz ||
    home.heroSubtitle?.uz ||
    "Toshkentda sanoat va o'lchov uskunalarini yetkazib berish";

  let rawImage =
    home.ogImage?.uz ||
    home.ogImage?.ru ||
    (typeof home.ogImage === 'string' ? home.ogImage : '') ||
    site.defaultOgImage ||
    '';

  if (typeof rawImage === 'string' && rawImage.startsWith('data:')) {
    rawImage = '';
  }

  let imageUrl = '';
  if (rawImage) {
    imageUrl = rawImage.startsWith('http')
      ? rawImage
      : `${baseUrl}/${rawImage.replace(/^\/+/, '')}`;
  } else {
    imageUrl = `${baseUrl}/og-image.jpg`;
  }

  const currentPath = '/uz';

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: currentPath,
      languages: {
        ru: '/',
        uz: '/uz',
      },
    },
    verification: {
      google: seoSettings.googleVerification || undefined,
      yandex: seoSettings.yandexVerification || undefined,
    },
    openGraph: {
      title,
      description,
      url: currentPath,
      siteName,
      locale: 'uz_UZ',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function UzbekHomePage() {
  const lang: 'uz' = 'uz';

  const bundle = await getSettingsBundle();
  const home = bundle.home || {};
  const site = bundle.site_settings || {};

  const baseUrl = getBaseUrl(home.canonicalUrl);
  const siteName =
    site.siteName?.uz ||
    home.heroTitle?.uz ||
    'MAXTRON';

  const siteDesc =
    home.seoDescription?.uz ||
    home.heroSubtitle?.uz ||
    '';

  let products: any[] = [];
  let categories: any[] = [];

  try {
    const [catRows]: any = await db.query(
      'SELECT * FROM categories ORDER BY id ASC'
    );
    categories = (catRows || []).map((cat: any) => ({
      ...cat,
      name: safeParse(cat.name),
      description: safeParse(cat.description),
    }));

    const [prodRows]: any = await db.query(
      'SELECT * FROM products ORDER BY id DESC LIMIT 20'
    );
    products = (prodRows || []).map((prod: any) => ({
      ...prod,
      name: safeParse(prod.name),
      description: safeParse(prod.description),
      specifications: safeParse(prod.specifications),
    }));
  } catch (err) {
    console.error('Home data error:', err);
  }

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/uz/#website`,
        url: `${baseUrl}/uz`,
        name: siteName,
        inLanguage: 'uz-UZ',
        description: siteDesc,
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/uz/catalog?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: siteName,
        url: baseUrl,
        description: siteDesc,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: home.ctaPhone || '+998 70 049-99-00',
          contactType: 'customer service',
          areaServed: 'UZ',
          availableLanguage: ['Uzbek', 'Russian'],
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <HomePageClient
        currentLang={lang}
        initialProducts={products}
        initialCategories={categories}
        siteSettings={{
          ...site,
          home,
          homeContent: home,
        }}
      />
    </>
  );
}