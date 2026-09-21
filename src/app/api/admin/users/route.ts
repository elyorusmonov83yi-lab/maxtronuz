import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { promisify } from 'util';
import { db } from '@/server/db';
import { getAdminFromRequest } from '@/server/auth';

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

// 1. GET: Barcha adminlarni olish (Faqat superadmin)
export async function GET(req: NextRequest) {
  const currentUser = await getAdminFromRequest(req);
  if (!currentUser || currentUser.role !== 'superadmin') {
    return NextResponse.json(
      { success: false, message: 'Ruxsat berilmagan' },
      { status: 403 }
    );
  }

  try {
    const [rows]: any = await db.query(
      'SELECT id, name, username, role, createdAt FROM admin_users ORDER BY id DESC'
    );

    const users = Array.isArray(rows)
      ? rows.map((u: any) => ({
          id: u.id,
          name: u.name || u.username,
          fullName: u.name || u.username,
          username: u.username,
          role: u.role || 'admin',
          createdAt: u.createdAt || null
        }))
      : [];

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error('GET /api/admin/users ERROR:', error?.message);
    return NextResponse.json(
      { success: false, message: 'Server xatosi', data: [] },
      { status: 500 }
    );
  }
}

// 2. POST: Yangi admin qo'shish yoki yangilash (Faqat superadmin)
export async function POST(req: NextRequest) {
  const currentUser = await getAdminFromRequest(req);
  if (!currentUser || currentUser.role !== 'superadmin') {
    return NextResponse.json(
      { success: false, message: 'Ruxsat berilmagan' },
      { status: 403 }
    );
  }

  try {
    const user = await req.json();
    const userId = String(user.id || `usr_${Date.now()}`);
    const name = String(user.name || user.fullName || user.username || '').trim();
    const username = String(user.username || '').trim().toLowerCase();
    const password = String(user.password || '').trim();
    const role = user.role === 'manager' ? 'manager' : 'admin';

    if (!username || password.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Login va kamida 10 belgili parol kiriting' },
        { status: 400 }
      );
    }

    await db.query(
      `INSERT INTO admin_users (id, name, username, password, role)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name), 
        username = VALUES(username), 
        password = VALUES(password), 
        role = VALUES(role)`,
      [userId, name, username, await hashPassword(password), role]
    );

    return NextResponse.json({
      success: true,
      id: userId,
      message: 'Foydalanuvchi saqlandi'
    });
  } catch (error: any) {
    console.error('POST /api/admin/users ERROR:', error?.message);
    return NextResponse.json({ success: false, message: 'Server xatosi' }, { status: 500 });
  }
}