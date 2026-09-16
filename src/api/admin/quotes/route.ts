import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../../../server/db.js';
import { requireAdmin } from '../../../middleware/auth.js';
import { TelegramService } from '../../../services/telegramService.js'; // 🌟 To'g'ri import yo'li

const router = Router();

// 1. GET: Barcha buyurtmalarni olish (🔒 Faqat Admin ko'ra oladi)
router.get('/', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      'SELECT * FROM quotes ORDER BY id DESC'
    );

    if (!Array.isArray(rows)) return res.json({ success: true, data: [] });

    const quotes = rows.map((q: any) => ({
      id: q.id,
      companyName: q.companyName || '',
      contactPerson: q.contactPerson || '',
      phone: q.phone || '',
      email: q.email || '',
      inn: q.inn || '',
      selectedProductId: q.selectedProductId || '',
      productName: q.productName || '',
      quantity: Number(q.quantity) || 1,
      totalEstimate: Number(q.totalEstimate) || 0,
      notes: q.notes || '',
      status: q.status || 'new',
      createdAt: q.createdAt || q.created_at ? new Date(q.createdAt || q.created_at).toISOString() : new Date().toISOString()
    }));

    res.json({ success: true, data: quotes });
  } catch (error: any) {
    console.error('Quotes DB load error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. POST: Yangi buyurtma yuborish (🌐 Ochiq endpoint - mijozlar uchun)
router.post('/', async (req: Request, res: Response) => {
  try {
    const quote = req.body;
    if (!quote || Object.keys(quote).length === 0) {
      return res.status(400).json({ success: false, message: "Buyurtma ma'lumotlari bo'sh" });
    }

    const quoteId = String(quote.id || `quote-${Date.now()}`);
    const companyName = String(quote.companyName || '');
    const contactPerson = String(quote.contactPerson || '');
    const phone = String(quote.phone || '');
    const email = String(quote.email || '');
    const inn = String(quote.inn || '');
    const selectedProductId = String(quote.selectedProductId || '');
    const productName = String(quote.productName || 'Umumiy so‘rov');
    const quantity = Number(quote.quantity) || 1;
    const totalEstimate = Number(quote.totalEstimate) || 0;
    const notes = String(quote.notes || '');
    const status = String(quote.status || 'new');

    // 1. Bazaga yozish
    await db.query(
      `INSERT INTO quotes 
        (id, companyName, contactPerson, phone, email, inn, selectedProductId, productName, quantity, totalEstimate, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        companyName = VALUES(companyName),
        contactPerson = VALUES(contactPerson),
        phone = VALUES(phone),
        email = VALUES(email),
        inn = VALUES(inn),
        selectedProductId = VALUES(selectedProductId),
        productName = VALUES(productName),
        quantity = VALUES(quantity),
        totalEstimate = VALUES(totalEstimate),
        notes = VALUES(notes),
        status = VALUES(status)`,
      [quoteId, companyName, contactPerson, phone, email, inn, selectedProductId, productName, quantity, totalEstimate, notes, status]
    );

    // 2. Telegram Bot orqali bildirishnoma yuborish (Asinxron)
    try {
      await TelegramService.sendQuoteNotification({
        id: quoteId,
        companyName,
        contactPerson,
        phone,
        email,
        inn,
        selectedProductId: productName ? `${productName} (${selectedProductId})` : selectedProductId,
        quantity,
        totalEstimate,
        notes
      });
    } catch (tgErr: any) {
      console.warn('⚠️ Telegram xabarnoma yuborishda xatolik:', tgErr.message);
    }

    res.json({ success: true, id: quoteId, message: 'Buyurtmangiz muvaffaqiyatli qabul qilindi' });
  } catch (error: any) {
    console.error('Quote DB save error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. PATCH: Buyurtma holatini (statusini) yangilash (🔒 Faqat Admin)
router.patch('/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status ko‘rsatilmadi' });
    }

    await db.query('UPDATE quotes SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Status muvaffaqiyatli yangilandi' });
  } catch (error: any) {
    console.error('Quote status update error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. DELETE: Buyurtmani o'chirish (🔒 Faqat Admin)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM quotes WHERE id = ?', [id]);
    res.json({ success: true, message: 'Buyurtma muvaffaqiyatli o‘chirildi' });
  } catch (error: any) {
    console.error('Quote DB delete error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
