import mysql from 'mysql2/promise';

const globalForDb = global as unknown as { dbPool?: mysql.Pool };

export const db =
  globalForDb.dbPool ||
  mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false,
    },
    waitForConnections: true,
    connectionLimit: 1, // Har bir Next.js worker faqat 1 ta ulanish ishlatadi
    queueLimit: 0,      // Ulanish bo'shashini navbatda kutadi, xatolik tashlamaydi
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.dbPool = db;
}