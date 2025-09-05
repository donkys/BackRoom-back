# PROJECT_SPEC — BacKRoom-back

## Tech Stack
- Node.js 20 + TypeScript + Express
- MySQL 8 (mysql2/promise)
- S3 (AWS SDK v3) — MinIO in dev
- Email: SES (prod) / Mailpit (dev)
- Validation: Zod/Joi, Password: bcrypt
- Docs: Swagger/OpenAPI (dev)
- Logs: pino/winston

## Architecture (Layers)
- `routes` → `controllers` → `services` → `repos` → `db`
- `common` middlewares: auth, rate-limit, validate, error handler
- `modules`: `auth`, `users`, `files`, `i18n`, `admin`
- `config`: env loader (safe defaults), CORS, S3 client, mailer

## Env Vars (`.env.example` is included)
- `BACKEND_PORT=8080`
- `DB_HOST=mysql DB_PORT=3306 DB_USER=app DB_PASS=app_pw DB_NAME=appdb`
- `FRONTEND_ORIGIN=http://localhost:3000`
- `JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_TTL=10m, JWT_REFRESH_TTL=30d`
- `S3_REGION=ap-southeast-1 S3_BUCKET=app-bucket S3_ENDPOINT=http://minio:9000`
- `S3_ACCESS_KEY=minioadmin S3_SECRET_KEY=minioadmin S3_USE_PATH_STYLE=true`
- `EMAIL_FROM=no-reply@example.com SMTP_HOST=mailpit SMTP_PORT=1025 SMTP_SECURE=false`

## Endpoints (Summary)
- `POST /api/auth/register|login|logout|token/refresh|forgot-password|reset-password`
- `GET /api/me`, `PATCH /api/me`, `POST /api/me/change-password`
- `POST /api/files/presign-upload`, `POST /api/files/confirm`
- `GET /api/files`, `GET /api/files/:id/presign-download`, `DELETE /api/files/:id`
- `GET /api/i18n/:locale/:namespace`
- Admin: `/api/admin/users*`, `/api/admin/i18n*`, `/api/admin/flags*`
- Health: `/api/health`, `/api/ready`

## Dockerfile (Backend)
See `backend/Dockerfile` in this repo.

## Compose (Dev)
See `docker-compose.yml` in this repo. It ensures:
- MySQL healthy → Flyway migrates → Backend starts
- MinIO bucket ready → used by backend
- Mailpit for testing emails
- Adminer for DB inspection

## Flyway SQL
- `V1__init.sql`: schema (users, refresh_tokens, password_resets, files, locales, translations, audit_logs, feature_flags)
- `V2__indexes.sql`: extra indexes/constraints
- `V3__seed_i18n.sql`: seed locales + a few translations

## Security Notes
- Enforce owner checks on every file access
- Hide authentication enumeration (same response for unknown email)
- Rate-limit login/forgot endpoints
- Store refresh token hashes; rotate & revoke properly

