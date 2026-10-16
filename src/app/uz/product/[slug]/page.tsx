import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/server/db';
import { ProductPageClient } from '@/app/product/[slug]/ProductPageClient';

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

// Telegram va OpenGraph uchun mutlaq va toza rasm URL'ini aniqlash
function resolveImageUrl(product: any, baseUrl: string, defaultImage = ''): string {
  let img = product?.image;

  // Agar massiv bo'lsa yoki string json bo'lsa birinchi rasmni olamiz
  if (typeof img === 'string' && img.startsWith('[')) {
    try {
      const arr = JSON.parse(img);
      img = arr[0];
    } catch {
      // ignore
    }
  }

  // Agar asosiy rasm bo'lmasa, og_image ni tekshiramiz
  if (!img) {
    img = product?.og_image;
  }

  // Base64 rasmlarni OpenGraph uchun qabul qilmaymiz
  if (typeof img === 'string' && img.startsWith('data:')) {
    img = '';
  }

  const finalImg = img || defaultImage;
  if (!finalImg) return '';

  if (finalImg.startsWith('http://') || finalImg.startsWith('https://')) {
    return finalImg;
  }

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = String(finalImg).replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();

  const [product, config] = await Promise.all([
    getProduct(slug),
    getSiteConfig(),
  ]);

  const site = config.site_settings || {};
  const baseUrl = (site.baseUrl || site.url || 'https://maxtron.uz').replace(/\/+$/, '');
  const siteName = site.siteName?.uz || site.name || 'MAXTRON';

  if (!product) {
    return {
      title: siteName,
      description: site.description?.uz || '',
    };
  }

  const modelText = typeof product.model === 'string' ? product.model.trim() : '';
  const rawName = product.name?.uz || (product as any).title?.uz || product.name || '';
  const productName = typeof rawName === 'string' ? rawName.trim() : '';

  // Sarlavhani shakllantirish
  let baseTitle = productName;
  if (modelText && !baseTitle.toLowerCase().includes(modelText.toLowerCase())) {
    baseTitle = `${baseTitle} (${modelText})`;
  }
  if (!baseTitle) {
    baseTitle = modelText || 'Uskuna';
  }

  const title = product.seo_title?.uz || `${baseTitle} — ${siteName}`;

  const description = (
    product.seo_description?.uz ||
    product.description?.uz ||
    ''
  )
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  const imageUrl = resolveImageUrl(
    product,
    baseUrl,
    site.defaultOgImage || 'https://maxtron.uz/og-image.jpg'
  );

  const slugRu = product.slug?.ru || decodedSlug;
  const slugUz = product.slug?.uz || decodedSlug;
  const canonicalUrl = `${baseUrl}/uz/product/${slugUz}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ru: `/product/${slugRu}`,
        uz: `/uz/product/${slugUz}`,
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

export default async function UzbekProductPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();
  const lang: 'uz' = 'uz';

  const [product, config] = await Promise.all([
    getProduct(slug),
    getSiteConfig(),
  ]);

  if (!product) {
    notFound();
  }

  const site = config.site_settings || {};
  const t = config.translations || {};

  const baseUrl = (site.baseUrl || site.url || 'https://maxtron.uz').replace(/\/+$/, '');
  const siteName = site.siteName?.uz || site.name || 'MAXTRON';
  const currency = site.currency || 'UZS';

  const modelText = typeof product.model === 'string' ? product.model.trim() : '';
  const rawName = product.name?.uz || (product as any).title?.uz || product.name || '';
  const productName = typeof rawName === 'string' ? rawName.trim() : (modelText || 'Uskuna');

  const productDesc = (product.description?.uz || '')
    .replace(/<[^>]*>/g, '')
    .slice(0, 250);

  const imageUrl = resolveImageUrl(
    product,
    baseUrl,
    site.defaultOgImage || 'https://maxtron.uz/og-image.jpg'
  );

  const currentPath = `/uz/product/${decodedSlug}`;
  const homePath = `${baseUrl}/uz`;
  const catalogPath = `${baseUrl}/uz/catalog`;

  const homeLabel = t.breadcrumbHome?.uz || 'Bosh sahifa';
  const catalogLabel = t.breadcrumbCatalog?.uz || 'Katalog';

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${baseUrl}${currentPath}#product`,
        name: productName,
        inLanguage: 'uz-UZ',
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