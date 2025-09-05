import { pool } from '../../db/pool';

export async function listUsers() {
  const [rows] = await pool.query('SELECT id, email, role, is_active FROM users');
  return rows as any[];
}
