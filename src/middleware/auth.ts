import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 🌟 Bir xil maxfiy kalit
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ success: false, error: 'Serverda JWT_SECRET sozlanmagan' });
  }
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan (Token topilmadi)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Yaroqsiz yoki muddati o‘tgan token' });
  }
};

export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  requireAdmin(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Bu amal faqat bosh administrator uchun ruxsat etilgan' });
    }
    next();
  });
};
