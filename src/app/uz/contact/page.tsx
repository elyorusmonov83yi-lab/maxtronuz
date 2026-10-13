import type { Metadata } from 'next';
import { db } from '@/server/db';
import { ContactClient } from '@/app/contact/ContactClient';

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
  const lang = 'uz'; // <-- O'ZBEK TILI
  const bundle = await getContactDataBundle();

  const seo = bundle.contact_seo || {};
  const site = bundle.site_settings || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const rawTitle = seo.title?.[lang] || (lang === 'uz' ? 'Aloqa va manzil' : siteName);
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description =
    seo.description?.[lang] ||
    site.description?.[lang] ||
    "MAXTRON korxonasi bilan bog'lanish: telefonlar, manzil va rekvizitlar.";

  const currentPath = '/uz/contact';

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: `${baseUrl}${currentPath}`,
      languages: {
        ru: `${baseUrl}/contact`,
        uz: `${baseUrl}/uz/contact`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${currentPath}`,
      siteName,
      locale: 'uz_UZ',
      type: 'website',
    },
  };
}

export default async function UzbekContactPage() {
  const lang = 'uz'; // <-- O'ZBEK TILI
  const bundle = await getContactDataBundle();

  const seo = bundle.contact_seo || {};
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const rawTitle = seo.title?.[lang] || (lang === 'uz' ? 'Bog‘lanish' : siteName);
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
      {/* ContactClient ga aynan lang="uz" uzatiladi */}
      <ContactClient
        lang={lang}
        siteSettings={site}
        contactSeo={seo}
        translations={t}
      />
    </>
  );
}