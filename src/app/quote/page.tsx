import { Suspense } from 'react';
import type { Metadata } from 'next';
import { db } from '@/server/db';
import { QuoteClient } from './QuoteClient';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [rows]: any = await db.query(
      "SELECT value FROM settings WHERE `key` = 'seo_settings' LIMIT 1"
    );

    let seoData: any = {};
    if (rows && rows.length > 0 && rows[0].value) {
      seoData = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
    }

    const title = 'Запрос коммерческого предложения (КП / RFQ) — MAXTRON';
    const description = 'Запросите официальное коммерческое предложение на измерительные приборы и датчики с НДС за 15 минут.';
    let imageUrl = seoData?.ogImageUrl || '/og-image.jpg';
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
      imageUrl = `https://maxtron.uz${imageUrl}`;
    }

    return {
      title,
      description,
      alternates: {
        canonical: 'https://maxtron.uz/quote',
        languages: {
          'ru': 'https://maxtron.uz/quote',
          'uz': 'https://maxtron.uz/uz/quote',
        },
      },
      openGraph: {
        title,
        description,
        url: 'https://maxtron.uz/quote',
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
      title: 'Tijorat taklifi so‘rovi — MAXTRON',
      description: 'Rasmiy tijorat taklifi olish',
    };
  }
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-500">Yuklanmoqda...</div>}>
      <QuoteClient />
    </Suspense>
  );
}