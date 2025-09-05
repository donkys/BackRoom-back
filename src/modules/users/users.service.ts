import { pool } from '../../db/pool';

export async function getUserById(id: number) {
  const [rows] = await pool.query('SELECT id, email, role, is_active FROM users WHERE id = ?', [id]);
  const users = rows as any[];
  return users[0];
}
