import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { getAdminFromRequest } from '@/server/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAdminFromRequest(req);
  if (!currentUser || currentUser.role !== 'superadmin') {
    return NextResponse.json(
      { success: false, message: 'Ruxsat berilmagan' },
      { status: 403 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: 'Foydalanuvchi ID ko‘rsatilmadi' },
      { status: 400 }
    );
  }

  // O'z hisobini o'chirishni taqiqlash
  if (currentUser.id === id) {
    return NextResponse.json(
      { success: false, message: 'O‘z akkauntingizni o‘chira olmaysiz' },
      { status: 400 }
    );
  }

  try {
    // 1. O'chirilayotgan foydalanuvchini tekshirish
    const [targetRows]: any = await db.query(
      'SELECT id, role FROM admin_users WHERE id = ? LIMIT 1',
      [id]
    );

    if (!targetRows || targetRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Foydalanuvchi topilmadi' },
        { status: 404 }
      );
    }

    const targetUser = targetRows[0];

    // 2. Agar o'chirilayotgan shaxs superadmin bo'lsa, bazada boshqa superadmin borligini tekshirish
    if (targetUser.role === 'superadmin') {
      const [countRows]: any = await db.query(
        'SELECT COUNT(*) as total FROM admin_users WHERE role = "superadmin"'
      );
      if ((countRows?.[0]?.total || 0) <= 1) {
        return NextResponse.json(
          { success: false, message: 'Tizimdagi yagona superadminni o‘chirib bo‘lmaydi' },
          { status: 400 }
        );
      }
    }

    // 3. O'chirish amali
    await db.query('DELETE FROM admin_users WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Foydalanuvchi muvaffaqiyatli o‘chirildi'
    });
  } catch (error: any) {
    console.error('DELETE /api/admin/users ERROR:', error?.message);
    return NextResponse.json(
      { success: false, message: 'Server xatosi yuz berdi' },
      { status: 500 }
    );
  }
}