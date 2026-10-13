import { Metadata } from 'next';
import { db } from '@/server/db';
import HomePageClient from './HomePageClient';

type Props = {
  params?: Promise<{ locale?: string }>;
};

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

// Baza orqali umumiy sayt va bosh sahifa sozlamalarini olish
async function getSettingsBundle() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings 
       WHERE \`key\` IN ('home', 'site_settings')`
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
  const seo = bundle.home || {};
  const site = bundle.site_settings || {};

  const baseUrl = site.baseUrl || site.url || '';
  const siteName = site.siteName?.[lang] || site.name || '';

  // Barcha matnlar faqat bazadan olinadi (statik so'z yo'q)
  const title =
    seo.seoTitle?.[lang] ||
    seo.title?.[lang] ||
    seo.heroTitle?.[lang] ||
    siteName;

  const description =
    seo.seoDescription?.[lang] ||
    seo.description?.[lang] ||
    seo.heroSubtitle?.[lang] ||
    '';

  let imageUrl = seo.ogImage?.[lang] || seo.ogImageUrl || site.defaultOgImage || '';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  const currentPath = lang === 'uz' ? '/uz' : '/';

  return {
    ...(baseUrl ? { metadataBase: new URL(baseUrl) } : {}),
    title,
    description,
    alternates: {
      canonical: currentPath,
      languages: {
        ru: '/',
        uz: '/uz',
      },
    },
    openGraph: {
      title,
      description,
      url: currentPath,
      siteName,
      locale: lang === 'uz' ? 'uz_UZ' : 'ru_RU',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: Number(seo.ogImageWidth) || 1200,
              height: Number(seo.ogImageHeight) || 630,
              alt: title,
            },
          ]
        : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function HomePage({ params }: Props) {
  const resolvedParams = params ? await params : undefined;
  const lang: 'ru' | 'uz' = resolvedParams?.locale === 'uz' ? 'uz' : 'ru';

  const bundle = await getSettingsBundle();
  const seo = bundle.home || {};
  const site = bundle.site_settings || {};

  const baseUrl = site.baseUrl || site.url || '';
  const siteName = site.siteName?.[lang] || site.name || '';
  const siteDesc = site.description?.[lang] || seo.description?.[lang] || '';

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

  // Schema.org: Organization va WebSite ham to'liq bazadagi ma'lumotlar bilan to'ldiriladi
  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: siteName,
        url: baseUrl,
        logo: site.logoUrl ? `${baseUrl}${site.logoUrl.startsWith('/') ? '' : '/'}${site.logoUrl}` : undefined,
        description: siteDesc,
        address: site.address
          ? {
              '@type': 'PostalAddress',
              streetAddress: site.address.street?.[lang] || site.address.street || '',
              addressLocality: site.address.city?.[lang] || site.address.city || '',
              addressCountry: site.address.country || 'UZ',
            }
          : undefined,
        contactPoint: site.phone
          ? {
              '@type': 'ContactPoint',
              telephone: site.phone,
              contactType: site.contactType || 'customer service',
              areaServed: site.areaServed || 'UZ',
              availableLanguage: site.languages || ['Russian', 'Uzbek'],
            }
          : undefined,
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
          target: `${baseUrl}/search?q={search_term_string}`,
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
        siteSettings={site}
      />
    </>
  );
}