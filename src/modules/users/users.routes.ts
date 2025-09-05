import { Router } from 'express';
import { meHandler, listUsersHandler, updateUserHandler } from './users.controller';
import { requireAuth, requireAdmin } from '../../common/middleware/auth';

const router = Router();

router.get('/me', requireAuth, meHandler);
router.get('/', requireAuth, requireAdmin, listUsersHandler);
router.put('/:id', requireAuth, requireAdmin, updateUserHandler);

export default router;
