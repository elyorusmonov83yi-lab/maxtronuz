import { Router, Request, Response } from 'express';
import { db } from '../../../server/db.ts';
import { requireAdmin } from '../../../middleware/auth.ts';

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

// 1. GET: Barcha toifalarni olish (Ochiq endpoint)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM categories ORDER BY id ASC');
    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });

    const categories = rows.map((c: any) => ({
      id: c.id,
      parentId: c.parentId && c.parentId !== 'none' && c.parentId !== '' ? c.parentId : null,
      slug: parseIfJson(c.slug, { uz: c.id, ru: c.id }),
      name: parseIfJson(c.name, { uz: c.id, ru: c.id }),
      description: parseIfJson(c.description, { uz: '', ru: '' }),
      icon: c.icon || 'Layers',
      image: c.image || '',
      seoTitle: parseIfJson(c.seoTitle, { uz: '', ru: '' }),
      seoDescription: parseIfJson(c.seoDescription, { uz: '', ru: '' }),
      seoKeywords: parseIfJson(c.seoKeywords, { uz: '', ru: '' }),
      ogImage: c.ogImage || ''
    }));

    res.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Categories DB load error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. POST: Toifani saqlash yoki yangilash (🔒 Faqat Admin)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const cat = req.body;
    if (!cat) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh yuborildi" });
    }

    const catId = cat.id || `cat-${Date.now().toString().slice(-6)}`;
    
    // parentId bo'sh bo'lsa null qilamiz
    const parentId = cat.parentId && cat.parentId !== 'none' && cat.parentId !== '' ? cat.parentId : null;

    const slug = typeof cat.slug === 'object' ? JSON.stringify(cat.slug) : JSON.stringify({ uz: catId, ru: catId });
    const name = typeof cat.name === 'object' ? JSON.stringify(cat.name) : JSON.stringify({ uz: cat.name || '', ru: cat.name || '' });
    const description = typeof cat.description === 'object' ? JSON.stringify(cat.description) : JSON.stringify({ uz: '', ru: '' });
    const icon = cat.icon || 'Layers';
    const image = cat.image || '';
    const seoTitle = typeof cat.seoTitle === 'object' ? JSON.stringify(cat.seoTitle) : JSON.stringify({});
    const seoDescription = typeof cat.seoDescription === 'object' ? JSON.stringify(cat.seoDescription) : JSON.stringify({});
    const seoKeywords = typeof cat.seoKeywords === 'object' ? JSON.stringify(cat.seoKeywords) : JSON.stringify({});
    const ogImage = cat.ogImage || cat.image || '';

    await db.query(
      `INSERT INTO categories 
        (id, parentId, slug, name, description, icon, image, seoTitle, seoDescription, seoKeywords, ogImage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        parentId = VALUES(parentId),
        slug = VALUES(slug),
        name = VALUES(name),
        description = VALUES(description),
        icon = VALUES(icon),
        image = VALUES(image),
        seoTitle = VALUES(seoTitle),
        seoDescription = VALUES(seoDescription),
        seoKeywords = VALUES(seoKeywords),
        ogImage = VALUES(ogImage)`,
      [catId, parentId, slug, name, description, icon, image, seoTitle, seoDescription, seoKeywords, ogImage]
    );

    res.json({ success: true, id: catId, message: 'Kategoriya muvaffaqiyatli saqlandi' });
  } catch (error: any) {
    console.error('Category DB save error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. DELETE: Toifani o'chirish (🔒 Faqat Admin)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true, message: 'Kategoriya o‘chirildi' });
  } catch (error: any) {
    console.error('Category DB delete error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;