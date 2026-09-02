import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 🌟 Bir xil maxfiy kalit
const JWT_SECRET = process.env.JWT_SECRET || 'maxtron_super_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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