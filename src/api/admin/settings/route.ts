import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../../server/db.ts';
import { requireAdmin } from '../../../middleware/auth.ts';

const router = Router();

function safeJsonParse(val: any, fallback: any = {}) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return val || fallback;
  }
}

// 1. GET: Barcha sozlamalarni olish (/api/admin/settings) - Ochiq endpoint
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query('SELECT `key`, value FROM settings');
    if (!Array.isArray(rows)) {
      return res.json({ success: true, data: {} });
    }

    const allSettings: Record<string, any> = {};
    rows.forEach((r: any) => {
      allSettings[r.key] = safeJsonParse(r.value, {});
    });

    res.json({ success: true, data: allSettings });
  } catch (error: any) {
    console.error('All settings fetch error:', error.message);
    res.status(500).json({ success: false, message: 'Barcha sozlamalarni yuklashda xatolik', error: error.message });
  }
});

// 2. GET: Kalit bo'yicha sozlamani olish (/api/admin/settings/:key) - Ochiq endpoint
router.get('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const [rows]: any = await db.query('SELECT value FROM settings WHERE `key` = ? LIMIT 1', [key]);

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: safeJsonParse(rows[0].value, {}) });
  } catch (error: any) {
    console.error(`Settings [${req.params.key}] fetch error:`, error.message);
    res.status(500).json({ success: false, message: 'Sozlamani yuklashda xatolik', error: error.message });
  }
});

// 3. POST: Kalit bo'yicha sozlamani saqlash (/api/admin/settings/:key) - 🔒 Faqat Admin
router.post('/:key', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const rawBody = req.body;

    if (rawBody === undefined || rawBody === null) {
      return res.status(400).json({ success: false, message: "Sozlama ma'lumotlari bo'sh" });
    }
    
    // JSON formatga xavfsiz aylantirish
    const value = typeof rawBody === 'object' ? JSON.stringify(rawBody) : String(rawBody);

    await db.query(
      `INSERT INTO settings (\`key\`, value, updatedAt)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE 
        value = VALUES(value),
        updatedAt = CURRENT_TIMESTAMP`,
      [key, value]
    );

    res.json({ success: true, message: `«${key}» sozlamasi muvaffaqiyatli saqlandi` });
  } catch (error: any) {
    console.error(`Settings [${req.params.key}] save error:`, error.message);
    res.status(500).json({ success: false, message: 'Sozlamani saqlashda xatolik', error: error.message });
  }
});

export default router;