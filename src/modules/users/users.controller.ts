import { Request, Response } from 'express';
import { query } from '../../config/db';
import { AuthRequest } from '../../common/middleware/auth';
import { z } from 'zod';

export async function meHandler(req: AuthRequest, res: Response) {
  const [rows] = await query('SELECT id, email, role, display_name FROM users WHERE id=:id', {
    id: req.user!.id
  });
  res.json(rows[0]);
}

export async function listUsersHandler(_req: Request, res: Response) {
  const [rows] = await query('SELECT id, email, role, is_active FROM users');
  res.json(rows);
}

export async function updateUserHandler(req: Request, res: Response) {
  const schema = z.object({ role: z.enum(['user', 'admin']), is_active: z.boolean() });
  const { role, is_active } = schema.parse(req.body);
  await query('UPDATE users SET role=:role, is_active=:is_active WHERE id=:id', {
    role,
    is_active,
    id: req.params.id
  });
  res.json({});
}
