import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getUserById } from '../modules/users/users.service';

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'missing token' });
  const token = auth.substring(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as any;
    req.userId = payload.sub;
    const user = await getUserById(req.userId!);
    if (!user || !user.is_active) return res.status(401).json({ message: 'inactive user' });
    req.userRole = user.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'invalid token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') return res.status(403).json({ message: 'forbidden' });
  next();
}
