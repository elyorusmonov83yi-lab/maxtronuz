import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { requireAdmin } from '../../../middleware/auth.ts';

const router = Router();
const baseUploadDir = path.resolve(process.cwd(), 'public', 'uploads');
const allowedExtensions = new Set(['.webp', '.avif', '.png', '.jpg', '.jpeg', '.svg', '.pdf', '.docx', '.xlsx']);
const allowedMimeTypes = new Set([
  'image/webp', 'image/avif', 'image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

const storage = multer.diskStorage({
  destination: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const folder = extension === '.pdf' ? 'certificates' : ['.docx', '.xlsx'].includes(extension) ? 'documents' : 'products';
    const directory = path.join(baseUploadDir, folder);
    fs.mkdirSync(directory, { recursive: true });
    callback(null, directory);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error('Ruxsat etilmagan fayl formati'));
    }
    callback(null, true);
  }
});

router.post('/', requireAdmin, (req: Request, res: Response) => {
  upload.single('file')(req, res, (error: unknown) => {
    if (error) {
      const message = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
        ? 'Fayl hajmi 30 MB dan oshmasligi kerak'
        : error instanceof Error ? error.message : 'Fayl yuklashda xatolik';
      return res.status(400).json({ success: false, message });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'Fayl yuborilmadi' });

    const directory = path.basename(path.dirname(req.file.path));
    return res.json({ success: true, url: `/uploads/${directory}/${req.file.filename}`, name: req.file.originalname });
  });
});

export default router;
