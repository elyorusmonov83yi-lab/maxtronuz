import type { Metadata } from 'next';
import '../index.css';
import { MainLayoutClient } from '@/components/MainLayoutClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { db } from '@/server/db';
import NextTopLoader from 'nextjs-toploader';

function safeParse(val: any): Record<string, any> {
  if (!val) return {};
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  }
  return {};
}

// Bazadagi haqiqiy kalitlar: 'home', 'seo', 'about', 'contact'
async function getSettings(): Promise<{ home: Record<string, any>; seo: Record<string, any> }> {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings WHERE \`key\` IN ('home', 'seo')`
    );

    let home: Record<string, any> = {};
    let seo: Record<string, any> = {};

    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (row.key === 'home') {
          home = safeParse(row.value);
        } else if (row.key === 'seo') {
          seo = safeParse(row.value);
        }
      }
    }

    return { home, seo };
  } catch (err) {
    console.error('RootLayout getSettings xatosi:', err);
    return { home: {}, seo: {} };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { home, seo } = await getSettings();
  const domain =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  'maxtron.uz';

const baseUrl = domain.startsWith('http') ? domain.replace(/\/+$/, '') : `https://${domain.replace(/\/+$/, '')}`;

  // 1. Sarlavha (SEO Title)
  const titleRu = home.seoTitle?.ru || home.ogTitle?.ru || 'MAXTRON — Контрольно-измерительные приборы';
  const titleUz = home.seoTitle?.uz || home.ogTitle?.uz || 'MAXTRON — O‘lchov va nazorat uskunalari';

  // 2. Tavsif (SEO Description)
  const description =
    home.seoDescription?.ru ||
    home.seoDescription?.uz ||
    home.heroSubtitle?.ru ||
    home.heroSubtitle?.uz ||
    'MAXTRON — промышленное оборудование и контрольно-измерительные приборы в Узбекистане';

  // 3. OpenGraph rasm manzili (faqat toza URL olinadi, base64 bloklanadi)
  let rawOg =
    (typeof home.ogImage === 'object' ? (home.ogImage?.ru || home.ogImage?.uz) : home.ogImage) || '';

  if (rawOg.startsWith('data:')) {
    rawOg = '';
  }

  let finalOgImage = '';
  if (rawOg) {
    finalOgImage = rawOg.startsWith('http') ? rawOg : `${baseUrl}/${rawOg.replace(/^\//, '')}`;
  }

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: titleRu,
      template: `%s | MAXTRON`,
    },
    description,
    alternates: {
      canonical: '/',
      languages: {
        ru: '/',
        uz: '/uz',
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
    },
    openGraph: {
      type: 'website',
      siteName: 'MAXTRON',
      url: baseUrl,
      title: titleRu,
      description,
      images: finalOgImage ? [{ url: finalOgImage, width: 1200, height: 630, alt: titleRu }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleRu,
      description,
      images: finalOgImage ? [finalOgImage] : [],
    },
    verification: {
      google: seo.googleVerification || undefined,
      yandex: seo.yandexVerification || undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="dark" suppressHydrationWarning>
      <body className="bg-gray-950 text-white antialiased selection:bg-blue-500 selection:text-white min-h-screen">
        <NextTopLoader
          color="#38bdf8"
          initialPosition={0.15}
          crawlSpeed={150}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 14px #38bdf8, 0 0 6px #0284c7"
          zIndex={9999999}
        />
        <ErrorBoundary>
          <MainLayoutClient>
            {children}
          </MainLayoutClient>
        </ErrorBoundary>
      </body>
    </html>
  );
}