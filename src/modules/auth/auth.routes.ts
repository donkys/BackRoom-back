import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from './auth.service';
import { env } from '../../config/env';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  const existing = await findUserByEmail(email);
  if (existing) return res.status(409).json({ message: 'email exists' });
  const user = await createUser(email, password);
  res.status(201).json({ id: user.id, email: user.email });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user) return res.status(401).json({ message: 'invalid credentials' });
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ message: 'invalid credentials' });
  const token = jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: '15m' });
  res.json({ accessToken: token });
});

export default router;
