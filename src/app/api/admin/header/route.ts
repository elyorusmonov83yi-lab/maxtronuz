import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';

// 1. GET: Header sozlamalarini olish (Ommaviy)
export async function GET() {
  try {
    const [rows]: any = await db.query(
      "SELECT setting_value FROM site_settings WHERE setting_key = 'header_settings' LIMIT 1"
    );

    if (Array.isArray(rows) && rows.length > 0 && rows[0]?.setting_value) {
      const val = rows[0].setting_value;

      if (typeof val === 'object' && val !== null) {
        return NextResponse.json({ success: true, data: val });
      }

      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed || trimmed === '[object Object]') {
          return NextResponse.json({ success: true, data: {} });
        }
        try {
          return NextResponse.json({ success: true, data: JSON.parse(trimmed) });
        } catch {
          return NextResponse.json({ success: true, data: {} });
        }
      }
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    console.error('Header DB load error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. POST: Header sozlamalarini saqlash yoki yangilash (🔒 Faqat Admin)
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

    const body = await req.json();
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      return NextResponse.json(
        { success: false, message: "Ma'lumotlar bo'sh yuborildi" },
        { status: 400 }
      );
    }

    const headerData = typeof body === 'object' ? JSON.stringify(body) : String(body);

    await db.query(
      `INSERT INTO site_settings (setting_key, setting_value) 
       VALUES ('header_settings', ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [headerData, headerData]
    );

    return NextResponse.json({
      success: true,
      message: 'Header sozlamalari muvaffaqiyatli saqlandi'
    });
  } catch (error: any) {
    console.error('Header DB save error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}