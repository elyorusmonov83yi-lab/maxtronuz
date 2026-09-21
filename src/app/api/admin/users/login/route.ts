import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { db } from '@/server/db';

const scrypt = promisify(crypto.scrypt);

function getJwtSecret(): string | null {
  return process.env.JWT_SECRET || null;
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

async function verifyPassword(password: string, storedPassword: string): Promise<boolean> {
  const [algorithm, salt, hash] = storedPassword.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) {
    return (
      Buffer.byteLength(password) === Buffer.byteLength(storedPassword) &&
      crypto.timingSafeEqual(Buffer.from(password), Buffer.from(storedPassword))
    );
  }

  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, 'hex');
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}

export async function POST(req: NextRequest) {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    return NextResponse.json(
      { success: false, message: 'Serverda JWT_SECRET sozlanmagan' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const username = String(body?.username || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Login va parol kiritilishi shart' },
        { status: 400 }
      );
    }

    const [rows]: any = await db.query(
      'SELECT id, name, username, password, role FROM admin_users WHERE LOWER(username) = ? LIMIT 1',
      [username]
    );

    const user = rows?.[0];
    if (!user || !(await verifyPassword(password, String(user.password || '')))) {
      return NextResponse.json(
        { success: false, message: 'Login yoki parol noto‘g‘ri' },
        { status: 401 }
      );
    }

    if (!String(user.password).startsWith('scrypt$')) {
      await db.query('UPDATE admin_users SET password = ? WHERE id = ?', [
        await hashPassword(password),
        user.id
      ]);
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name || user.username,
        username: user.username,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('POST /api/admin/users/login ERROR:', error?.message);
    return NextResponse.json({ success: false, message: 'Server xatosi' }, { status: 500 });
  }
}