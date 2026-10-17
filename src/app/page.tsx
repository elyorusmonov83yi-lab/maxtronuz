import { Metadata } from 'next';
import { db } from '@/server/db';
import HomePageClient from './HomePageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params?: Promise<{ locale?: string }>;
};

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
  // Agar ataylab .env o'rnatilgan bo'lsa
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  // Vercel Production domeni
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  // Vercel joriy domeni (masalan maxtronuz.vercel.app)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Agar bazada bor bo'lsa va yuqoridagilar bo'lmasa
  if (canonicalFromDb && canonicalFromDb.trim().startsWith('http')) {
    return canonicalFromDb.trim().replace(/\/+$/, '');
  }
  return 'https://maxtron.uz';
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const lang: 'ru' | 'uz' = resolvedParams?.locale === 'uz' ? 'uz' : 'ru';

  const bundle = await getSettingsBundle();
  const home = bundle.home || {};
  const site = bundle.site_settings || {};
  const seoSettings = bundle.seo || {};

  const baseUrl = getBaseUrl(home.canonicalUrl);
  const siteName =
    site.siteName?.[lang] ||
    home.heroTitle?.[lang] ||
    'MAXTRON';

  const title =
    home.seoTitle?.[lang] ||
    home.ogTitle?.[lang] ||
    home.heroTitle?.[lang] ||
    siteName;

  const description =
    home.seoDescription?.[lang] ||
    home.ogDescription?.[lang] ||
    home.heroSubtitle?.[lang] ||
    'Поставки промышленного и измерительного оборудования в Ташкенте';

  // OG rasmni aniqlash
  let rawImage =
    home.ogImage?.[lang] ||
    home.ogImage?.[lang === 'ru' ? 'uz' : 'ru'] ||
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
    // Agar bazada rasm belgilanmagan bo'lsa, zaxiradagi default rasm
    imageUrl = `${baseUrl}/og-image.jpg`;
  }

  const currentPath = lang === 'uz' ? '/uz' : '/';

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
      locale: lang === 'uz' ? 'uz_UZ' : 'ru_RU',
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

export default async function HomePage({ params }: Props) {
  const resolvedParams = params ? await params : undefined;
  const lang: 'ru' | 'uz' = resolvedParams?.locale === 'uz' ? 'uz' : 'ru';

  const bundle = await getSettingsBundle();
  const home = bundle.home || {};
  const site = bundle.site_settings || {};

  const baseUrl = getBaseUrl(home.canonicalUrl);
  const siteName =
    site.siteName?.[lang] ||
    home.heroTitle?.[lang] ||
    'MAXTRON';

  const siteDesc =
    home.seoDescription?.[lang] ||
    home.heroSubtitle?.[lang] ||
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
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: siteName,
        url: baseUrl,
        description: siteDesc,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: home.ctaPhone || '+998712008844',
          contactType: 'customer service',
          areaServed: 'UZ',
          availableLanguage: ['Russian', 'Uzbek'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: siteName,
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/catalog?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
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