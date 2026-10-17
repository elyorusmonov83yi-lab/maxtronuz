import type { Metadata } from 'next';
import { db } from '@/server/db';
import { ContactClient } from '@/app/contact/ContactClient';

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

async function getContactDataBundle() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings 
       WHERE \`key\` IN ('contact_seo', 'site_settings', 'translations')`
    );

    const bundle: Record<string, any> = {};
    if (rows && rows.length > 0) {
      for (const row of rows) {
        bundle[row.key] = safeJsonParse(row.value);
      }
    }
    return bundle;
  } catch (err) {
    console.error('Kontakt ma’lumotlarini yuklashda xatolik:', err);
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = 'uz';
  const bundle = await getContactDataBundle();

  const seo = bundle.contact_seo || {};
  const site = bundle.site_settings || {};

  const baseUrl = getBaseUrl(site.baseUrl || site.url);
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const rawTitle = seo.title?.[lang] || 'Bog‘lanish va rekvizitlar';
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description =
    seo.description?.[lang] ||
    site.description?.[lang] ||
    "MAXTRON korxonasi bilan bog'lanish: Toshkentdagi manzil, telefonlar, elektron pochta va rasmiy rekvizitlar.";

  const currentPath = '/uz/contact';
  const canonicalUrl = `${baseUrl}${currentPath}`;

  let rawImg = seo.ogImageUrl || site.defaultOgImage || '';
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
      canonical: currentPath,
      languages: {
        ru: '/contact',
        uz: currentPath,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: 'uz_UZ',
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

export default async function UzbekContactPage() {
  const lang = 'uz';
  const bundle = await getContactDataBundle();

  const seo = bundle.contact_seo || {};
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = getBaseUrl(site.baseUrl || site.url);
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const rawTitle = seo.title?.[lang] || 'Bog‘lanish va rekvizitlar';
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description =
    seo.description?.[lang] ||
    site.description?.[lang] ||
    "MAXTRON bilan bog'lanish ma'lumotlari";

  const currentPath = '/uz/contact';
  const homePath = `${baseUrl}/uz`;

  const homeLabel = t.breadcrumbHome?.[lang] || 'Bosh sahifa';
  const contactLabel = t.breadcrumbContact?.[lang] || 'Bog‘lanish';

  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${baseUrl}${currentPath}#webpage`,
        url: `${baseUrl}${currentPath}`,
        name: title,
        inLanguage: 'uz-UZ',
        description,
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
            name: homeLabel,
            item: homePath,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: contactLabel,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <ContactClient
        lang={lang}
        siteSettings={site}
        contactSeo={seo}
        translations={t}
      />
    </>
  );
}