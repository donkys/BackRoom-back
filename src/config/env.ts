import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BACKEND_PORT: z.string().transform(Number).default('8080'),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number).default('3306'),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  FRONTEND_ORIGIN: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  S3_REGION: z.string(),
  S3_BUCKET: z.string(),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
  S3_USE_PATH_STYLE: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  PRESIGN_EXPIRES_SECONDS: z.string().transform(Number).default('300'),
  EMAIL_FROM: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true')
});

export const env = envSchema.parse(process.env);
