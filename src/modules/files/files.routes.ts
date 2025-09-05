import { Router } from 'express';
import { requestUploadHandler, requestDownloadHandler } from './files.controller';
import { requireAuth } from '../../common/middleware/auth';

const router = Router();

router.post('/upload', requireAuth, requestUploadHandler);
router.get('/:id/download', requireAuth, requestDownloadHandler);

export default router;
