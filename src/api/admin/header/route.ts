import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../../server/db.js';
import { requireAdmin } from '../../../middleware/auth.js';

const router = Router();

// 1. GET: /api/admin/header (Saytga kirgan hamma uchun ochiq)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      "SELECT setting_value FROM site_settings WHERE setting_key = 'header_settings' LIMIT 1"
    );

    if (Array.isArray(rows) && rows.length > 0 && rows[0].setting_value) {
      const val = rows[0].setting_value;

      if (typeof val === 'object' && val !== null) {
        return res.json({ success: true, data: val });
      }

      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed || trimmed === '[object Object]') {
          return res.json({ success: true, data: {} });
        }
        try {
          return res.json({ success: true, data: JSON.parse(trimmed) });
        } catch {
          return res.json({ success: true, data: {} });
        }
      }
    }

    res.json({ success: true, data: {} });
  } catch (error: any) {
    console.error('Header DB load error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. POST: /api/admin/header (🔒 Faqat Admin o'zgartira oladi)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh yuborildi" });
    }

    const headerData = typeof body === 'object' ? JSON.stringify(body) : String(body);

    await db.query(
      `INSERT INTO site_settings (setting_key, setting_value) 
       VALUES ('header_settings', ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [headerData, headerData]
    );

    res.json({ success: true, message: 'Header sozlamalari muvaffaqiyatli saqlandi' });
  } catch (error: any) {
    console.error('Header DB save error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;