import type { Metadata } from 'next';
import { db } from '@/server/db';
import { ContactClient } from './ContactClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ locale?: string }>;
};

// Xavfsiz JSON parser
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

// Bazadan sayt sozlamalari, aloqa SEO va tarjimalarni olish
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

function normalizePath(path: string): string {
  if (!path) return '/contact';
  return path.startsWith('/') ? path : `/${path}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const lang: 'ru' | 'uz' = resolvedParams?.locale === 'uz' ? 'uz' : 'ru';
  const bundle = await getContactDataBundle();

  const seo = bundle.contact_seo || {};
  const site = bundle.site_settings || {};

  const baseUrl = getBaseUrl(site.baseUrl || site.url);
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const defaultTitle = lang === 'uz' ? 'Bog‘lanish va Rekvizitlar' : 'Контакты и реквизиты';
  const rawTitle = seo.title?.[lang] || defaultTitle;
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description =
    seo.description?.[lang] ||
    site.description?.[lang] ||
    (lang === 'uz'
      ? 'MAXTRON kompaniyasi bilan bog‘lanish: Toshkent shahridagi manzil, telefon raqamlari, elektron pochta va rekvizitlar.'
      : 'Свяжитесь с компанией MAXTRON: контакты офиса в Ташкенте, телефоны отдела продаж, email и официальные реквизиты.');

  const keywords = Array.isArray(seo.keywords?.[lang] || seo.keywords)
    ? seo.keywords?.[lang] || seo.keywords
    : (seo.keywords?.[lang] || seo.keywords || '')
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);

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

  const rawPath = normalizePath(seo.canonicalPath || '/contact');
  const currentPath = lang === 'uz' ? `/uz${rawPath}` : rawPath;
  const canonicalUrl = `${baseUrl}${currentPath}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: {
      canonical: currentPath,
      languages: {
        ru: rawPath,
        uz: `/uz${rawPath}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: lang === 'uz' ? 'uz_UZ' : 'ru_RU',
      type: 'website',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: Number(seo.ogImageWidth) || 1200,
          height: Number(seo.ogImageHeight) || 630,
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

export default async function ContactPage({ params }: Props) {
  const resolvedParams = await params;
  const lang: 'ru' | 'uz' = resolvedParams?.locale === 'uz' ? 'uz' : 'ru';
  const bundle = await getContactDataBundle();

  const seo = bundle.contact_seo || {};
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = getBaseUrl(site.baseUrl || site.url);
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const defaultTitle = lang === 'uz' ? 'Bog‘lanish va Rekvizitlar' : 'Контакты и реквизиты';
  const title = seo.title?.[lang] || defaultTitle;
  const description =
    seo.description?.[lang] ||
    site.description?.[lang] ||
    (lang === 'uz'
      ? 'MAXTRON kompaniyasi bilan bog‘lanish: Toshkent shahridagi manzil, telefon raqamlari, elektron pochta va rekvizitlar.'
      : 'Свяжитесь с компанией MAXTRON: контакты офиса в Ташкенте, телефоны отдела продаж, email и официальные реквизиты.');

  const rawPath = normalizePath(seo.canonicalPath || '/contact');
  const currentPath = lang === 'uz' ? `/uz${rawPath}` : rawPath;
  const homePath = lang === 'uz' ? `${baseUrl}/uz` : baseUrl;

  const homeLabel = t.breadcrumbHome?.[lang] || (lang === 'uz' ? 'Bosh sahifa' : 'Главная');
  const contactLabel = t.breadcrumbContact?.[lang] || (lang === 'uz' ? 'Kontaktlar' : 'Контакты');

  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': `${baseUrl}${currentPath}#webpage`,
        url: `${baseUrl}${currentPath}`,
        name: title,
        inLanguage: lang === 'uz' ? 'uz-UZ' : 'ru-RU',
        description,
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          name: siteName,
          url: baseUrl,
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${baseUrl}/#business`,
        name: siteName,
        url: baseUrl,
        logo: site.logoUrl ? `${baseUrl}/${site.logoUrl.replace(/^\/+/, '')}` : undefined,
        image: site.defaultOgImage ? `${baseUrl}/${site.defaultOgImage.replace(/^\/+/, '')}` : `${baseUrl}/og-image.jpg`,
        telephone: site.phone || undefined,
        email: site.email || undefined,
        address: site.address
          ? {
              '@type': 'PostalAddress',
              streetAddress: site.address.street?.[lang] || site.address.street || '',
              addressLocality: site.address.city?.[lang] || site.address.city || '',
              postalCode: site.address.postalCode || undefined,
              addressCountry: site.address.country || 'UZ',
            }
          : undefined,
        geo: site.geo
          ? {
              '@type': 'GeoCoordinates',
              latitude: site.geo.lat,
              longitude: site.geo.lng,
            }
          : undefined,
        openingHoursSpecification: site.openingHours
          ? [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: site.openingHours.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: site.openingHours.opens || '09:00',
                closes: site.openingHours.closes || '18:00',
              },
            ]
          : undefined,
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