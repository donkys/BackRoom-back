import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { env } from '../../config/env';
import crypto from 'crypto';

export function signAccessToken(userId: number, role: string) {
  const options: SignOptions = {
    subject: String(userId),
    expiresIn: env.JWT_ACCESS_TTL as any
  };
  return jwt.sign({ role }, env.JWT_ACCESS_SECRET as Secret, options);
}

export function signRefreshToken(userId: number) {
  const options: SignOptions = {
    subject: String(userId),
    expiresIn: env.JWT_REFRESH_TTL as any
  };
  return jwt.sign({}, env.JWT_REFRESH_SECRET as Secret, options);
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
