import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import multer from 'multer';
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

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- 🌟 STATIK PAPKALAR (/uploads brauzerda ochilishi uchun) ---
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// --- 🌟 MULTER SOZLAMASI (PDF va Rasmlar yuklash) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const certsDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
    }
    cb(null, certsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, cleanName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB gacha ruxsat
});

// --- 🌟 UPLOAD API MARSHRUTI ---
app.post('/api/admin/upload', upload.single('file'), (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Fayl yuborilmadi' });
    }

    const publicUrl = `/uploads/certificates/${req.file.filename}`;
    return res.json({
      success: true,
      url: publicUrl,
      name: req.file.originalname
    });
  } catch (err: any) {
    console.error('Upload Error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server yuklash xatosi' });
  }
});

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