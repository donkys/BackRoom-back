import { Router, Response } from 'express';
import { listUsers } from './admin.service';
import { AuthRequest, requireAuth, requireAdmin } from '../../common/authMiddleware';

const router = Router();

router.get('/users', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const users = await listUsers();
  res.json(users);
});

export default router;
