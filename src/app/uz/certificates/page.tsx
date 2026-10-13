import type { Metadata } from 'next';
import { db } from '@/server/db';
import { CertificatesClient } from '@/app/certificates/CertificatesClient';

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

async function getCertificatesSeoBundle() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings 
       WHERE \`key\` IN ('certificates_seo', 'site_settings', 'translations')`
    );

    const bundle: Record<string, any> = {};
    if (rows && rows.length > 0) {
      for (const row of rows) {
        bundle[row.key] = safeParse(row.value);
      }
    }
    return bundle;
  } catch (err) {
    console.error('Certificates SEO bundle yuklashda xatolik:', err);
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const lang: 'uz' = 'uz';
  const bundle = await getCertificatesSeoBundle();
  const seo = bundle.certificates_seo || {};
  const site = bundle.site_settings || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const title =
    seo.title?.[lang] ||
    seo.seoTitle?.[lang] ||
    'Sertifikatlar va litsenziyalar — MAXTRON';

  const description =
    seo.description?.[lang] ||
    seo.seoDescription?.[lang] ||
    "O'zstandart Davlat reestri guvohliklari, ISO 9001 sertifikatlari va yetkazib beriladigan nazorat-o'lchov uskunalarining ruxsatnomalari.";

  const canonicalPath = '/uz/certificates';

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
      url: canonicalPath,
      siteName,
      locale: 'uz_UZ',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function UzbekCertificatesPage() {
  const lang: 'uz' = 'uz';
  const bundle = await getCertificatesSeoBundle();
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const currentPath = '/uz/certificates';
  const homePath = `${baseUrl}/uz`;

  const homeBreadcrumb = t.breadcrumbHome?.[lang] || 'Bosh sahifa';
  const certsBreadcrumb = t.breadcrumb_certificates?.[lang] || 'Sertifikatlar';

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
      <CertificatesClient lang={lang} />
    </>
  );
}