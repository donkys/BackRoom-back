import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { notFound, errorHandler } from './common/middleware';
import metaRoutes from './modules/meta/meta.routes';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import fileRoutes from './modules/files/files.routes';
import i18nRoutes from './modules/i18n/i18n.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();
app.use(helmet());
app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api', metaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/i18n', i18nRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
