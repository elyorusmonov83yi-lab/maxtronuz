import type { Metadata } from 'next';
import { db } from '@/server/db';
import { ProjectsClient } from './ProjectsClient';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [rows]: any = await db.query(
      "SELECT value FROM settings WHERE `key` = 'seo_settings' LIMIT 1"
    );

    let seoData: any = {};
    if (rows && rows.length > 0 && rows[0].value) {
      seoData = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
    }

    const title = 'Реализованные Проекты и Кейсы — MAXTRON Industrial Supply';
    const description = 'Практические кейсы поставок и внедрения контрольно-измерительных приборов и систем КИПиА на ведущих предприятиях Узбекистана.';
    let imageUrl = seoData?.ogImageUrl || '/og-image.jpg';
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
      imageUrl = `https://maxtron.uz${imageUrl}`;
    }

    return {
      title,
      description,
      alternates: {
        canonical: 'https://maxtron.uz/projects',
        languages: {
          'ru': 'https://maxtron.uz/projects',
          'uz': 'https://maxtron.uz/uz/projects',
        },
      },
      openGraph: {
        title,
        description,
        url: 'https://maxtron.uz/projects',
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
      title: 'Loyihalar va Keyslar — MAXTRON',
      description: 'Sanoat korxonalarida amalga oshirilgan loyihalar',
    };
  }
}

export default function ProjectsPage() {
  return <ProjectsClient />;
}