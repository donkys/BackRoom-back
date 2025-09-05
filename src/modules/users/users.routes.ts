import { Router, Response } from 'express';
import { getUserById } from './users.service';
import { AuthRequest, requireAuth } from '../../common/authMiddleware';

const router = Router();

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await getUserById(req.userId!);
  if (!user) return res.status(404).json({ message: 'not found' });
  res.json(user);
});

export default router;
