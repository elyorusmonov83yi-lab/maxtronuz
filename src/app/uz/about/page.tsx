import type { Metadata } from 'next';
import { db } from '@/server/db';
import AboutClient from '@/app/about/AboutClient';

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

async function getAboutDataBundle() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings 
       WHERE \`key\` IN ('about', 'about_content', 'about_seo', 'site_settings', 'translations', 'seo_settings')`
    );

    const bundle: Record<string, any> = {};
    if (rows && rows.length > 0) {
      for (const row of rows) {
        bundle[row.key] = safeJsonParse(row.value);
      }
    }

    const content = bundle.about || bundle.about_content || {};
    const seo = bundle.about_seo || bundle.seo_settings?.pageSeo?.about || {};

    return {
      content,
      seo,
      siteSettings: bundle.site_settings || {},
      translations: bundle.translations || {}
    };
  } catch (err) {
    console.error('Kompaniya ma’lumotlarini yuklashda xatolik:', err);
    return {
      content: {},
      seo: {},
      siteSettings: {},
      translations: {}
    };
  }
}

function normalizePath(path: string): string {
  if (!path) return '/about';
  return path.startsWith('/') ? path : `/${path}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang: 'uz' = 'uz';
  const { seo, siteSettings } = await getAboutDataBundle();

  const baseUrl = siteSettings.baseUrl || siteSettings.url || 'https://maxtron.uz';
  const siteName = siteSettings.siteName?.[lang] || siteSettings.name || 'MAXTRON';

  const rawTitle = seo.title?.[lang] || (lang === 'uz' ? 'Kompaniya haqida' : 'О компании');
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description = seo.description?.[lang] || siteSettings.description?.[lang] || "MAXTRON korxonasi haqida ma'lumotlar va faoliyat yo'nalishlari.";

  let imageUrl = seo.ogImageUrl || siteSettings.defaultOgImage || '';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  const rawPath = normalizePath(seo.canonicalPath || '/about');
  const currentPath = `/uz${rawPath}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: currentPath,
      languages: {
        ru: rawPath,
        uz: currentPath,
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

export default async function UzbekAboutPage() {
  const lang: 'uz' = 'uz';
  const { content, seo, siteSettings, translations } = await getAboutDataBundle();

  const baseUrl = siteSettings.baseUrl || siteSettings.url || 'https://maxtron.uz';
  const siteName = siteSettings.siteName?.[lang] || siteSettings.name || 'MAXTRON';
  const title = seo.title?.[lang] || 'Kompaniya haqida';
  const description = seo.description?.[lang] || siteSettings.description?.[lang] || '';

  const rawPath = normalizePath(seo.canonicalPath || '/about');
  const currentPath = `/uz${rawPath}`;
  const homePath = `${baseUrl}/uz`;

  const homeLabel = translations.breadcrumbHome?.[lang] || 'Bosh sahifa';
  const aboutLabel = translations.breadcrumbAbout?.[lang] || title;

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${baseUrl}${currentPath}#webpage`,
        url: `${baseUrl}${currentPath}`,
        name: title,
        inLanguage: 'uz-UZ',
        description,
        mainEntity: {
          '@type': 'Organization',
          '@id': `${baseUrl}/#organization`,
          name: siteName,
          url: baseUrl,
          logo: siteSettings.logoUrl ? `${baseUrl}${siteSettings.logoUrl.startsWith('/') ? '' : '/'}${siteSettings.logoUrl}` : undefined,
          description,
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
            name: aboutLabel,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <AboutClient
        lang={lang}
        content={content}
        seo={seo}
        siteSettings={siteSettings}
        translations={translations}
      />
    </>
  );
}