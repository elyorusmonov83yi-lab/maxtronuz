import { MetadataRoute } from 'next';
import { db } from '@/server/db';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://maxtron.uz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // 1. Asosiy statik sahifalar (noindex bo'lgan /compare chiqarib tashlandi)
  const staticRoutes = [
    '',
    '/catalog',
    '/about',
    '/contact',
    '/certificates',
    '/services',
    '/projects',
    '/equipment-finder',
    '/quote',
  ];

  const staticEntries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    const ruUrl = `${BASE_URL}${route}`;
    const uzUrl = `${BASE_URL}/uz${route}`;

    // Ruscha versiya
    staticEntries.push({
      url: ruUrl,
      lastModified: currentDate,
      changeFrequency: route === '' || route === '/catalog' ? 'daily' : 'weekly',
      priority: route === '' ? 1.0 : 0.8,
      alternates: {
        languages: {
          ru: ruUrl,
          uz: uzUrl,
        },
      },
    });

    // O'zbekcha versiya
    staticEntries.push({
      url: uzUrl,
      lastModified: currentDate,
      changeFrequency: route === '' || route === '/catalog' ? 'daily' : 'weekly',
      priority: route === '' ? 0.9 : 0.8,
      alternates: {
        languages: {
          ru: ruUrl,
          uz: uzUrl,
        },
      },
    });
  }

  // 2. Dinamik mahsulotlar (products)
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const [products]: any = await db.query('SELECT id, slug FROM products');

    if (Array.isArray(products)) {
      products.forEach((p) => {
        let slugRu = String(p.id);
        let slugUz = String(p.id);

        if (p.slug) {
          try {
            const parsed = typeof p.slug === 'string' ? JSON.parse(p.slug) : p.slug;
            slugRu = parsed.ru || parsed.uz || String(p.id);
            slugUz = parsed.uz || parsed.ru || String(p.id);
          } catch {
            slugRu = String(p.slug);
            slugUz = String(p.slug);
          }
        }

        const ruUrl = `${BASE_URL}/product/${encodeURIComponent(slugRu)}`;
        const uzUrl = `${BASE_URL}/uz/product/${encodeURIComponent(slugUz)}`;

        productEntries.push({
          url: ruUrl,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.9,
          alternates: {
            languages: {
              ru: ruUrl,
              uz: uzUrl,
            },
          },
        });

        productEntries.push({
          url: uzUrl,
          lastModified: currentDate,
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: {
              ru: ruUrl,
              uz: uzUrl,
            },
          },
        });
      });
    }
  } catch (err) {
    console.error('Sitemap products xatoligi:', err);
  }

  // 3. Dinamik CMS sahifalar (pages)
  let cmsEntries: MetadataRoute.Sitemap = [];
  try {
    const [pages]: any = await db.query('SELECT slug FROM pages');

    if (Array.isArray(pages)) {
      pages.forEach((page) => {
        if (!page.slug) return;

        let slugRu = '';
        let slugUz = '';

        try {
          const parsed = typeof page.slug === 'string' ? JSON.parse(page.slug) : page.slug;
          if (typeof parsed === 'object' && parsed !== null) {
            slugRu = parsed.ru || parsed.uz || '';
            slugUz = parsed.uz || parsed.ru || '';
          } else {
            slugRu = String(page.slug);
            slugUz = String(page.slug);
          }
        } catch {
          slugRu = String(page.slug);
          slugUz = String(page.slug);
        }

        if (!slugRu && !slugUz) return;

        const ruUrl = `${BASE_URL}/page/${encodeURIComponent(slugRu || slugUz)}`;
        const uzUrl = `${BASE_URL}/uz/page/${encodeURIComponent(slugUz || slugRu)}`;

        cmsEntries.push({
          url: ruUrl,
          lastModified: currentDate,
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: {
              ru: ruUrl,
              uz: uzUrl,
            },
          },
        });

        cmsEntries.push({
          url: uzUrl,
          lastModified: currentDate,
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: {
              ru: ruUrl,
              uz: uzUrl,
            },
          },
        });
      });
    }
  } catch (err) {
    console.error('Sitemap pages xatoligi:', err);
  }

  return [...staticEntries, ...productEntries, ...cmsEntries];
}