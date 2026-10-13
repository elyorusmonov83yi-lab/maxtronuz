import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/server/db';
import { ProductPageClient } from './ProductPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

// Xavfsiz JSON parser
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

async function getProduct(rawSlug: string) {
  const decodedSlug = decodeURIComponent(rawSlug).trim();

  try {
    const [rows]: any = await db.query(
      `SELECT * FROM products 
       WHERE id = ? 
          OR slug = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.ru')) = ? 
          OR JSON_UNQUOTE(JSON_EXTRACT(slug, '$.uz')) = ? 
       LIMIT 1`,
      [decodedSlug, decodedSlug, decodedSlug, decodedSlug]
    );

    if (rows && rows.length > 0) {
      const p = rows[0];
      return {
        ...p,
        slug: safeJsonParse(p.slug),
        name: safeJsonParse(p.name),
        description: safeJsonParse(p.description),
        specifications: safeJsonParse(p.specifications),
        seo_title: safeJsonParse(p.seo_title),
        seo_description: safeJsonParse(p.seo_description),
      };
    }
  } catch (err) {
    console.error('Mahsulotni yuklashda xatolik:', err);
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
  const decodedSlug = decodeURIComponent(slug).trim();
  const lang: 'ru' = 'ru';

  const [product, config] = await Promise.all([
    getProduct(slug),
    getSiteConfig(),
  ]);

  const site = config.site_settings || {};
  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.ru || site.name || 'MAXTRON';

  if (!product) {
    return {
      title: siteName,
      description: site.description?.ru || '',
    };
  }

  const rawTitle =
    product.seo_title?.ru ||
    product.name?.ru ||
    product.model ||
    '';

  const title = siteName && !rawTitle.includes(siteName)
    ? `${rawTitle} — ${siteName}`
    : rawTitle;

  const description = (
    product.seo_description?.ru ||
    product.description?.ru ||
    ''
  )
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  const imageUrl = resolveImageUrl(
    product.og_image || product.image,
    baseUrl,
    site.defaultOgImage
  );

  const slugRu = product.slug?.ru || decodedSlug;
  const slugUz = product.slug?.uz || decodedSlug;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: `/product/${slugRu}`,
      languages: {
        ru: `/product/${slugRu}`,
        uz: `/uz/product/${slugUz}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `/product/${slugRu}`,
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

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();
  const lang: 'ru' = 'ru';

  const [product, config] = await Promise.all([
    getProduct(slug),
    getSiteConfig(),
  ]);

  if (!product) {
    notFound();
  }

  const site = config.site_settings || {};
  const t = config.translations || {};

  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';
  const siteName = site.siteName?.ru || site.name || 'MAXTRON';
  const currency = site.currency || 'UZS';

  const productName = product.name?.ru || product.model || '';
  const productDesc = (product.description?.ru || '')
    .replace(/<[^>]*>/g, '')
    .slice(0, 250);

  const imageUrl = resolveImageUrl(
    product.og_image || product.image,
    baseUrl,
    site.defaultOgImage
  );

  const currentPath = `/product/${decodedSlug}`;
  const homePath = baseUrl;
  const catalogPath = `${baseUrl}/catalog`;

  const homeLabel = t.breadcrumbHome?.ru || 'Главная';
  const catalogLabel = t.breadcrumbCatalog?.ru || 'Каталог';

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${baseUrl}${currentPath}#product`,
        name: productName,
        inLanguage: 'ru-RU',
        image: imageUrl ? [imageUrl] : [],
        description: productDesc,
        sku: product.sku || product.model || String(product.id),
        mpn: product.model || undefined,
        brand: {
          '@type': 'Brand',
          name: product.brand || siteName,
        },
        offers: {
          '@type': 'Offer',
          url: `${baseUrl}${currentPath}`,
          priceCurrency: currency,
          price: product.price ? String(product.price) : '0',
          priceValidUntil: '2026-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability:
            product.in_stock !== false && product.status !== 'inactive'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: siteName,
          },
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
            name: catalogLabel,
            item: catalogPath,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: productName,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductPageClient
        product={product}
        lang={lang}
        siteSettings={site}
        translations={t}
      />
    </>
  );
}