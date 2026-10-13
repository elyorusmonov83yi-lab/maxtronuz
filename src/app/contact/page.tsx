import type { Metadata } from 'next';
import { db } from '@/server/db';
import { ContactClient } from './ContactClient';

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

  const baseUrl = site.baseUrl || site.url || '';
  const siteName = site.siteName?.[lang] || site.name || '';

  const rawTitle = seo.title?.[lang] || siteName;
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description = seo.description?.[lang] || site.description?.[lang] || '';
  const keywords = Array.isArray(seo.keywords?.[lang] || seo.keywords)
    ? seo.keywords?.[lang] || seo.keywords
    : (seo.keywords?.[lang] || seo.keywords || '')
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);

  let imageUrl = seo.ogImageUrl || site.defaultOgImage || '';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  const rawPath = normalizePath(seo.canonicalPath || '/contact');
  const currentPath = lang === 'uz' ? `/uz${rawPath}` : rawPath;

  return {
    ...(baseUrl ? { metadataBase: new URL(baseUrl) } : {}),
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

export default async function ContactPage({ params }: Props) {
  const resolvedParams = await params;
  const lang: 'ru' | 'uz' = resolvedParams?.locale === 'uz' ? 'uz' : 'ru';
  const bundle = await getContactDataBundle();

  const seo = bundle.contact_seo || {};
  const site = bundle.site_settings || {};
  const t = bundle.translations || {};

  const baseUrl = site.baseUrl || site.url || '';
  const siteName = site.siteName?.[lang] || site.name || '';
  const title = seo.title?.[lang] || siteName;
  const description = seo.description?.[lang] || site.description?.[lang] || '';

  const rawPath = normalizePath(seo.canonicalPath || '/contact');
  const currentPath = lang === 'uz' ? `/uz${rawPath}` : rawPath;
  const homePath = lang === 'uz' ? `${baseUrl}/uz` : baseUrl;

  const homeLabel = t.breadcrumbHome?.[lang] || '';
  const contactLabel = t.breadcrumbContact?.[lang] || title;

  // Google uchun Schema.org (ContactPage + LocalBusiness + BreadcrumbList) — statik so‘zlarsiz
  const contactJsonLd = baseUrl
    ? {
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
            logo: site.logoUrl ? `${baseUrl}${site.logoUrl.startsWith('/') ? '' : '/'}${site.logoUrl}` : undefined,
            image: site.defaultOgImage ? `${baseUrl}${site.defaultOgImage.startsWith('/') ? '' : '/'}${site.defaultOgImage}` : undefined,
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
      }
    : null;

  return (
    <>
      {contactJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
        />
      )}
      <ContactClient
        lang={lang}
        siteSettings={site}
        contactSeo={seo}
        translations={t}
      />
    </>
  );
}