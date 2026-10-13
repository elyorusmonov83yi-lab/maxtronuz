import type { Metadata } from 'next';
import { db } from '@/server/db';
import CatalogPageClient from '../../catalog/CatalogPageClient';

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

async function getCatalogSeoData() {
  try {
    const [rows]: any = await db.query(
      `SELECT value FROM settings WHERE \`key\` = 'site_settings' LIMIT 1`
    );
    if (rows && rows.length > 0) {
      return safeParse(rows[0].value);
    }
    return {};
  } catch (err) {
    console.error('UzCatalog SEO error:', err);
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCatalogSeoData();
  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';

  const title =
    site.catalogTitle?.uz ||
    'KIPiA uskunalari va datchiklar katalogi — MAXTRON';

  const description =
    site.catalogDescription?.uz ||
    'O‘zbekistonda sanoat nazorat-o‘lchov asboblari, manometrlar, bosim datchiklari va sarf o‘lchagichlar katalogi.';

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/uz/catalog`,
      languages: {
        ru: `${baseUrl}/catalog`,
        uz: `${baseUrl}/uz/catalog`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/uz/catalog`,
      locale: 'uz_UZ',
      siteName: site.siteName?.uz || 'MAXTRON',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function UzCatalogPage() {
  const site = await getCatalogSeoData();
  const baseUrl = site.baseUrl || site.url || 'https://maxtron.uz';

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'MAXTRON uskunalar katalogi',
    url: `${baseUrl}/uz/catalog`,
    inLanguage: 'uz-UZ',
    description:
      site.catalogDescription?.uz ||
      'O‘zbekistonda sanoat nazorat-o‘lchov asboblari katalogi.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {/* Eng muhimi: currentLang="uz" berildi */}
      <CatalogPageClient currentLang="uz" />
    </>
  );
}