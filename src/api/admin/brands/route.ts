import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../../server/db.js';
import { requireAdmin } from '../../../middleware/auth.js';

const router = Router();

// 1. GET: Barcha brendlarni olish
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM brands ORDER BY name ASC');
    res.json({ success: true, data: Array.isArray(rows) ? rows : [] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. POST: Brendni saqlash yoki yangilash
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const b = req.body;
    if (!b || !b.name) {
      return res.status(400).json({ success: false, message: "Brend nomi bo'sh" });
    }

    const id = String(b.id || `brand-${Date.now()}`);
    const name = String(b.name).trim();
    const slug = String(b.slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-')).trim();
    const country = String(b.country || '').trim();
    const website = String(b.website || '').trim();
    const logo = String(b.logo || '').trim();
    const isActive = b.isActive !== false ? 1 : 0;

    await db.query(
      `INSERT INTO brands (id, name, slug, country, website, logo, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        slug = VALUES(slug),
        country = VALUES(country),
        website = VALUES(website),
        logo = VALUES(logo),
        isActive = VALUES(isActive)`,
      [id, name, slug, country, website, logo, isActive]
    );

    res.json({ success: true, id, message: 'Brend saqlandi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. DELETE: Brendni o'chirish
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM brands WHERE id = ?', [id]);
    res.json({ success: true, message: 'Brend o‘chirildi' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;