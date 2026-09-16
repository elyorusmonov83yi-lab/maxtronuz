import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../../server/db.js';
import { requireAdmin } from '../../../middleware/auth.js';

const router = Router();

function parseIfJson(val: any, fallback: any = {}) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    const parsed = JSON.parse(val);
    return parsed ?? fallback;
  } catch {
    return val || fallback;
  }
}

// 1. GET: Sohalarni olish (Ochiq endpoint)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM industries ORDER BY created_at ASC');
    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });

    const industries = rows.map((r: any) => ({
      id: r.id,
      slug: r.slug || r.id,
      name: parseIfJson(r.name, { uz: '', ru: '' }),
      desc: parseIfJson(r.description, { uz: '', ru: '' }),
      icon: r.icon || 'Building2',
      tasks: parseIfJson(r.tasks, [])
    }));

    res.json({ success: true, data: industries });
  } catch (error: any) {
    console.error('Industries DB load error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. POST: Sohalarni saqlash (🔒 Faqat Admin)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    if (!payload || (Array.isArray(payload) && payload.length === 0)) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh yuborildi" });
    }

    if (Array.isArray(payload)) {
      await db.query('START TRANSACTION');
      await db.query('DELETE FROM industries');

      for (const ind of payload) {
        const indId = String(ind.id || `ind_${Date.now().toString().slice(-6)}`);
        const slug = String(ind.slug || indId);
        const name = typeof ind.name === 'object' ? JSON.stringify(ind.name) : JSON.stringify({ uz: ind.name || '', ru: ind.name || '' });
        const desc = typeof ind.desc === 'object' ? JSON.stringify(ind.desc) : JSON.stringify({ uz: '', ru: '' });
        const icon = String(ind.icon || 'Building2');
        const tasks = Array.isArray(ind.tasks) ? JSON.stringify(ind.tasks) : JSON.stringify([]);

        await db.query(
          `INSERT INTO industries (id, slug, name, description, icon, tasks) VALUES (?, ?, ?, ?, ?, ?)`,
          [indId, slug, name, desc, icon, tasks]
        );
      }

      await db.query('COMMIT');
      return res.json({ success: true, message: 'Sohalar muvaffaqiyatli saqlandi' });
    }

    res.json({ success: true });
  } catch (error: any) {
    try {
      await db.query('ROLLBACK');
    } catch (rbErr) {
      console.error('Rollback error:', rbErr);
    }
    console.error('Industries DB save error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. DELETE: Sohani o'chirish (🔒 Faqat Admin)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM industries WHERE id = ?', [id]);
    res.json({ success: true, message: 'Soha muvaffaqiyatli o‘chirildi' });
  } catch (error: any) {
    console.error('Industries DB delete error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;