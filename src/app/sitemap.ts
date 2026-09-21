import { MetadataRoute } from 'next';
import { db } from '@/server/db';

const BASE_URL = 'https://maxtron.uz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  const staticRoutes = [
    '',
    '/catalog',
    '/about',
    '/contact',
    '/certificates',
    '/services',
    '/projects',
    '/equipment-finder',
    '/compare',
    '/quote',
  ];

  const staticEntries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    staticEntries.push({
      url: `${BASE_URL}${route}`,
      lastModified: currentDate,
      changeFrequency: route === '' || route === '/catalog' ? 'daily' : 'weekly',
      priority: route === '' ? 1.0 : 0.8,
      alternates: {
        languages: {
          ru: `${BASE_URL}${route}`,
          uz: `${BASE_URL}/uz${route}`,
        },
      },
    });

    staticEntries.push({
      url: `${BASE_URL}/uz${route}`,
      lastModified: currentDate,
      changeFrequency: route === '' || route === '/catalog' ? 'daily' : 'weekly',
      priority: route === '' ? 0.9 : 0.7,
      alternates: {
        languages: {
          ru: `${BASE_URL}${route}`,
          uz: `${BASE_URL}/uz${route}`,
        },
      },
    });
  }

  // Dinamik Mahsulotlar (xatosiz SQL)
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const [products]: any = await db.query('SELECT id, slug FROM products');

    if (Array.isArray(products)) {
      products.forEach((p) => {
        let slugRu = p.id;
        let slugUz = p.id;

        if (p.slug) {
          try {
            const parsedSlug = typeof p.slug === 'string' ? JSON.parse(p.slug) : p.slug;
            slugRu = parsedSlug.ru || parsedSlug.uz || p.id;
            slugUz = parsedSlug.uz || parsedSlug.ru || p.id;
          } catch {
            slugRu = p.slug;
            slugUz = p.slug;
          }
        }

        productEntries.push({
          url: `${BASE_URL}/product/${encodeURIComponent(slugRu)}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.9,
          alternates: {
            languages: {
              ru: `${BASE_URL}/product/${encodeURIComponent(slugRu)}`,
              uz: `${BASE_URL}/uz/product/${encodeURIComponent(slugUz)}`,
            },
          },
        });

        productEntries.push({
          url: `${BASE_URL}/uz/product/${encodeURIComponent(slugUz)}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: {
              ru: `${BASE_URL}/product/${encodeURIComponent(slugRu)}`,
              uz: `${BASE_URL}/uz/product/${encodeURIComponent(slugUz)}`,
            },
          },
        });
      });
    }
  } catch (err) {
    console.error('Sitemap products error:', err);
  }

  // Dinamik Kategoriyalar
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const [categories]: any = await db.query('SELECT id, slug FROM categories');

    if (Array.isArray(categories)) {
      categories.forEach((cat) => {
        const slug = cat.slug || cat.id;

        categoryEntries.push({
          url: `${BASE_URL}/catalog?category=${encodeURIComponent(slug)}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.7,
        });

        categoryEntries.push({
          url: `${BASE_URL}/uz/catalog?category=${encodeURIComponent(slug)}`,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }
  } catch (err) {
    console.error('Sitemap categories error:', err);
  }

  // Dinamik CMS Sahifalar (xatosiz SQL)
  let cmsEntries: MetadataRoute.Sitemap = [];
  try {
    const [pages]: any = await db.query('SELECT slug FROM pages');

    if (Array.isArray(pages)) {
      pages.forEach((page) => {
        if (!page.slug) return;

        cmsEntries.push({
          url: `${BASE_URL}/page/${encodeURIComponent(page.slug)}`,
          lastModified: currentDate,
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: {
              ru: `${BASE_URL}/page/${encodeURIComponent(page.slug)}`,
              uz: `${BASE_URL}/uz/page/${encodeURIComponent(page.slug)}`,
            },
          },
        });

        cmsEntries.push({
          url: `${BASE_URL}/uz/page/${encodeURIComponent(page.slug)}`,
          lastModified: currentDate,
          changeFrequency: 'monthly',
          priority: 0.5,
          alternates: {
            languages: {
              ru: `${BASE_URL}/page/${encodeURIComponent(page.slug)}`,
              uz: `${BASE_URL}/uz/page/${encodeURIComponent(page.slug)}`,
            },
          },
        });
      });
    }
  } catch (err) {
    console.error('Sitemap pages error:', err);
  }

  return [...staticEntries, ...productEntries, ...categoryEntries, ...cmsEntries];
}