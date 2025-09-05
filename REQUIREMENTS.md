# Backend Requirements — BacKRoom-back

Covers: Auth, Users, Files (S3), i18n (DB), Admin, Audit, Health/Ready.
Meets the system-wide REQUIREMENTS (security, observability, Flyway) and adds Docker deploy.

## Functional
- Auth: register/login/logout/refresh; forgot/reset; change-password.
- Users: get/update profile; locale preference; avatar (S3).
- Files: presign-upload/confirm/list/presign-download/delete (owner/admin only).
- i18n: fetch translations from DB with in-memory cache & ETag; admin can manage.
- Admin: users (disable/role), translations, flags, audit logs.
- Meta: `/api/health`, `/api/ready`.

## Non-Functional
- Security: Helmet, CORS allowlist via `FRONTEND_ORIGIN`, JWT short-lived access, httpOnly refresh cookie,
  validation (Zod/Joi), rate-limit, abuse control, IDOR prevention, audit logs.
- Reliability/Perf: stateless, MySQL pool, proper indexes.
- Observability: structured logs, request_id, health probes.

## Deploy (Docker)
- `Dockerfile` multi-stage (node:20-alpine) → minimal runtime
- `docker-compose.yml` (dev): mysql, flyway, minio (+create bucket), mailpit, adminer, backend
- prod compose provided in docs (see PROJECT_SPEC.md), or deploy under your orchestrator

