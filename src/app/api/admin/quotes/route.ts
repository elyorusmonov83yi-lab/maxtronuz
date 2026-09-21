import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';
import { TelegramService } from '@/services/telegramService';

// 1. GET: Barcha buyurtmalarni olish (🔒 Faqat Admin)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const isAdmin = await verifyAdminToken(authHeader);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Ruxsat berilmagan' },
        { status: 401 }
      );
    }

    const [rows]: any = await db.query(
      'SELECT * FROM quotes ORDER BY id DESC'
    );

    if (!Array.isArray(rows)) {
      return NextResponse.json({ success: true, data: [] });
    }

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

    return NextResponse.json({ success: true, data: quotes });
  } catch (error: any) {
    console.error('Quotes DB load error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. POST: Yangi buyurtma yuborish (🌐 Ochiq endpoint - mijozlar uchun)
export async function POST(req: NextRequest) {
  try {
    const quote = await req.json();
    if (!quote || Object.keys(quote).length === 0) {
      return NextResponse.json(
        { success: false, message: "Buyurtma ma'lumotlari bo'sh" },
        { status: 400 }
      );
    }

    const quoteId = String(quote.id || `quote-${Date.now()}`);
    const companyName = String(quote.companyName || '').trim();
    const contactPerson = String(quote.contactPerson || '').trim();
    const phone = String(quote.phone || '').trim();
    const email = String(quote.email || '').trim();
    const inn = String(quote.inn || '').trim();
    const selectedProductId = String(quote.selectedProductId || '').trim();
    const productName = String(quote.productName || 'Umumiy so‘rov').trim();
    const quantity = Number(quote.quantity) || 1;
    const totalEstimate = Number(quote.totalEstimate) || 0;
    const notes = String(quote.notes || '').trim();
    const status = String(quote.status || 'new').trim();

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

    // 2. Telegram Bot orqali bildirishnoma yuborish
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
      console.warn('⚠️ Telegram xabarnoma yuborishda xatolik:', tgErr?.message);
    }

    return NextResponse.json({
      success: true,
      id: quoteId,
      message: 'Buyurtmangiz muvaffaqiyatli qabul qilindi'
    });
  } catch (error: any) {
    console.error('Quote DB save error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}