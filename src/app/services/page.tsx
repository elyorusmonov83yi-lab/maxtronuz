import type { Metadata } from 'next';
import { db } from '@/server/db';
import { ServicesClient } from './ServicesClient';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [rows]: any = await db.query(
      "SELECT value FROM settings WHERE `key` = 'seo_settings' LIMIT 1"
    );

    let seoData: any = {};
    if (rows && rows.length > 0 && rows[0].value) {
      seoData = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
    }

    const title = 'Метрологические и Сервисные Услуги КИПиА — MAXTRON';
    const description = 'Государственная поверка, лабораторная калибровка, гарантийный ремонт и пусконаладка измерительного оборудования в Ташкенте.';
    let imageUrl = seoData?.ogImageUrl || '/og-image.jpg';
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
      imageUrl = `https://maxtron.uz${imageUrl}`;
    }

    return {
      title,
      description,
      alternates: {
        canonical: 'https://maxtron.uz/services',
        languages: {
          'ru': 'https://maxtron.uz/services',
          'uz': 'https://maxtron.uz/uz/services',
        },
      },
      openGraph: {
        title,
        description,
        url: 'https://maxtron.uz/services',
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
      title: 'Xizmatlar — MAXTRON',
      description: 'Metrologiya va servis xizmatlari',
    };
  }
}

export default function ServicesPage() {
  return <ServicesClient />;
}