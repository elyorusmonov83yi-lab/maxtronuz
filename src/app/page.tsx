import { Metadata } from 'next';
import { db } from '@/server/db';
import HomePageClient from './HomePageClient';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [rows]: any = await db.query(
      "SELECT value FROM settings WHERE `key` = 'seo_settings' LIMIT 1"
    );

    let seoData: any = {};

    if (rows && rows.length > 0 && rows[0].value) {
      seoData =
        typeof rows[0].value === 'string'
          ? JSON.parse(rows[0].value)
          : rows[0].value;
    }

    const title =
      seoData.meta_title_ru ||
      seoData.defaultTitle ||
      'MAXTRON — Sanoat va O‘lchov Uskunalari';

    const description =
      seoData.meta_description_ru ||
      seoData.defaultDescription ||
      'O‘lchov va nazorat uskunalari, manometrlar, datchiklar Toshkentda';

    let imageUrl =
      seoData.ogImageUrl ||
      seoData.og_image ||
      '/og-image.jpg';

    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
      imageUrl = `https://maxtron.uz${imageUrl}`;
    }

    return {
      title,
      description,

      openGraph: {
        title,
        description,
        url: 'https://maxtron.uz',
        siteName: 'MAXTRON',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
          },
        ],
        type: 'website',
      },

      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (err) {
    return {
      title: 'MAXTRON — Sanoat va O‘lchov Uskunalari',
      description: 'O‘lchov va nazorat uskunalari',
    };
  }
}

export default function HomePage() {
  return <HomePageClient />;
}