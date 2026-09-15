import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// .env faylidagi maxfiy ma'lumotlarni o'qishni faollashtiramiz
dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,         // Faqat .env dan oladi
  password: process.env.DB_PASSWORD, // Faqat .env dan oladi
  database: process.env.DB_NAME,     // Faqat .env dan oladi
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Базага уланишни текшириш учун тест:
db.getConnection()
  .then((conn) => {
    console.log('✅ MariaDB базасига муваффақиятли уланди!');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ MariaDB уланишда хатолик:', err.message);
  });
