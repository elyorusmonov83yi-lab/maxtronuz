import type { Request, Response } from 'express';
import { db } from './db.ts';

type SitemapEntry = { path: string; lastmod?: unknown; changefreq: 'daily' | 'weekly' | 'monthly'; priority: string };

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (char) => ({
  '<': '&lt;', '>': '&gt;', '&': '&apos;', "'": '&apos;', '"': '&quot;'
}[char] as string));

function getSiteUrl(): string {
  try {
    return new URL(process.env.SITE_URL || 'https://maxtron.uz').origin;
  } catch {
    return 'https://maxtron.uz';
  }
}

function getLastModified(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function localizedValues(value: unknown, fallback: string): string[] {
  if (!value) return [fallback];
  if (typeof value === 'object') return [...new Set(Object.values(value as Record<string, unknown>).map(String).filter(Boolean))];
  if (typeof value === 'string') {
    try {
      return localizedValues(JSON.parse(value), fallback);
    } catch {
      return [value];
    }
  }
  return [fallback];
}

export async function serveSitemap(_req: Request, res: Response): Promise<void> {
  const siteUrl = getSiteUrl();
  const entries: SitemapEntry[] = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/catalog', changefreq: 'daily', priority: '0.9' },
    { path: '/certificates', changefreq: 'weekly', priority: '0.8' },
    { path: '/about', changefreq: 'monthly', priority: '0.7' },
    { path: '/contact', changefreq: 'monthly', priority: '0.7' }
  ];

  try {
    const [productsResult, categoriesResult, pagesResult]: any = await Promise.all([
      db.query('SELECT * FROM products'),
      db.query('SELECT * FROM categories'),
      db.query('SELECT * FROM pages')
    ]);
    const products = productsResult[0] || [];
    const categories = categoriesResult[0] || [];
    const pages = pagesResult[0] || [];

    products.filter((product: any) => product.isActive === undefined || Number(product.isActive) !== 0).forEach((product: any) => {
      const lastmod = product.updatedAt || product.updated_at || product.createdAt || product.created_at;
      localizedValues(product.slug, String(product.id)).forEach((slug) => {
        entries.push({ path: `/product/${encodeURIComponent(slug)}`, lastmod, changefreq: 'weekly', priority: '0.8' });
      });
    });
    categories.forEach((category: any) => {
      const lastmod = category.updatedAt || category.updated_at || category.createdAt || category.created_at;
      localizedValues(category.slug, String(category.id)).forEach((slug) => {
        entries.push({ path: `/catalog/${encodeURIComponent(slug)}`, lastmod, changefreq: 'weekly', priority: '0.7' });
      });
    });
    pages.filter((page: any) => page.isPublished === undefined || Number(page.isPublished) !== 0).forEach((page: any) => {
      entries.push({ path: `/page/${encodeURIComponent(String(page.slug))}`, lastmod: page.updatedAt || page.updated_at || page.createdAt || page.created_at, changefreq: 'monthly', priority: '0.6' });
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
  }

  const uniqueEntries = [...new Map(entries.map((entry) => [entry.path, entry])).values()];
  const xmlEntries = uniqueEntries.map((entry) => {
    const lastmod = getLastModified(entry.lastmod);
    return `  <url>\n    <loc>${escapeXml(`${siteUrl}${entry.path}`)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`;
  }).join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries}\n</urlset>`);
}
