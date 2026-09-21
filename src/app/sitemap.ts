import { MetadataRoute } from 'next';
import { db } from '@/server/db';

const BASE_URL = 'https://maxtron.uz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // 1. Statik sahifalar (Har bir sahifa RU va UZ uchun)
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
    // Ruscha (asosiy)
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

    // O'zbekcha versiya
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

  // 2. Dinamik Mahsulotlar (Bazadan avtomatik olinadi)
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const [products]: any = await db.query(
      'SELECT id, slug, updated_at FROM products WHERE is_active = 1 OR is_active IS NULL'
    );

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

        const lastMod = p.updated_at ? new Date(p.updated_at) : currentDate;

        // Mahsulot RU
        productEntries.push({
          url: `${BASE_URL}/product/${encodeURIComponent(slugRu)}`,
          lastModified: lastMod,
          changeFrequency: 'weekly',
          priority: 0.9,
          alternates: {
            languages: {
              ru: `${BASE_URL}/product/${encodeURIComponent(slugRu)}`,
              uz: `${BASE_URL}/uz/product/${encodeURIComponent(slugUz)}`,
            },
          },
        });

        // Mahsulot UZ
        productEntries.push({
          url: `${BASE_URL}/uz/product/${encodeURIComponent(slugUz)}`,
          lastModified: lastMod,
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
    console.error('Sitemap products fetch error:', err);
  }

  // 3. Dinamik Kategoriyalar (Katalog filtrlari uchun)
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const [categories]: any = await db.query('SELECT id, slug, updated_at FROM categories');

    if (Array.isArray(categories)) {
      categories.forEach((cat) => {
        const slug = cat.slug || cat.id;
        const lastMod = cat.updated_at ? new Date(cat.updated_at) : currentDate;

        categoryEntries.push({
          url: `${BASE_URL}/catalog?category=${encodeURIComponent(slug)}`,
          lastModified: lastMod,
          changeFrequency: 'weekly',
          priority: 0.7,
        });

        categoryEntries.push({
          url: `${BASE_URL}/uz/catalog?category=${encodeURIComponent(slug)}`,
          lastModified: lastMod,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }
  } catch (err) {
    console.error('Sitemap categories fetch error:', err);
  }

  // 4. Dinamik CMS Sahifalar (`/page/[slug]`)
  let cmsEntries: MetadataRoute.Sitemap = [];
  try {
    const [pages]: any = await db.query(
      'SELECT slug, updated_at FROM pages WHERE is_published = 1'
    );

    if (Array.isArray(pages)) {
      pages.forEach((page) => {
        const lastMod = page.updated_at ? new Date(page.updated_at) : currentDate;

        cmsEntries.push({
          url: `${BASE_URL}/page/${encodeURIComponent(page.slug)}`,
          lastModified: lastMod,
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
          lastModified: lastMod,
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
    console.error('Sitemap pages fetch error:', err);
  }

  return [...staticEntries, ...productEntries, ...categoryEntries, ...cmsEntries];
}