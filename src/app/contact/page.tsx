import type { Metadata } from 'next';
import { db } from '@/server/db';
import { ContactClient } from './ContactClient';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [rows]: any = await db.query(
      "SELECT value FROM settings WHERE `key` = 'seo_settings' LIMIT 1"
    );

    let seoData: any = {};
    if (rows && rows.length > 0 && rows[0].value) {
      seoData = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
    }

    const contactSeo = seoData?.pageSeo?.contact || {};
    const title = contactSeo?.title?.ru || 'Контакты — MAXTRON Industrial Supply';
    const description = contactSeo?.description?.ru || 'Свяжитесь с MAXTRON: отдел продаж, адрес главного офиса в Ташкенте и банковские реквизиты.';
    let imageUrl = seoData?.ogImageUrl || '/og-image.jpg';
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
      imageUrl = `https://maxtron.uz${imageUrl}`;
    }

    return {
      title,
      description,
      alternates: {
        canonical: 'https://maxtron.uz/contact',
        languages: {
          'ru': 'https://maxtron.uz/contact',
          'uz': 'https://maxtron.uz/uz/contact',
        },
      },
      openGraph: {
        title,
        description,
        url: 'https://maxtron.uz/contact',
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
      title: 'Aloqa — MAXTRON',
      description: 'Toshkentdagi bosh ofis va aloqa raqamlari',
    };
  }
}

export default function ContactPage() {
  return <ContactClient />;
}