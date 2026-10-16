import type { Metadata } from 'next';
import { db } from '@/server/db';
import { CertificatesClient } from '@/app/certificates/CertificatesClient';

export const dynamic = 'force-dynamic';

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
  const lang: 'uz' = 'uz';
  const { seo, siteSettings } = await getCertificatesDataBundle();

  const baseUrl = (siteSettings.baseUrl || siteSettings.url || 'https://maxtron.uz').replace(/\/+$/, '');
  const siteName = siteSettings.siteName?.[lang] || siteSettings.name || 'MAXTRON';

  const title =
    seo.title?.[lang] ||
    seo.seoTitle?.[lang] ||
    'Sertifikatlar va litsenziyalar — MAXTRON';

  const description =
    seo.description?.[lang] ||
    seo.seoDescription?.[lang] ||
    "O'zstandart Davlat reestri guvohliklari, ISO 9001 sertifikatlari va yetkazib beriladigan nazorat-o'lchov uskunalarining ruxsatnomalari.";

  const canonicalPath = '/uz/certificates';
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  let imageUrl = seo.ogImageUrl || siteSettings.defaultOgImage || 'https://maxtron.uz/og-image.jpg';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: {
        ru: '/certificates',
        uz: canonicalPath,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: 'uz_UZ',
      type: 'website',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              secureUrl: imageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function UzbekCertificatesPage() {
  const lang: 'uz' = 'uz';
  const { certificates, siteSettings, translations } = await getCertificatesDataBundle();

  const baseUrl = (siteSettings.baseUrl || siteSettings.url || 'https://maxtron.uz').replace(/\/+$/, '');
  const siteName = siteSettings.siteName?.[lang] || siteSettings.name || 'MAXTRON';

  const currentPath = '/uz/certificates';
  const homePath = `${baseUrl}/uz`;

  const homeBreadcrumb = translations.breadcrumbHome?.[lang] || 'Bosh sahifa';
  const certsBreadcrumb = translations.breadcrumb_certificates?.[lang] || 'Sertifikatlar';

  const certsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}${currentPath}#webpage`,
        url: `${baseUrl}${currentPath}`,
        name: 'MAXTRON sertifikatlari va ruxsat beruvchi hujjatlari',
        inLanguage: 'uz-UZ',
        description: "Rasmiy O'zstandart muvofiqlik va qiyoslash guvohnomalari.",
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