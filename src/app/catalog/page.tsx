import { Suspense } from 'react';
import type { Metadata } from 'next';
import { db } from '@/server/db';
import { CatalogPageClient } from './CatalogPageClient';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [rows]: any = await db.query(
      "SELECT value FROM settings WHERE `key` = 'seo_settings' LIMIT 1"
    );

    let seoData: any = {};
    if (rows && rows.length > 0 && rows[0].value) {
      seoData = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
    }

    const catalogSeo = seoData?.pageSeo?.catalog || {};
    const title = catalogSeo?.title?.ru || 'Каталог оборудования КИПиА и датчиков — MAXTRON';
    const description = catalogSeo?.description?.ru || 'Каталог промышленных контрольно-измерительных приборов, манометров, датчиков давления и расходомеров в Ташкенте.';
    
    let imageUrl = seoData?.ogImageUrl || '/og-image.jpg';
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
      imageUrl = `https://maxtron.uz${imageUrl}`;
    }

    return {
      title,
      description,
      alternates: {
        canonical: 'https://maxtron.uz/catalog',
        languages: {
          'ru': 'https://maxtron.uz/catalog',
          'uz': 'https://maxtron.uz/uz/catalog',
        },
      },
      openGraph: {
        title,
        description,
        url: 'https://maxtron.uz/catalog',
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
      title: 'Katalog — MAXTRON',
      description: 'Sanoat asboblari va o‘lchov uskunalari katalogi',
    };
  }
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-500">Katalog yuklanmoqda...</div>}>
      <CatalogPageClient />
    </Suspense>
  );
}