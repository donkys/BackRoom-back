import { Router } from 'express';
import {
  listUsers,
  updateUser,
  listTranslations,
  upsertTranslation,
  listFlags,
  setFlag,
  listAuditLogs
} from './admin.controller';
import { requireAuth, requireAdmin } from '../../common/middleware/auth';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/users', listUsers);
router.put('/users/:id', updateUser);
router.get('/translations', listTranslations);
router.put('/translations', upsertTranslation);
router.get('/flags', listFlags);
router.put('/flags/:key', setFlag);
router.get('/audit-logs', listAuditLogs);

export default router;
