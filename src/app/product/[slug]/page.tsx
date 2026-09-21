import type { Metadata } from 'next';
import { db } from '@/server/db';
import { ProductPageClient } from './ProductPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();

  try {
    // ID yoki Slug (JSON yoki oddiy matn) orqali qidiramiz
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
      const parsedName = typeof p.name === 'string' ? JSON.parse(p.name || '{}') : (p.name || {});
      const parsedDesc = typeof p.description === 'string' ? JSON.parse(p.description || '{}') : (p.description || {});
      const parsedSeoTitle = typeof p.seo_title === 'string' ? JSON.parse(p.seo_title || '{}') : (p.seo_title || {});
      const parsedSeoDesc = typeof p.seo_description === 'string' ? JSON.parse(p.seo_description || '{}') : (p.seo_description || {});

      const titleRu = parsedSeoTitle.ru || parsedName.ru || `${p.model} | MAXTRON`;
      const titleUz = parsedSeoTitle.uz || parsedName.uz || `${p.model} | MAXTRON`;

      const descRu = (parsedSeoDesc.ru || parsedDesc.ru || '').replace(/<[^>]*>/g, '').slice(0, 160);
      const descUz = (parsedSeoDesc.uz || parsedDesc.uz || '').replace(/<[^>]*>/g, '').slice(0, 160);

      let imageUrl = p.og_image || p.image || '/og-image.jpg';
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        imageUrl = `https://maxtron.uz${imageUrl}`;
      }

      return {
        title: `${titleRu} — MAXTRON`,
        description: descRu,
        alternates: {
          canonical: `https://maxtron.uz/product/${decodedSlug}`,
          languages: {
            'ru': `https://maxtron.uz/product/${decodedSlug}`,
            'uz': `https://maxtron.uz/uz/product/${decodedSlug}`,
          },
        },
        openGraph: {
          title: `${titleRu} — MAXTRON`,
          description: descRu,
          url: `https://maxtron.uz/product/${decodedSlug}`,
          siteName: 'MAXTRON',
          images: [{ url: imageUrl, width: 1200, height: 630 }],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${titleRu} — MAXTRON`,
          description: descRu,
          images: [imageUrl],
        },
      };
    }
  } catch (err) {
    console.error('Product metadata error:', err);
  }

  return {
    title: 'Mahsulot — MAXTRON Industrial',
    description: 'Sanoat o‘lchov uskunalari va datchiklar',
  };
}

export default function ProductPage() {
  return <ProductPageClient />;
}