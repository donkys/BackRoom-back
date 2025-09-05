import { Router } from 'express';
import { getTranslations } from './i18n.controller';

const router = Router();

router.get('/:locale/:namespace', getTranslations);

export default router;
