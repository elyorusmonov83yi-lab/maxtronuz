import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maxtron.uz';

  const defaultRobots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /compare',
    'Disallow: /uz/compare',
    'Disallow: /*?*',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    'Host: maxtron.uz',
  ].join('\n');

  try {
    const [rows]: any = await db.query(
      "SELECT value FROM settings WHERE `key` = 'seo_settings' LIMIT 1"
    );

    let robotsContent = defaultRobots;

    if (rows && rows.length > 0 && rows[0].value) {
      let seoData: any = {};
      try {
        seoData = typeof rows[0].value === 'string' 
          ? JSON.parse(rows[0].value) 
          : rows[0].value;
      } catch {
        seoData = {};
      }

      if (seoData?.robotsTxt && typeof seoData.robotsTxt === 'string' && seoData.robotsTxt.trim()) {
        robotsContent = seoData.robotsTxt.trim();
      }
    }

    return new NextResponse(robotsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Dynamic robots.txt error:', error);
    return new NextResponse(defaultRobots, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}