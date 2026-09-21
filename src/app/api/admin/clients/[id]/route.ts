import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';

// 1. GET: Bitta hamkorni olish
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows]: any = await db.query(
      'SELECT * FROM clients WHERE id = ? LIMIT 1',
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Hamkor topilmadi' },
        { status: 404 }
      );
    }

    const c = rows[0];
    const client = {
      id: c.id,
      name: c.name || '',
      shortName: c.shortName || '',
      category: c.category || '',
      logo: c.logo || '',
      website: c.website || '',
      orderIndex: Number(c.orderIndex) || 0
    };

    return NextResponse.json({ success: true, data: client });
  } catch (error: any) {
    console.error('Client GET error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. DELETE: Hamkorni o'chirish (🔒 Faqat Admin)
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID ko‘rsatilmadi' },
        { status: 400 }
      );
    }

    await db.query('DELETE FROM clients WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Hamkor o‘chirildi' });
  } catch (error: any) {
    console.error('Client DB delete error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Hamkorni o‘chirishda xatolik' },
      { status: 500 }
    );
  }
}