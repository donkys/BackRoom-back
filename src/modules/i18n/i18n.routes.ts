import { Router, Request, Response } from 'express';
import { getTranslations } from './i18n.service';

const router = Router();

router.get('/:locale/:namespace', async (req: Request, res: Response) => {
  const { locale, namespace } = req.params;
  const data = await getTranslations(locale, namespace);
  res.set('Cache-Control', 'private, max-age=60');
  res.json(data);
});

export default router;
