import { pool } from '../../db/pool';
import bcrypt from 'bcrypt';

export async function findUserByEmail(email: string) {
  const [rows] = await pool.query('SELECT id, email, password_hash FROM users WHERE email = ?', [email]);
  const users = rows as any[];
  return users[0];
}

export async function createUser(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);
  const insert = result as any;
  return { id: insert.insertId, email };
}
