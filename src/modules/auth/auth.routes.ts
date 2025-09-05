import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  forgotHandler,
  resetHandler
} from './auth.controller';
import { requireAuth } from '../../common/middleware/auth';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', requireAuth, logoutHandler);
router.post('/forgot-password', forgotHandler);
router.post('/reset-password', resetHandler);

export default router;
