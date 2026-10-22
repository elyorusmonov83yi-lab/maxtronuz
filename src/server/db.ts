import mysql from 'mysql2/promise';

const globalForDb = globalThis as unknown as { dbPool?: mysql.Pool };

export const db =
  globalForDb.dbPool ??
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
    // Serverless (Vercel) lambda konteyneri uchun 2 ta yetarli (Aiven limitini to'ldirmaydi)
    connectionLimit: 2,
    maxIdle: 2,
    // 15 soniya ishlatilmagan ulanishlarni Aiven'dan avtomatik uzish
    idleTimeout: 15000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });

// Serverless (Vercel) konteynerida qayta-qayta yangi pool ochilmasligi uchun:
globalForDb.dbPool = db;