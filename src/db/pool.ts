import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'app',
  password: process.env.DB_PASSWORD || 'app_pw',
  database: process.env.DB_NAME || 'appdb',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true
});
