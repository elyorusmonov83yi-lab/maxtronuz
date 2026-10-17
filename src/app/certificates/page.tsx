import type { Metadata } from 'next';
import { db } from '@/server/db';
import { CertificatesClient } from './CertificatesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function safeParse(val: any): any {
  if (!val) return null;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }
  return null;
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

async function getCertificatesDataBundle() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings 
       WHERE \`key\` IN ('certificates', 'site_certificates', 'certificates_seo', 'site_settings', 'translations')`
    );

    const bundle: Record<string, any> = {};
    if (rows && rows.length > 0) {
      for (const row of rows) {
        bundle[row.key] = safeParse(row.value);
      }
    }

    const certificatesList = bundle.certificates || bundle.site_certificates || [];

    return {
      certificates: Array.isArray(certificatesList) ? certificatesList : [],
      seo: bundle.certificates_seo || {},
      siteSettings: bundle.site_settings || {},
      translations: bundle.translations || {},
    };
  } catch (err) {
    console.error('Certificates bundle yuklashda xatolik:', err);
    return {
      certificates: [],
      seo: {},
      siteSettings: {},
      translations: {},
    };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const lang: 'ru' = 'ru';
  const { seo, siteSettings } = await getCertificatesDataBundle();

  const baseUrl = getBaseUrl(siteSettings.baseUrl || siteSettings.url);
  const siteName = siteSettings.siteName?.[lang] || siteSettings.name || 'MAXTRON';

  const title =
    seo.title?.[lang] ||
    seo.seoTitle?.[lang] ||
    'Сертификаты и лицензии — MAXTRON';

  const description =
    seo.description?.[lang] ||
    seo.seoDescription?.[lang] ||
    'Свидетельства Госреестра Узстандарт, сертификаты ISO 9001 и разрешительная документация на поставляемое контрольно-измерительное оборудование.';

  const canonicalPath = '/certificates';
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  let rawImg = seo.ogImageUrl || siteSettings.defaultOgImage || '';
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

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        ru: canonicalPath,
        uz: `/uz${canonicalPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: 'ru_RU',
      type: 'website',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CertificatesPage() {
  const lang: 'ru' = 'ru';
  const { certificates, siteSettings, translations } = await getCertificatesDataBundle();

  const baseUrl = getBaseUrl(siteSettings.baseUrl || siteSettings.url);
  const siteName = siteSettings.siteName?.[lang] || siteSettings.name || 'MAXTRON';

  const currentPath = '/certificates';
  const homePath = baseUrl;

  const homeBreadcrumb = translations.breadcrumbHome?.[lang] || 'Главная';
  const certsBreadcrumb = translations.breadcrumb_certificates?.[lang] || 'Сертификаты';

  const certsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}${currentPath}#webpage`,
        url: `${baseUrl}${currentPath}`,
        name: 'Сертификаты и разрешительная документация MAXTRON',
        inLanguage: 'ru-RU',
        description: 'Официальные свидетельства и сертификаты соответствия Узстандарт.',
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
            name: certsBreadcrumb,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(certsJsonLd) }}
      />
      <CertificatesClient 
        lang={lang} 
        initialCertificates={certificates} 
      />
    </>
  );
}