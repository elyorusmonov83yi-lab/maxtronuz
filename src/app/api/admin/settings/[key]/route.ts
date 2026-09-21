import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';

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

// 1. GET: Kalit bo'yicha sozlamani olish (/api/admin/settings/[key])
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const [rows]: any = await db.query('SELECT value FROM settings WHERE `key` = ? LIMIT 1', [key]);

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: safeJsonParse(rows[0].value, {}) });
  } catch (error: any) {
    console.error('Settings key fetch error:', error?.message);
    return NextResponse.json(
      { success: false, message: 'Sozlamani yuklashda xatolik', error: error?.message },
      { status: 500 }
    );
  }
}

// 2. POST: Kalit bo'yicha sozlamani saqlash (/api/admin/settings/[key]) - 🔒 Faqat Admin
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    const isAdmin = await verifyAdminToken(authHeader);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Ruxsat berilmagan' },
        { status: 401 }
      );
    }

    const { key } = await params;
    const rawBody = await req.json();

    if (rawBody === undefined || rawBody === null) {
      return NextResponse.json(
        { success: false, message: "Sozlama ma'lumotlari bo'sh" },
        { status: 400 }
      );
    }

    // JSON formatga xavfsiz aylantirish
    const value = typeof rawBody === 'object' ? JSON.stringify(rawBody) : String(rawBody);

    await db.query(
      `INSERT INTO settings (\`key\`, value, updatedAt)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE 
        value = VALUES(value),
        updatedAt = CURRENT_TIMESTAMP`,
      [key, value]
    );

    return NextResponse.json({
      success: true,
      message: `«${key}» sozlamasi muvaffaqiyatli saqlandi`
    });
  } catch (error: any) {
    console.error('Settings save error:', error?.message);
    return NextResponse.json(
      { success: false, message: 'Sozlamani saqlashda xatolik', error: error?.message },
      { status: 500 }
    );
  }
}