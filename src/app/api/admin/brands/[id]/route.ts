import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';

// 1. GET: Bitta brendni id yoki slug bo'yicha olish (Frontend sahifasi uchun)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;

    const [rows]: any = await db.query(
      'SELECT * FROM brands WHERE id = ? OR slug = ? LIMIT 1',
      [identifier, identifier]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Brend topilmadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. DELETE: Brendni id yoki slug bo'yicha o'chirish (Admin)
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
      'DELETE FROM brands WHERE id = ? OR slug = ?',
      [identifier, identifier]
    );

    return NextResponse.json({ success: true, message: 'Brend o‘chirildi' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}