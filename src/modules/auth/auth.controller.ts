import { Request, Response } from 'express';
import { register, login, rotateRefreshToken, revokeRefresh, forgotPassword, resetPassword } from './auth.service';
import { signAccessToken } from '../../common/utils/tokens';
import { env } from '../../config/env';
import { AuthRequest } from '../../common/middleware/auth';
import { recordAudit } from '../../common/utils/audit';
import { z } from 'zod';

export async function registerHandler(req: Request, res: Response) {
  const { email, password } = req.body;
  const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
  const parsed = schema.parse({ email, password });
  const result = await register(parsed.email, parsed.password);
  setRefreshTokenCookie(res, result.refreshToken);
  await recordAudit('user.register', result.id, 'user', result.id);
  return res.json({ accessToken: result.accessToken, user: { id: result.id, email: result.email } });
}

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;
  const schema = z.object({ email: z.string().email(), password: z.string() });
  const parsed = schema.parse({ email, password });
  const { user, accessToken, refreshToken } = await login(parsed.email, parsed.password);
  setRefreshTokenCookie(res, refreshToken);
  await recordAudit('user.login', user.id, 'user', user.id);
  return res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
}

export async function refreshHandler(req: Request, res: Response) {
  const token = req.cookies['refresh_token'];
  if (!token) return res.status(401).json({ message: 'Missing refresh token' });
  try {
    const payload = require('jsonwebtoken').verify(token, env.JWT_REFRESH_SECRET) as any;
    const newToken = await rotateRefreshToken(token, Number(payload.sub));
    const accessToken = signAccessToken(Number(payload.sub), payload.role || 'user');
    setRefreshTokenCookie(res, newToken);
    return res.json({ accessToken });
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export async function logoutHandler(req: AuthRequest, res: Response) {
  const token = req.cookies['refresh_token'];
  if (token && req.user) {
    await revokeRefresh(token, req.user.id);
    await recordAudit('user.logout', req.user.id, 'user', req.user.id);
  }
  res.clearCookie('refresh_token');
  return res.json({});
}

export async function forgotHandler(req: Request, res: Response) {
  const schema = z.object({ email: z.string().email() });
  const { email } = schema.parse(req.body);
  await forgotPassword(email);
  res.json({});
}

export async function resetHandler(req: Request, res: Response) {
  const schema = z.object({ token: z.string(), password: z.string().min(6) });
  const { token, password } = schema.parse(req.body);
  await resetPassword(token, password);
  res.json({});
}

function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 30,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });
}
