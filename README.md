# BacKRoom-back (Backend Repository)

Production-ready backend (Node.js + Express + TypeScript) for BacKRoom.
Implements auth (JWT access + refresh cookie), forgot/reset password, profile,
S3 presigned upload/download, i18n-from-DB, admin pages, audit logs — as per requirements.

## Quick Start (Dev, Docker)
```bash
cp .env.example .env
docker compose up -d
# API: http://localhost:8080/api
# Adminer: http://localhost:8081  (Server: mysql, User: app, Pass: app_pw, DB: appdb)
# Mailpit: http://localhost:8025
# MinIO Console: http://localhost:9001  (minioadmin/minioadmin)
```
The compose spins up: MySQL, Flyway (runs migrations), MinIO (+bucket), Mailpit, Adminer, and the backend.

## Connect Frontend with ONE path
Set your frontend environment:
- `API_BASE_URL=http://localhost:8080` (or your backend URL)
Frontend should call relative `/api/*`. Your frontend's Nginx (or Vite proxy) will forward `/api` → `${API_BASE_URL}`.

## CORS & Cookies
Set `FRONTEND_ORIGIN=http://localhost:3000` in `.env` so CORS and cookies (refresh) work between sites.

## Security Defaults
- HTTPS (prod behind proxy), Helmet, rate limit, Zod/Joi validation
- BCrypt for password, token rotation + reuse detection
- S3 presigned URLs (short TTL), IDOR protection on file access
- Audit logs for key actions

## Flyway
SQL migrations live in `backend/flyway/sql`. Compose runs them before the app starts.
