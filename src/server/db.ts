import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: false,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 100
});

db.getConnection()
  .then((conn) => {
    console.log('✅ Aiven MariaDB bazasiga muvaffaqiyatli ulandi!');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ MariaDB ulanishda xatolik:', err.message);
  });