import { pool } from '../../db/pool';

export async function getTranslations(locale: string, namespace: string) {
  const [rows] = await pool.query(
    'SELECT t_key, t_value FROM translations WHERE locale_code = ? AND namespace = ?',
    [locale, namespace]
  );
  const result: Record<string, string> = {};
  (rows as any[]).forEach(r => { result[r.t_key] = r.t_value; });
  return result;
}
