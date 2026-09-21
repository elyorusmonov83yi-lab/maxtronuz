import { NextResponse } from 'next/server';
import { db } from '@/server/db';

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

// 1. GET: Barcha sozlamalarni olish (/api/admin/settings)
export async function GET() {
  try {
    const [rows]: any = await db.query('SELECT `key`, value FROM settings');
    if (!Array.isArray(rows)) {
      return NextResponse.json({ success: true, data: {} });
    }

    const allSettings: Record<string, any> = {};
    rows.forEach((r: any) => {
      allSettings[r.key] = safeJsonParse(r.value, {});
    });

    return NextResponse.json({ success: true, data: allSettings });
  } catch (error: any) {
    console.error('All settings fetch error:', error?.message);
    return NextResponse.json(
      { success: false, message: 'Barcha sozlamalarni yuklashda xatolik', error: error?.message },
      { status: 500 }
    );
  }
}