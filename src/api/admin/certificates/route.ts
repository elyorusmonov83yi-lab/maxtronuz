import { Router, Request, Response } from 'express';
import { db } from '../../../server/db.ts';
import { requireAdmin } from '../../../middleware/auth.ts';

const router = Router();

function parseIfJson(val: any, fallback: any = {}) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return val || fallback;
  }
}

// 1. GET: Barcha sertifikatlarni olish (Ochiq endpoint)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM certificates ORDER BY id DESC');
    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });

    const certificates = rows.map((c: any) => ({
      id: c.id,
      number: c.certNumber || c.number || '',
      certNumber: c.certNumber || c.number || '',
      title: parseIfJson(c.title, { uz: '', ru: '' }),
      description: parseIfJson(c.description, null),
      issuer: parseIfJson(c.issuer, { uz: '', ru: '' }),
      issueDate: c.issueDate || '',
      validUntil: c.validUntil || '',
      standard: c.standard || '',
      docNumber: c.docNumber || '',
      image: c.image || c.previewUrl || '',
      previewUrl: c.image || c.previewUrl || '',
      pdfUrl: c.pdfUrl || ''
    }));

    res.json({ success: true, data: certificates });
  } catch (error: any) {
    console.error('Certificates GET Error:', error.message);
    res.status(500).json({ success: false, message: 'Sertifikatlarni yuklashda xatolik' });
  }
});

// 2. POST: Sertifikatni saqlash yoki yangilash (🔒 Faqat Admin)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const cert = req.body;
    if (!cert) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh yuborildi" });
    }

    const certId = String(cert.id || `cert-${Date.now()}`);
    const certNumber = String(cert.certNumber || cert.number || '');
    
    const title = typeof cert.title === 'object' 
      ? JSON.stringify(cert.title) 
      : JSON.stringify({ uz: cert.title || '', ru: cert.title || '' });

    const description = cert.description 
      ? (typeof cert.description === 'object' ? JSON.stringify(cert.description) : JSON.stringify(cert.description)) 
      : null;

    const issuer = typeof cert.issuer === 'object' 
      ? JSON.stringify(cert.issuer) 
      : JSON.stringify({ uz: cert.issuer || '', ru: cert.issuer || '' });

    const issueDate = cert.issueDate ? String(cert.issueDate) : null;
    const validUntil = cert.validUntil ? String(cert.validUntil) : null;
    const image = String(cert.image || cert.previewUrl || '');
    const pdfUrl = String(cert.pdfUrl || '');

    await db.query(
      `INSERT INTO certificates 
        (id, title, description, issuer, issueDate, validUntil, certNumber, image, pdfUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        title = VALUES(title),
        description = VALUES(description),
        issuer = VALUES(issuer),
        issueDate = VALUES(issueDate),
        validUntil = VALUES(validUntil),
        certNumber = VALUES(certNumber),
        image = VALUES(image),
        pdfUrl = VALUES(pdfUrl)`,
      [certId, title, description, issuer, issueDate, validUntil, certNumber, image, pdfUrl]
    );

    res.json({ success: true, id: certId, message: 'Сертификат муваффақиятли сақланди' });
  } catch (error: any) {
    console.error('Certificates POST Error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Sertifikatni saqlashda xatolik' });
  }
});

// 3. DELETE: Sertifikatni o'chirish (🔒 Faqat Admin)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM certificates WHERE id = ?', [id]);
    res.json({ success: true, message: 'Сертификат муваффақиятли ўчирилди' });
  } catch (error: any) {
    console.error('Certificates DELETE Error:', error.message);
    res.status(500).json({ success: false, message: 'Sertifikatni o‘chirishda xatolik' });
  }
});

export default router;