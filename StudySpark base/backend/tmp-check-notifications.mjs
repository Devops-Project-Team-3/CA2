import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const [rows] = await conn.query('SELECT * FROM notifications ORDER BY id DESC LIMIT 5');
console.log(JSON.stringify(rows, null, 2));

await conn.end();
