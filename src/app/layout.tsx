import type { Metadata } from 'next';
import '../index.css';
import { MainLayoutClient } from '@/components/MainLayoutClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { db } from '@/server/db';

// Xavfsiz JSON parser
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

// Bazadan sayt umumiy va header sozlamalarini olish
async function getSiteSettings(): Promise<Record<string, any>> {
  try {
    const [rows]: any = await db.query(
      `SELECT \`key\`, value FROM settings WHERE \`key\` IN ('site_settings', 'header_settings')`
    );

    let siteSettings: Record<string, any> = {};
    let headerSettings: Record<string, any> = {};

    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (row.key === 'site_settings') {
          siteSettings = safeParse(row.value);
        } else if (row.key === 'header_settings') {
          headerSettings = safeParse(row.value);
        }
      }
    }

    return {
      ...siteSettings,
      ...headerSettings,
      faviconUrl: headerSettings.faviconUrl || siteSettings.faviconUrl || '',
    };
  } catch (err) {
    console.error('RootLayout sozlamalar xatosi:', err);
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const site: Record<string, any> = await getSiteSettings();
  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';

  const siteNameUz = site.siteName?.uz || site.logoText || site.name || 'MAXTRON';
  const siteNameRu = site.siteName?.ru || site.logoText || site.name || 'MAXTRON';

  const defaultDesc = site.description?.uz || site.description?.ru || '';
  const keywordsList = Array.isArray(site.keywords)
    ? site.keywords
    : (typeof site.keywords === 'string' ? site.keywords.split(',').map((k: string) => k.trim()) : []);

  let ogImage = site.defaultOgImage || site.ogImageUrl || site.logoImageUrl || '';
  if (ogImage && !ogImage.startsWith('http') && !ogImage.startsWith('data:')) {
    ogImage = `${baseUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
  }

  const activeFavicon = site.faviconUrl || '/favicon.ico';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${siteNameUz} — ${site.heroTitle?.uz || 'Industrial Supply'}`,
      template: `%s | ${siteNameUz}`,
    },
    description: defaultDesc,
    keywords: keywordsList.length > 0 ? keywordsList : undefined,
    alternates: {
      canonical: '/',
      languages: {
        ru: '/',
        uz: '/uz',
      },
    },
    icons: {
      icon: [
        {
          url: activeFavicon,
          type: activeFavicon.endsWith('.ico') ? 'image/x-icon' : 'image/png',
        },
      ],
      shortcut: activeFavicon,
      apple: site.appleTouchIcon || activeFavicon,
    },
    openGraph: {
      type: 'website',
      siteName: siteNameUz,
      url: baseUrl,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
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
        <ErrorBoundary>
          <MainLayoutClient>
            {children}
          </MainLayoutClient>
        </ErrorBoundary>
      </body>
    </html>
  );
}