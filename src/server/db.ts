import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  user: 'pmauser',
  password: 'StrongPass123!',        // Агар phpMyAdmin/MariaDB паролингиз бўлса ёзинг, бўлмаса бўш қолдиринг
  database: 'maxtron_db', // phpMyAdmin'даги база номи
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