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

  if (currentUser.id === id) {
    return NextResponse.json(
      { success: false, message: 'O‘z akkauntingizni o‘chira olmaysiz' },
      { status: 400 }
    );
  }

  try {
    await db.query('DELETE FROM admin_users WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Foydalanuvchi o‘chirildi' });
  } catch (error: any) {
    console.error('DELETE /api/admin/users ERROR:', error?.message);
    return NextResponse.json({ success: false, message: 'Server xatosi' }, { status: 500 });
  }
}