import { query } from '../../config/db';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, hashToken } from '../../common/utils/tokens';
import { env } from '../../config/env';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function register(email: string, password: string) {
  const hash = await bcrypt.hash(password, 10);
  const [res] = await query("INSERT INTO users (email, password_hash) VALUES (:email, :hash)", { email, hash });
  const id = (res as any).insertId;
  const token = signAccessToken(id, 'user');
  const refresh = signRefreshToken(id);
  await saveRefreshToken(id, refresh);
  return { id, email, accessToken: token, refreshToken: refresh };
}

export async function login(email: string, password: string) {
  const [rows] = await query('SELECT * FROM users WHERE email=:email', { email });
  const user = rows[0];
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('Invalid credentials');
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);
  await saveRefreshToken(user.id, refreshToken);
  return { user, accessToken, refreshToken };
}

export async function saveRefreshToken(userId: number, token: string) {
  const hash = hashToken(token);
  const expires = new Date(Date.now() + ms(env.JWT_REFRESH_TTL));
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (:uid,:hash,:exp)`,
    { uid: userId, hash, exp: expires }
  );
}

function ms(str: string) {
  // simple ms parser for d/h/m
  const match = /^(\d+)([smhd])$/.exec(str);
  if (!match) return 0;
  const num = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return num * 1000;
    case 'm':
      return num * 60 * 1000;
    case 'h':
      return num * 60 * 60 * 1000;
    case 'd':
      return num * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}

export async function rotateRefreshToken(oldToken: string, userId: number) {
  const oldHash = hashToken(oldToken);
  const [rows] = await query(
    'SELECT * FROM refresh_tokens WHERE user_id=:uid AND token_hash=:hash AND revoked_at IS NULL',
    { uid: userId, hash: oldHash }
  );
  const record = rows[0];
  if (!record) throw new Error('Token revoked');
  await query('UPDATE refresh_tokens SET revoked_at=NOW() WHERE id=:id', { id: record.id });
  const newToken = signRefreshToken(userId);
  await saveRefreshToken(userId, newToken);
  return newToken;
}

export async function revokeRefresh(token: string, userId: number) {
  const hash = hashToken(token);
  await query(
    'UPDATE refresh_tokens SET revoked_at=NOW() WHERE user_id=:uid AND token_hash=:hash',
    { uid: userId, hash }
  );
}

export async function forgotPassword(email: string) {
  const [rows] = await query('SELECT id FROM users WHERE email=:email', { email });
  if (!rows[0]) return;
  const userId = rows[0].id;
  const token = crypto.randomBytes(32).toString('hex');
  const hash = hashToken(token);
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await query(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (:uid,:hash,:exp)',
    { uid: userId, hash, exp: expires }
  );
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
  });
  const link = `${env.FRONTEND_ORIGIN}/reset-password?token=${token}`;
  await transport.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Reset Password',
    text: `Reset your password: ${link}`
  });
}

export async function resetPassword(token: string, newPassword: string) {
  const hash = hashToken(token);
  const [rows] = await query(
    'SELECT * FROM password_resets WHERE token_hash=:hash AND used_at IS NULL AND expires_at > NOW()',
    { hash }
  );
  const record = rows[0];
  if (!record) throw new Error('Invalid token');
  const pwdHash = await bcrypt.hash(newPassword, 10);
  await query('UPDATE users SET password_hash=:pwd WHERE id=:uid', { pwd: pwdHash, uid: record.user_id });
  await query('UPDATE password_resets SET used_at=NOW() WHERE id=:id', { id: record.id });
}
