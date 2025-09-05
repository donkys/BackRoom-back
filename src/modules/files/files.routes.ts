import { Router, Response } from 'express';
import { listFiles } from './files.service';
import { AuthRequest, requireAuth } from '../../common/authMiddleware';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const files = await listFiles(req.userId!);
  res.json(files);
});

export default router;
