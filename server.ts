import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import app from './app.ts';
// MariaDB ulanishingizni import qiling:
import { pool } from './src/server/db.ts'; // agar boshqa joyda bo'lsa, yo'lini moslang

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // 🌟 1. TELEGRAM VA IJTIMOIY TARMOQ BOTLARI UCHUN DINAMIK SEO
    app.get('*', async (req, res, next) => {
      const userAgent = req.headers['user-agent'] || '';
      const isBot = /TelegramBot|facebookexternalhit|Twitterbot|WhatsApp/i.test(userAgent);

      // Agar oddiy odam bo'lsa, keyingi statik middleware'ga o'tkazamiz
      if (!isBot) {
        return next();
      }

      try {
        const siteUrl = process.env.SITE_URL || 'https://maxtron.uz';
        const originalUrl = req.originalUrl;
        
        let title = 'MAXTRON — Sanoat uskunalari va KIPiA';
        let description = 'O‘lchov va nazorat uskunalari, manometrlar, datchiklar';
        let image = `${siteUrl}/uploads/default-og.jpg`;

        // A. Tovar sahifasi bo'lsa: /product/:slug yoki /uz/product/:slug
        const productMatch = originalUrl.match(/\/product\/([^\/?#]+)/);
        if (productMatch) {
          const slug = decodeURIComponent(productMatch[1]);
          const [products]: any = await pool.query(
            'SELECT name, description, image, images FROM products WHERE slug = ? OR id = ? LIMIT 1',
            [slug, slug]
          );

          if (products && products.length > 0) {
            const prod = products[0];
            title = typeof prod.name === 'object' ? (prod.name.ru || prod.name.uz) : (prod.name || title);
            title = `${title} — MAXTRON`;
            
            const rawDesc = typeof prod.description === 'object' ? (prod.description.ru || prod.description.uz) : (prod.description || description);
            description = rawDesc ? rawDesc.replace(/<[^>]*>/g, '').slice(0, 160) : '';

            const rawImg = prod.image || (Array.isArray(prod.images) ? prod.images[0] : null);
            if (rawImg && !rawImg.startsWith('data:')) {
              image = rawImg.startsWith('http') ? rawImg : `${siteUrl}${rawImg}`;
            }
          }
        } else {
          // B. Bosh sahifa yoki umumiy sahifalar bo'lsa — Admin SEO sozlamalaridan olamiz
          const [settings]: any = await pool.query(
            'SELECT meta_title_ru, meta_title_uz, meta_description_ru, meta_description_uz, og_image FROM settings_seo LIMIT 1'
          );
          if (settings && settings.length > 0) {
            const seo = settings[0];
            title = seo.meta_title_ru || seo.meta_title_uz || title;
            description = seo.meta_description_ru || seo.meta_description_uz || description;
            if (seo.og_image && !seo.og_image.startsWith('data:')) {
              image = seo.og_image.startsWith('http') ? seo.og_image : `${siteUrl}${seo.og_image}`;
            }
          }
        }

        // C. dist/index.html faylini o'qib, meta teglarni almashtirish
        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) {
          return next();
        }

        let html = fs.readFileSync(indexPath, 'utf8');

        html = html
          .replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`)
          .replace(/<meta\s+property=["']og:title["'].*?>/gi, `<meta property="og:title" content="${title}" />`)
          .replace(/<meta\s+name=["']twitter:title["'].*?>/gi, `<meta name="twitter:title" content="${title}" />`)
          .replace(/<meta\s+property=["']og:description["'].*?>/gi, `<meta property="og:description" content="${description}" />`)
          .replace(/<meta\s+name=["']description["'].*?>/gi, `<meta name="description" content="${description}" />`)
          .replace(/<meta\s+name=["']twitter:description["'].*?>/gi, `<meta name="twitter:description" content="${description}" />`)
          .replace(/<meta\s+property=["']og:image["'].*?>/gi, `<meta property="og:image" content="${image}" />`)
          .replace(/<meta\s+name=["']twitter:image["'].*?>/gi, `<meta name="twitter:image" content="${image}" />`)
          .replace(/<meta\s+property=["']og:url["'].*?>/gi, `<meta property="og:url" content="${siteUrl}${originalUrl}" />`);

        return res.status(200).send(html);
      } catch (err) {
        console.error('Telegram bot SEO xatosi:', err);
        return next();
      }
    });

    // 🌟 2. ODDIY FOYDALANUVCHILAR UCHUN STATIK VITE DIST
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MAXTRON Server running on http://localhost:${PORT}`);
  });
}

// Ham dev, ham production rejimda server ishga tushishi uchun:
startServer();