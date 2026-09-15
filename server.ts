import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// MariaDB Admin Marshrutlari
import headerAdminRoute from './src/api/admin/header/route';
import categoriesAdminRoute from './src/api/admin/categories/route';
import productsAdminRoute from './src/api/admin/products/route';
import quotesAdminRoute from './src/api/admin/quotes/route';
import certificatesAdminRoute from './src/api/admin/certificates/route';
import clientsAdminRoute from './src/api/admin/clients/route';
import pagesAdminRoute from './src/api/admin/pages/route';
import settingsAdminRoute from './src/api/admin/settings/route';
import usersAdminRoute from './src/api/admin/users/route';
import uploadAdminRoute from './src/api/admin/upload/route';
import industriesAdminRoute from './src/api/admin/industries/route';
import brandRouter from './src/api/admin/brands/route';
import { serveSitemap } from './src/server/sitemap';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- 🌟 STATIK PAPKALAR (/uploads brauzerda ochilishi uchun) ---
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
app.use('/uploads', express.static(uploadsDir));
app.get('/sitemap.xml', serveSitemap);

// --- MariaDB API Marshrutlari ---
app.use('/api/admin/header', headerAdminRoute);
app.use('/api/header', headerAdminRoute);

app.use('/api/admin/categories', categoriesAdminRoute);
app.use('/api/categories', categoriesAdminRoute);

app.use('/api/admin/products', productsAdminRoute);
app.use('/api/products', productsAdminRoute);

app.use('/api/admin/quotes', quotesAdminRoute);
app.use('/api/quotes', quotesAdminRoute);

app.use('/api/admin/certificates', certificatesAdminRoute);
app.use('/api/certificates', certificatesAdminRoute);

app.use('/api/admin/clients', clientsAdminRoute);
app.use('/api/clients', clientsAdminRoute);

app.use('/api/admin/pages', pagesAdminRoute);
app.use('/api/pages', pagesAdminRoute);

app.use('/api/admin/settings', settingsAdminRoute);
app.use('/api/settings', settingsAdminRoute);
app.use('/api/admin/brands', brandRouter);
app.use('/api/brands', brandRouter); // 🌟 Shu qatorni qo'shib qo'ying

app.use('/api/admin/users', usersAdminRoute);
app.use('/api/users', usersAdminRoute);

app.use('/api/admin/upload', uploadAdminRoute);
app.use('/api/upload', uploadAdminRoute);
// Tepasiga import:


// Pastiga (boshqa marshrutlar qatoriga):
app.use('/api/admin/industries', industriesAdminRoute);
app.use('/api/industries', industriesAdminRoute);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    storage: 'mariadb_database',
    databaseConnected: true
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MAXTRON Server running on http://localhost:${PORT}`);
  });
}

startServer();
