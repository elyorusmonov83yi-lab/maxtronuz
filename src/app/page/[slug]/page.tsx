import type { Metadata } from 'next';
import { db } from '@/server/db';
import { CustomPageClient } from './CustomPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

  try {
    const [rows]: any = await db.query(
      'SELECT title, subtitle, meta_title, meta_description, cover_image FROM pages WHERE slug = ? OR id = ? LIMIT 1',
      [cleanSlug, cleanSlug]
    );

    if (rows && rows.length > 0) {
      const p = rows[0];
      const parsedTitle = typeof p.title === 'string' ? JSON.parse(p.title || '{}') : (p.title || {});
      const parsedMetaTitle = typeof p.meta_title === 'string' ? JSON.parse(p.meta_title || '{}') : (p.meta_title || {});
      const parsedMetaDesc = typeof p.meta_description === 'string' ? JSON.parse(p.meta_description || '{}') : (p.meta_description || {});
      const parsedSubtitle = typeof p.subtitle === 'string' ? JSON.parse(p.subtitle || '{}') : (p.subtitle || {});

      const title = parsedMetaTitle.ru || parsedTitle.ru || parsedTitle.uz || 'MAXTRON';
      const description = (parsedMetaDesc.ru || parsedSubtitle.ru || parsedMetaDesc.uz || parsedSubtitle.uz || '')
        .replace(/<[^>]*>/g, '')
        .slice(0, 160);

      let imageUrl = p.cover_image || '/og-image.jpg';
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        imageUrl = `https://maxtron.uz${imageUrl}`;
      }

      return {
        title: `${title} — MAXTRON`,
        description,
        alternates: {
          canonical: `https://maxtron.uz/page/${cleanSlug}`,
          languages: {
            'ru': `https://maxtron.uz/page/${cleanSlug}`,
            'uz': `https://maxtron.uz/uz/page/${cleanSlug}`,
          },
        },
        openGraph: {
          title: `${title} — MAXTRON`,
          description,
          url: `https://maxtron.uz/page/${cleanSlug}`,
          siteName: 'MAXTRON',
          images: [{ url: imageUrl, width: 1200, height: 630 }],
          type: 'article',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${title} — MAXTRON`,
          description,
          images: [imageUrl],
        },
      };
    }
  } catch (err) {
    console.error('CMS page metadata error:', err);
  }

  return {
    title: 'Sahifa — MAXTRON',
    description: 'MAXTRON rasmiy ma’lumotlar sahifasi',
  };
}

export default function DynamicPage() {
  return <CustomPageClient />;
}
