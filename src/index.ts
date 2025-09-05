import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { logger } from './config/logger';
import pinoHttp from 'pino-http';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import fileRoutes from './modules/files/files.routes';
import i18nRoutes from './modules/i18n/i18n.routes';
import adminRoutes from './modules/admin/admin.routes';
import { apiLimiter } from './common/middleware/rateLimiter';
import { errorHandler } from './common/middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(apiLimiter);
app.use(pinoHttp({ logger }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/ready', (_req, res) => res.json({ status: 'ready' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/i18n', i18nRoutes);
app.use('/api/admin', adminRoutes);

if (env.NODE_ENV !== 'production') {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(errorHandler);

app.listen(env.BACKEND_PORT, () => {
  logger.info(`Server running on port ${env.BACKEND_PORT}`);
});
