import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../../server/db.ts';
import { requireAdmin } from '../../../middleware/auth.ts';

const router = Router();

function safeJsonParse(val: any, fallback: any = {}) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    const parsed = JSON.parse(val);
    return parsed ?? fallback;
  } catch {
    return val || fallback;
  }
}

// 1. GET: Barcha sahifalarni olish (Ochiq endpoint)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM pages ORDER BY createdAt ASC, id ASC');
    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });

    const pages = rows.map((p: any) => ({
      id: p.id,
      slug: p.slug || '',
      title: safeJsonParse(p.title, { uz: '', ru: '' }),
      subtitle: safeJsonParse(p.subtitle, { uz: '', ru: '' }),
      content: safeJsonParse(p.content, { uz: '', ru: '' }),
      isPublished: Boolean(p.isPublished ?? 1),
      showInHeader: Boolean(p.showInHeader ?? 0),
      showInFooter: Boolean(p.showInFooter ?? 1),
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString()
    }));

    res.json({ success: true, data: pages });
  } catch (error: any) {
    console.error('Pages DB load error:', error.message);
    res.status(500).json({ success: false, message: 'Sahifalarni yuklashda xatolik' });
  }
});

// 2. POST: Sahifani saqlash yoki yangilash (🔒 Faqat Admin)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = req.body;
    if (!page) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh yuborildi" });
    }

    const pageId = String(page.id || `page-${Date.now()}`);
    const slug = (page.slug || pageId).toLowerCase().trim().replace(/[^a-z0-9-_]/g, '-');
    const title = typeof page.title === 'object' ? JSON.stringify(page.title) : JSON.stringify({ uz: page.title || '', ru: page.title || '' });
    const subtitle = typeof page.subtitle === 'object' ? JSON.stringify(page.subtitle) : JSON.stringify(page.subtitle || {});
    const content = typeof page.content === 'object' ? JSON.stringify(page.content) : JSON.stringify(page.content || {});
    const isPublished = page.isPublished ? 1 : 0;
    const showInHeader = page.showInHeader ? 1 : 0;
    const showInFooter = page.showInFooter ? 1 : 0;

    await db.query(
      `INSERT INTO pages 
        (id, slug, title, subtitle, content, isPublished, showInHeader, showInFooter)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        slug = VALUES(slug),
        title = VALUES(title),
        subtitle = VALUES(subtitle),
        content = VALUES(content),
        isPublished = VALUES(isPublished),
        showInHeader = VALUES(showInHeader),
        showInFooter = VALUES(showInFooter),
        updatedAt = CURRENT_TIMESTAMP`,
      [pageId, slug, title, subtitle, content, isPublished, showInHeader, showInFooter]
    );

    res.json({ success: true, id: pageId, message: 'Sahifa muvaffaqiyatli saqlandi' });
  } catch (error: any) {
    console.error('Page DB save error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Sahifani saqlashda xatolik' });
  }
});

// 3. DELETE: Sahifani o'chirish (🔒 Faqat Admin)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM pages WHERE id = ?', [id]);
    res.json({ success: true, message: 'Sahifa muvaffaqiyatli o‘chirildi' });
  } catch (error: any) {
    console.error('Page DB delete error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Sahifani o‘chirishda xatolik' });
  }
});

export default router;