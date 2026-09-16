import { Router, Request, Response } from 'express';
import { db } from '../../../server/db.ts';
import { requireAdmin } from '../../../middleware/auth.ts';

const router = Router();

// 1. GET: Barcha hamkorlarni olish (Ochiq endpoint)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      'SELECT * FROM clients ORDER BY orderIndex ASC, id ASC'
    );

    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });

    const clients = rows.map((c: any) => ({
      id: c.id,
      name: c.name || '',
      shortName: c.shortName || '',
      category: c.category || '',
      logo: c.logo || '',
      website: c.website || '',
      orderIndex: Number(c.orderIndex) || 0
    }));

    res.json({ success: true, data: clients });
  } catch (error: any) {
    console.error('Clients DB load error:', error.message);
    res.status(500).json({ success: false, message: 'Hamkorlarni yuklashda xatolik' });
  }
});

// 2. POST: Hamkorni saqlash yoki yangilash (🔒 Faqat Admin)
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const client = req.body;
    if (!client) {
      return res.status(400).json({ success: false, message: "Ma'lumotlar bo'sh yuborildi" });
    }

    const clientId = String(client.id || `client-${Date.now()}`);
    const name = String(client.name || '');
    const shortName = String(client.shortName || '');
    const category = String(client.category || '');
    const logo = String(client.logo || '');
    const website = String(client.website || '');
    const orderIndex = Number(client.orderIndex) || 0;

    await db.query(
      `INSERT INTO clients 
        (id, name, shortName, category, logo, website, orderIndex)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        shortName = VALUES(shortName),
        category = VALUES(category),
        logo = VALUES(logo),
        website = VALUES(website),
        orderIndex = VALUES(orderIndex)`,
      [clientId, name, shortName, category, logo, website, orderIndex]
    );

    res.json({ success: true, id: clientId, message: 'Hamkor muvaffaqiyatli saqlandi' });
  } catch (error: any) {
    console.error('Client DB save error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Hamkorni saqlashda xatolik' });
  }
});

// 3. DELETE: Hamkorni o'chirish (🔒 Faqat Admin)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ success: true, message: 'Hamkor o‘chirildi' });
  } catch (error: any) {
    console.error('Client DB delete error:', error.message);
    res.status(500).json({ success: false, message: 'Hamkorni o‘chirishda xatolik' });
  }
});

export default router;