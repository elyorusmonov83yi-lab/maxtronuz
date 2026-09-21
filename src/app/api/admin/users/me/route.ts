import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/server/auth';

export async function GET(req: NextRequest) {
  const user = await getAdminFromRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Ruxsat berilmagan' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
}