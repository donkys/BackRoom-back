import { Request, Response } from 'express';
import { query } from '../../config/db';
import { recordAudit } from '../../common/utils/audit';
import { z } from 'zod';

export async function listUsers(_req: Request, res: Response) {
  const [rows] = await query('SELECT id, email, role, is_active FROM users');
  res.json(rows);
}

export async function updateUser(req: Request, res: Response) {
  const schema = z.object({ role: z.enum(['user', 'admin']), is_active: z.boolean() });
  const { role, is_active } = schema.parse(req.body);
  await query('UPDATE users SET role=:role, is_active=:active WHERE id=:id', {
    role,
    active: is_active,
    id: req.params.id
  });
  await recordAudit('admin.user.update', null, 'user', Number(req.params.id), { role, is_active });
  res.json({});
}

export async function listTranslations(_req: Request, res: Response) {
  const [rows] = await query('SELECT id, namespace, t_key, locale_code, t_value FROM translations');
  res.json(rows);
}

export async function upsertTranslation(req: Request, res: Response) {
  const schema = z.object({
    namespace: z.string(),
    t_key: z.string(),
    locale_code: z.string(),
    t_value: z.string()
  });
  const { namespace, t_key, locale_code, t_value } = schema.parse(req.body);
  await query(
    `INSERT INTO translations (namespace, t_key, locale_code, t_value) VALUES (:ns,:key,:locale,:val)
     ON DUPLICATE KEY UPDATE t_value=:val, updated_at=NOW()`,
    { ns: namespace, key: t_key, locale: locale_code, val: t_value }
  );
  await recordAudit('admin.translation.upsert', null, 'translation', undefined, { namespace, t_key, locale_code, t_value });
  res.json({});
}

export async function listFlags(_req: Request, res: Response) {
  const [rows] = await query('SELECT flag_key, is_enabled FROM feature_flags');
  res.json(rows);
}

export async function setFlag(req: Request, res: Response) {
  const { key } = req.params;
  const schema = z.object({ is_enabled: z.boolean() });
  const { is_enabled } = schema.parse(req.body);
  await query(
    `INSERT INTO feature_flags (flag_key, is_enabled) VALUES (:key,:enabled)
     ON DUPLICATE KEY UPDATE is_enabled=:enabled, updated_at=NOW()`,
    { key, enabled: is_enabled }
  );
  await recordAudit('admin.flag.set', null, 'flag', undefined, { key, is_enabled });
  res.json({});
}

export async function listAuditLogs(_req: Request, res: Response) {
  const [rows] = await query('SELECT id, actor_id, action, target_type, target_id, created_at FROM audit_logs ORDER BY id DESC LIMIT 100');
  res.json(rows);
}
