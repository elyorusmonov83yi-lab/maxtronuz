import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';

// 1. GET: Barcha hamkorlarni olish (Ochiq endpoint)
export async function GET() {
  try {
    const [rows]: any = await db.query(
      'SELECT * FROM clients ORDER BY orderIndex ASC, id ASC'
    );

    if (!Array.isArray(rows)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const clients = rows.map((c: any) => ({
      id: c.id,
      name: c.name || '',
      shortName: c.shortName || '',
      category: c.category || '',
      logo: c.logo || '',
      website: c.website || '',
      orderIndex: Number(c.orderIndex) || 0
    }));

    return NextResponse.json({ success: true, data: clients });
  } catch (error: any) {
    console.error('Clients DB load error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Hamkorlarni yuklashda xatolik' },
      { status: 500 }
    );
  }
}

// 2. POST: Hamkorni saqlash yoki yangilash (🔒 Faqat Admin)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const isAdmin = await verifyAdminToken(authHeader);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Ruxsat berilmagan' },
        { status: 401 }
      );
    }

    const client = await req.json();
    if (!client) {
      return NextResponse.json(
        { success: false, message: "Ma'lumotlar bo'sh yuborildi" },
        { status: 400 }
      );
    }

    const clientId = String(client.id || `client-${Date.now()}`);
    const name = String(client.name || '').trim();
    const shortName = String(client.shortName || '').trim();
    const category = String(client.category || '').trim();
    const logo = String(client.logo || '').trim();
    const website = String(client.website || '').trim();
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

    return NextResponse.json({
      success: true,
      id: clientId,
      message: 'Hamkor muvaffaqiyatli saqlandi'
    });
  } catch (error: any) {
    console.error('Client DB save error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message || 'Hamkorni saqlashda xatolik' },
      { status: 500 }
    );
  }
}