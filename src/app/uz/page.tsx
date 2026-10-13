import { Metadata } from 'next';
import { db } from '@/server/db';
import HomePageClient from '@/app/HomePageClient';

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

// Baza orqali sozlamalarni olish
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

export async function generateMetadata(): Promise<Metadata> {
  const lang: 'uz' = 'uz';

  const bundle = await getSettingsBundle();
  const seo = bundle.home || {};
  const site = bundle.site_settings || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.uz || site.name || 'MAXTRON';

  // O'zbek tili uchun dinamik SEO
  const title =
    seo.seoTitle?.uz ||
    seo.title?.uz ||
    seo.heroTitle?.uz ||
    siteName;

  const description =
    seo.seoDescription?.uz ||
    seo.description?.uz ||
    seo.heroSubtitle?.uz ||
    '';

  let imageUrl = seo.ogImage?.uz || seo.ogImageUrl || site.defaultOgImage || '';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
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
    openGraph: {
      title,
      description,
      url: currentPath,
      siteName,
      locale: 'uz_UZ',
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

export default async function UzbekHomePage() {
  const lang: 'uz' = 'uz';

  const bundle = await getSettingsBundle();
  const seo = bundle.home || {};
  const site = bundle.site_settings || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.uz || site.name || 'MAXTRON';
  const siteDesc = site.description?.uz || seo.description?.uz || '';

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

  // Schema.org: O'zbek sahifasi uchun
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
          target: `${baseUrl}/uz/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
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
              streetAddress: site.address.street?.uz || site.address.street || '',
              addressLocality: site.address.city?.uz || site.address.city || '',
              addressCountry: site.address.country || 'UZ',
            }
          : undefined,
        contactPoint: site.phone
          ? {
              '@type': 'ContactPoint',
              telephone: site.phone,
              contactType: site.contactType || 'customer service',
              areaServed: site.areaServed || 'UZ',
              availableLanguage: ['Uzbek', 'Russian'],
            }
          : undefined,
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