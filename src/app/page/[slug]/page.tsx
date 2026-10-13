import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/server/db';
import { CustomPageClient } from './CustomPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

function safeJsonParse(data: unknown): Record<string, any> {
  if (!data) return {};
  if (typeof data === 'object') return data as Record<string, any>;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return { ru: data, uz: data };
    }
  }
  return {};
}

async function getSiteConfig() {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings 
       WHERE \`key\` IN ('site_settings', 'translations')`
    );

    const config: Record<string, any> = {};
    if (rows && rows.length > 0) {
      for (const row of rows) {
        config[row.key] = safeJsonParse(row.value);
      }
    }
    return config;
  } catch (err) {
    console.error('Sayt sozlamalarini yuklashda xatolik:', err);
    return {};
  }
}

async function getPageBySlug(rawSlug: string) {
  const cleanSlug = decodeURIComponent(rawSlug).toLowerCase().trim();

  try {
    const [rows]: any = await db.query(
      `SELECT * FROM pages 
       WHERE slug = ? 
          OR id = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.ru')) = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.uz')) = ? 
       LIMIT 1`,
      [cleanSlug, cleanSlug, cleanSlug, cleanSlug]
    );

    if (rows && rows.length > 0) {
      const p = rows[0];
      return {
        ...p,
        slug: safeJsonParse(p.slug),
        title: safeJsonParse(p.title),
        subtitle: safeJsonParse(p.subtitle),
        content: safeJsonParse(p.content),
        meta_title: safeJsonParse(p.meta_title),
        meta_description: safeJsonParse(p.meta_description),
      };
    }
  } catch (err) {
    console.error('CMS sahifasini yuklashda xatolik:', err);
  }

  return null;
}

function resolveImageUrl(rawImage: any, baseUrl: string, defaultImage = ''): string {
  let img = rawImage;
  if (typeof img === 'string' && img.startsWith('[')) {
    try {
      const arr = JSON.parse(img);
      img = arr[0];
    } catch {
      // ignore
    }
  }

  const finalImg = img || defaultImage;
  if (!finalImg) return '';
  if (finalImg.startsWith('http://') || finalImg.startsWith('https://') || finalImg.startsWith('data:')) {
    return finalImg;
  }
  return `${baseUrl}${finalImg.startsWith('/') ? '' : '/'}${finalImg}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  const lang: 'ru' = 'ru';

  const [page, config] = await Promise.all([
    getPageBySlug(slug),
    getSiteConfig(),
  ]);

  const site = config.site_settings || {};
  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  if (!page) {
    return {
      title: siteName,
      description: site.description?.[lang] || '',
    };
  }

  const rawTitle = page.meta_title?.[lang] || page.title?.[lang] || '';
  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description = (
    page.meta_description?.[lang] ||
    page.subtitle?.[lang] ||
    ''
  )
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  const imageUrl = resolveImageUrl(
    page.cover_image || page.og_image,
    baseUrl,
    site.defaultOgImage
  );

  const slugRu = page.slug?.ru || cleanSlug;
  const slugUz = page.slug?.uz || cleanSlug;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: `/page/${slugRu}`,
      languages: {
        ru: `/page/${slugRu}`,
        uz: `/uz/page/${slugUz}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `/page/${slugRu}`,
      siteName,
      locale: 'ru_RU',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
  const lang: 'ru' = 'ru';

  const [page, config] = await Promise.all([
    getPageBySlug(slug),
    getSiteConfig(),
  ]);

  if (!page) {
    notFound();
  }

  const site = config.site_settings || {};
  const t = config.translations || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.[lang] || site.name || 'MAXTRON';

  const pageTitle = page.title?.[lang] || '';
  const pageDesc = (page.meta_description?.[lang] || page.subtitle?.[lang] || '')
    .replace(/<[^>]*>/g, '')
    .slice(0, 200);

  const imageUrl = resolveImageUrl(
    page.cover_image || page.og_image,
    baseUrl,
    site.defaultOgImage
  );

  const currentPath = `/page/${cleanSlug}`;
  const homePath = baseUrl;
  const homeLabel = t.breadcrumbHome?.[lang] || 'Главная';

  const pageJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${baseUrl}${currentPath}#article`,
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          name: siteName,
          url: baseUrl,
        },
        headline: pageTitle,
        description: pageDesc,
        inLanguage: 'ru-RU',
        image: imageUrl ? [imageUrl] : [],
        datePublished: page.created_at || undefined,
        dateModified: page.updated_at || undefined,
        publisher: {
          '@type': 'Organization',
          name: siteName,
          url: baseUrl,
          logo: site.logoUrl ? `${baseUrl}${site.logoUrl.startsWith('/') ? '' : '/'}${site.logoUrl}` : undefined,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${baseUrl}${currentPath}`,
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
            name: pageTitle,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <CustomPageClient
        page={page}
        lang={lang}
        translations={t}
        siteSettings={site}
      />
    </>
  );
}