import type { Metadata } from 'next';
import { db } from '@/server/db';
import { FinderClient } from './FinderClient';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [rows]: any = await db.query(
      "SELECT value FROM settings WHERE `key` = 'seo_settings' LIMIT 1"
    );

    let seoData: any = {};
    if (rows && rows.length > 0 && rows[0].value) {
      seoData = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
    }

    const title = 'Мастер интеллектуального подбора оборудования — MAXTRON';
    const description = '3 шага для точного инженерного подбора контрольно-измерительных приборов и датчиков со склада в Ташкенте.';
    let imageUrl = seoData?.ogImageUrl || '/og-image.jpg';
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
      imageUrl = `https://maxtron.uz${imageUrl}`;
    }

    return {
      title,
      description,
      alternates: {
        canonical: 'https://maxtron.uz/equipment-finder',
        languages: {
          'ru': 'https://maxtron.uz/equipment-finder',
          'uz': 'https://maxtron.uz/uz/equipment-finder',
        },
      },
      openGraph: {
        title,
        description,
        url: 'https://maxtron.uz/equipment-finder',
        siteName: 'MAXTRON',
        images: [{ url: imageUrl, width: 1200, height: 630 }],
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
      title: 'Uskuna tanlash ustasi — MAXTRON',
      description: 'Sanoat uskunalarini tanlash konfiguratori',
    };
  }
}

export default function FinderPage() {
  return <FinderClient />;
}