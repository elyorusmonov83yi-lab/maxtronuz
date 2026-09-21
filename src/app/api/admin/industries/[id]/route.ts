import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';

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

// 1. GET: Bitta sohani id yoki slug bo'yicha olish
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;

    const [rows]: any = await db.query(
      'SELECT * FROM industries WHERE id = ? OR slug = ? LIMIT 1',
      [identifier, identifier]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Soha topilmadi' },
        { status: 404 }
      );
    }

    const r = rows[0];
    const industry = {
      id: r.id,
      slug: r.slug || r.id,
      name: parseIfJson(r.name, { uz: '', ru: '' }),
      desc: parseIfJson(r.description, { uz: '', ru: '' }),
      icon: r.icon || 'Building2',
      tasks: parseIfJson(r.tasks, [])
    };

    return NextResponse.json({ success: true, data: industry });
  } catch (error: any) {
    console.error('Industry GET error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. DELETE: Sohani o'chirish (🔒 Faqat Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: identifier } = await params;
    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'Identifikator ko‘rsatilmadi' },
        { status: 400 }
      );
    }

    await db.query(
      'DELETE FROM industries WHERE id = ? OR slug = ?',
      [identifier, identifier]
    );

    return NextResponse.json({ success: true, message: 'Soha muvaffaqiyatli o‘chirildi' });
  } catch (error: any) {
    console.error('Industries DB delete error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}