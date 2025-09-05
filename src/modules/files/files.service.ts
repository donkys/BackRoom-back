import { pool } from '../../db/pool';

export async function listFiles(ownerId: number) {
  const [rows] = await pool.query('SELECT id, s3_key, mime_type, size_bytes FROM files WHERE owner_id = ? AND is_deleted = 0', [ownerId]);
  return rows as any[];
}
