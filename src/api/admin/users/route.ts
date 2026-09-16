import { Router } from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { db } from '../../../server/db.ts';
import { requireAdmin, requireSuperAdmin } from '../../../middleware/auth.ts';
import type { AuthenticatedRequest } from '../../../middleware/auth.ts';

const router = Router();
const scrypt = promisify(crypto.scrypt);

function getJwtSecret(): string | null {
  return process.env.JWT_SECRET || null;
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

async function verifyPassword(password: string, storedPassword: string): Promise<boolean> {
  const [algorithm, salt, hash] = storedPassword.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) {
    return Buffer.byteLength(password) === Buffer.byteLength(storedPassword)
      && crypto.timingSafeEqual(Buffer.from(password), Buffer.from(storedPassword));
  }

  const derived = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(hash, 'hex');
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}

router.post('/login', async (req: Request, res: Response) => {
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) return res.status(500).json({ success: false, message: 'Serverda JWT_SECRET sozlanmagan' });

  try {
    const username = String(req.body?.username || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!username || !password) return res.status(400).json({ success: false, message: 'Login va parol kiritilishi shart' });

    const [rows]: any = await db.query(
      'SELECT id, name, username, password, role FROM admin_users WHERE LOWER(username) = ? LIMIT 1',
      [username]
    );
    const user = rows?.[0];
    if (!user || !await verifyPassword(password, String(user.password || ''))) {
      return res.status(401).json({ success: false, message: 'Login yoki parol noto‘g‘ri' });
    }
    if (!String(user.password).startsWith('scrypt$')) {
      await db.query('UPDATE admin_users SET password = ? WHERE id = ?', [await hashPassword(password), user.id]);
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, jwtSecret, { expiresIn: '7d' });
    return res.json({ success: true, token, user: { id: user.id, name: user.name || user.username, username: user.username, role: user.role } });
  } catch (error: any) {
    console.error('POST /api/admin/users/login ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

router.get('/me', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

router.get('/', requireSuperAdmin, async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query('SELECT id, name, username, role, createdAt, created_at FROM admin_users');
    const users = Array.isArray(rows) ? rows.map((user: any) => ({
      id: user.id, name: user.name || user.username, fullName: user.name || user.username,
      username: user.username, role: user.role || 'admin', createdAt: user.createdAt || null
    })) : [];
    return res.json({ success: true, data: users });
  } catch (error: any) {
    console.error('GET /api/admin/users ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi', data: [] });
  }
});

router.post('/', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const user = req.body || {};
    const userId = String(user.id || `usr_${Date.now()}`);
    const name = String(user.name || user.fullName || user.username || '').trim();
    const username = String(user.username || '').trim().toLowerCase();
    const password = String(user.password || '').trim();
    const role = user.role === 'manager' ? 'manager' : 'admin';
    if (!username || password.length < 10) {
      return res.status(400).json({ success: false, message: 'Login va kamida 10 belgili parol kiriting' });
    }
    await db.query(
      `INSERT INTO admin_users (id, name, username, password, role)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), username = VALUES(username), password = VALUES(password), role = VALUES(role)`,
      [userId, name, username, await hashPassword(password), role]
    );
    return res.json({ success: true, id: userId, message: 'Foydalanuvchi saqlandi' });
  } catch (error: any) {
    console.error('POST /api/admin/users ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

router.delete('/:id', requireSuperAdmin, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.id === req.params.id) return res.status(400).json({ success: false, message: 'O‘z akkauntingizni o‘chira olmaysiz' });
  try {
    await db.query('DELETE FROM admin_users WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'Foydalanuvchi o‘chirildi' });
  } catch (error: any) {
    console.error('DELETE /api/admin/users ERROR:', error);
    return res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

export default router;
