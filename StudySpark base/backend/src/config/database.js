/*
  Owner: Ryan
  Feature: GitHub & System Design
  Status: MySQL database foundation.
  Description: Shared MySQL connection pool for StudySpark backend features.
*/

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const requiredDatabaseEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];

function getMissingDatabaseEnv() {
  return requiredDatabaseEnv.filter((key) => !process.env[key]);
}

function hasDatabaseConfig() {
  return getMissingDatabaseEnv().length === 0;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export { getMissingDatabaseEnv, hasDatabaseConfig, pool, query };
