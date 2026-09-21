import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { verifyAdminToken } from '@/server/auth';

// 1. GET: Bitta buyurtmani ko'rish (🔒 Faqat Admin)
export async function GET(
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
    const [rows]: any = await db.query(
      'SELECT * FROM quotes WHERE id = ? LIMIT 1',
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Buyurtma topilmadi' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    console.error('Quote single GET error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 2. PATCH: Buyurtma holatini (statusini) yangilash (🔒 Faqat Admin)
export async function PATCH(
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
    const body = await req.json();
    const status = body?.status;

    if (!status) {
      return NextResponse.json(
        { success: false, message: 'Status ko‘rsatilmadi' },
        { status: 400 }
      );
    }

    await db.query('UPDATE quotes SET status = ? WHERE id = ?', [status, id]);
    return NextResponse.json({
      success: true,
      message: 'Status muvaffaqiyatli yangilandi'
    });
  } catch (error: any) {
    console.error('Quote status update error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}

// 3. DELETE: Buyurtmani o'chirish (🔒 Faqat Admin)
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

    await db.query('DELETE FROM quotes WHERE id = ?', [id]);
    return NextResponse.json({
      success: true,
      message: 'Buyurtma muvaffaqiyatli o‘chirildi'
    });
  } catch (error: any) {
    console.error('Quote DB delete error:', error?.message);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server xatosi' },
      { status: 500 }
    );
  }
}