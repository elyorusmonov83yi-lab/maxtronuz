import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { requireAdmin } from '../../../middleware/auth';

const router = Router();

// Asosiy uploads papkalari
const baseUploadDir = path.resolve(process.cwd(), 'public', 'uploads');
const productsDir = path.join(baseUploadDir, 'products');
const certsDir = path.join(baseUploadDir, 'certificates');
const docsDir = path.join(baseUploadDir, 'documents');

// Barcha papkalarni avtomatik yaratish
[baseUploadDir, productsDir, certsDir, docsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// POST /api/admin/upload (🔒 Faqat Admin)
router.post('/', requireAdmin, (req: Request, res: Response) => {
  const chunks: Buffer[] = [];

  req.on('data', (chunk) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    try {
      const fullBuffer = Buffer.concat(chunks);

      if (fullBuffer.length === 0) {
        return res.status(400).json({ success: false, message: 'Файл юборилмади' });
      }

      // Fayl hajmi tekshiruvi (Maks. 30 MB)
      if (fullBuffer.length > 30 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'Файл ҳажми 30 МБ дан ошмаслиги керак' });
      }

      // Multipart form boundary orqali faylni ajratish
      const contentType = req.headers['content-type'] || '';
      const boundaryMatch = contentType.match(/boundary=(?:["']?)([^"';]+)(?:["']?)/);

      let fileBuffer: Buffer = fullBuffer;
      let originalName = 'upload.webp';

      if (boundaryMatch) {
        const boundary = boundaryMatch[1];
        const boundaryBuffer = Buffer.from(`--${boundary}`);
        
        const startIdx = fullBuffer.indexOf(boundaryBuffer);
        if (startIdx !== -1) {
          const headerEndPattern = Buffer.from('\r\n\r\n');
          const headerStart = startIdx + boundaryBuffer.length;
          const headerEnd = fullBuffer.indexOf(headerEndPattern, headerStart);

          if (headerEnd !== -1) {
            const headerStr = fullBuffer.subarray(headerStart, headerEnd).toString('utf-8');
            const nameMatch = headerStr.match(/filename="([^"]+)"/);
            if (nameMatch) {
              originalName = nameMatch[1];
            }

            const dataStart = headerEnd + 4;
            const nextBoundary = fullBuffer.indexOf(boundaryBuffer, dataStart);
            const dataEnd = nextBoundary !== -1 ? nextBoundary - 2 : fullBuffer.length;

            fileBuffer = fullBuffer.subarray(dataStart, dataEnd);
          }
        }
      }

      // Kengaytmani aniqlash va tekshirish
      let ext = path.extname(originalName).toLowerCase();
      
      // Ruxsat etilgan barcha formatlar (WebP, AVIF, PDF, JPG, PNG, DOCX, XLSX)
      const allowedExtensions = ['.webp', '.avif', '.png', '.jpg', '.jpeg', '.svg', '.pdf', '.docx', '.xlsx'];
      
      if (!ext || !allowedExtensions.includes(ext)) {
        if (originalName.toLowerCase().includes('.pdf')) ext = '.pdf';
        else if (originalName.toLowerCase().includes('.webp')) ext = '.webp';
        else if (originalName.toLowerCase().includes('.avif')) ext = '.avif';
        else ext = '.webp'; // Standart format
      }

      // Fayl turiga qarab papkani tanlash:
      let targetDir = productsDir;
      let subFolder = 'products';
      let prefix = 'prod';

      if (ext === '.pdf') {
        targetDir = certsDir;
        subFolder = 'certificates';
        prefix = 'doc';
      } else if (['.docx', '.xlsx'].includes(ext)) {
        targetDir = docsDir;
        subFolder = 'documents';
        prefix = 'file';
      } else {
        // Rasmlar (.webp, .avif, .jpg, .png)
        targetDir = productsDir;
        subFolder = 'products';
        prefix = 'img';
      }

      const cleanFileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const filePath = path.join(targetDir, cleanFileName);

      // Diskka saqlash
      fs.writeFileSync(filePath, fileBuffer);

      const publicUrl = `/uploads/${subFolder}/${cleanFileName}`;
      console.log(`✅ [UPLOAD] Yangi fayl saqlandi (${ext}): ${publicUrl} (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);

      return res.json({
        success: true,
        url: publicUrl,
        name: originalName,
        format: ext.replace('.', '')
      });
    } catch (err: any) {
      console.error('❌ [UPLOAD ERROR]:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Серверда файлни сақлашда хатолик'
      });
    }
  });

  req.on('error', (err) => {
    console.error('❌ [STREAM ERROR]:', err);
    return res.status(500).json({ success: false, message: 'Оқимда хатолик' });
  });
});

export default router;