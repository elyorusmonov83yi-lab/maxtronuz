import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

import headerAdminRoute from '../src/api/admin/header/route.ts';
import categoriesAdminRoute from '../src/api/admin/categories/route.ts';
import productsAdminRoute from '../src/api/admin/products/route.ts';
import quotesAdminRoute from '../src/api/admin/quotes/route.ts';
import certificatesAdminRoute from '../src/api/admin/certificates/route.ts';
import clientsAdminRoute from '../src/api/admin/clients/route.ts';
import pagesAdminRoute from '../src/api/admin/pages/route.ts';
import settingsAdminRoute from '../src/api/admin/settings/route.ts';
import usersAdminRoute from '../src/api/admin/users/route.ts';
import uploadAdminRoute from '../src/api/admin/upload/route.ts';
import industriesAdminRoute from '../src/api/admin/industries/route.ts';
import brandRouter from '../src/api/admin/brands/route.ts';
import { serveSitemap } from '../src/server/sitemap.ts';

dotenv.config();

const app = express();

app.disable('x-powered-by');

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

app.use('/uploads', express.static(uploadsDir));
app.get('/sitemap.xml', serveSitemap);

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
app.use('/api/brands', brandRouter);

app.use('/api/admin/users', usersAdminRoute);
app.use('/api/users', usersAdminRoute);

app.use('/api/admin/upload', uploadAdminRoute);
app.use('/api/upload', uploadAdminRoute);

app.use('/api/admin/industries', industriesAdminRoute);
app.use('/api/industries', industriesAdminRoute);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    storage: 'mariadb_database',
    databaseConnected: true
  });
});

export default app;
