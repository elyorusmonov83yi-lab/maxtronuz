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

// 1. GET: Bitta sahifani ID yoki Slug bo'yicha olish
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;

    const [rows]: any = await db.query(
      'SELECT * FROM pages WHERE id = ? OR slug = ? LIMIT 1',
      [identifier, identifier]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Sahifa topilmadi' },
        { status: 404 }
      );
    }

    const p = rows[0];
    const page = {
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
    };

    return NextResponse.json({ success: true, data: page });
  } catch (error: any) {
    console.error('Page DB load single error:', error?.message);
    return NextResponse.json(
      { success: false, message: 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. DELETE: Sahifani o'chirish (🔒 Faqat Admin)
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
        { success: false, message: 'ID ko‘rsatilmadi' },
        { status: 400 }
      );
    }

    await db.query('DELETE FROM pages WHERE id = ? OR slug = ?', [identifier, identifier]);
    return NextResponse.json({ success: true, message: 'Sahifa muvaffaqiyatli o‘chirildi' });
  } catch (error: any) {
    console.error('Page DB delete error:', error?.message);
    return NextResponse.json(
      { success: false, message: error?.message || 'Sahifani o‘chirishda xatolik' },
      { status: 500 }
    );
  }
}