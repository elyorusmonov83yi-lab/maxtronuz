import { Router, Request, Response } from 'express';
import { db } from '../../../server/db';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'maxtron_super_secret_key_2026';

// 1. GET: Barcha adminlarni olish
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM admin_users');

    if (!Array.isArray(rows)) {
      return res.json({ success: true, data: [] });
    }

    const users = rows.map((u: any) => ({
      id: u.id || `usr_${Date.now()}`,
      name: u.name || u.fullName || u.username || 'Администратор',
      fullName: u.name || u.fullName || u.username || 'Администратор',
      username: u.username || '',
      password: u.password || u.password_hash || '',
      role: u.role || 'admin',
      createdAt: u.createdAt || u.created_at || new Date().toISOString()
    }));

    res.json({ success: true, data: users });
  } catch (error: any) {
    console.error('❌ GET /api/admin/users ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: error?.message || 'Server error',
      data: [] 
    });
  }
});

// 2. POST: Adminni saqlash yoki tahrirlash
router.post('/', async (req: Request, res: Response) => {
  try {
    const user = req.body;
    const userId = user.id || `usr_${Date.now()}`;
    const name = (user.name || user.fullName || user.username || '').trim();
    const username = (user.username || '').trim().toLowerCase();
    const password = (user.password || user.password_hash || '').trim();
    const role = user.role === 'manager' ? 'manager' : 'admin';

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Логин ва пароль киритилиши шарт' });
    }

    await db.query(
      `INSERT INTO admin_users (id, name, username, password, role)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        username = VALUES(username),
        password = VALUES(password),
        role = VALUES(role)`,
      [userId, name, username, password, role]
    );

    res.json({ success: true, id: userId, message: 'Фойдаланувчи сақланди' });
  } catch (error: any) {
    console.error('❌ POST /api/admin/users ERROR:', error);
    res.status(500).json({ success: false, message: error?.message || 'Server error' });
  }
});

// 3. DELETE: Adminni o'chirish
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM admin_users WHERE id = ?', [id]);
    res.json({ success: true, message: 'Фойдаланувчи ўчирилди' });
  } catch (error: any) {
    console.error('❌ DELETE /api/admin/users ERROR:', error);
    res.status(500).json({ success: false, message: error?.message || 'Server error' });
  }
});

// 4. POST: Login tekshirish va JWT Token qaytarish
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const [rows]: any = await db.query(
      'SELECT id, name, username, role FROM admin_users WHERE LOWER(username) = ? AND password = ?',
      [cleanUsername, cleanPassword]
    );

    if (rows && rows.length > 0) {
      const user = rows[0];
      
      // 🌟 JWT Token generatsiya qilish
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        token: token, // 🌟 Endi token to'g'ridan-to'g'ri qaytmoqda
        user: {
          id: user.id,
          name: user.name || user.username,
          username: user.username,
          role: user.role
        }
      });
    }

    res.status(401).json({ success: false, message: 'Логин ёки пароль нотўғри' });
  } catch (error: any) {
    console.error('❌ POST /api/admin/users/login ERROR:', error);
    res.status(500).json({ success: false, message: error?.message || 'Server error' });
  }
});

export default router;