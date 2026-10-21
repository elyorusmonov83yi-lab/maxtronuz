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
    connectionLimit: 10, // Parallel so'rovlar (generateMetadata + Page) navbatda qotib qolmasligi uchun
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

// Serverless (Vercel) konteynerida qayta-qayta yangi pool ochilmasligi uchun:
globalForDb.dbPool = db;