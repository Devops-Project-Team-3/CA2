/*
  Owner: Ryan
  Feature: GitHub & System Design
  Status: MySQL database foundation.
  Description: Runs the StudySpark MySQL schema for local setup.
*/

import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

dotenv.config();

const requiredDatabaseEnv = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];

function getMissingDatabaseEnv() {
  return requiredDatabaseEnv.filter((key) => !process.env[key]);
}


async function columnExists(connection, tableName, columnName) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );

  return Number(rows[0]?.count || 0) > 0;
}

async function addColumnIfMissing(connection, tableName, columnName, alterSql) {
  if (await columnExists(connection, tableName, columnName)) {
    return;
  }

  await connection.query(alterSql);
}

async function runSchemaMigrations(connection) {
  await addColumnIfMissing(
    connection,
    'users',
    'avatar_id',
    "ALTER TABLE users ADD COLUMN avatar_id VARCHAR(50) DEFAULT 'blob' AFTER created_at"
  );
  await addColumnIfMissing(
    connection,
    'users',
    'email_verified',
    'ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT TRUE AFTER avatar_id'
  );
  await addColumnIfMissing(
    connection,
    'users',
    'verification_token',
    'ALTER TABLE users ADD COLUMN verification_token VARCHAR(128) NULL AFTER email_verified'
  );
  await addColumnIfMissing(
    connection,
    'users',
    'verification_expires_at',
    'ALTER TABLE users ADD COLUMN verification_expires_at DATETIME NULL AFTER verification_token'
  );
  await addColumnIfMissing(
    connection,
    'quiz_results',
    'study_session_id',
    'ALTER TABLE quiz_results ADD COLUMN study_session_id INT NULL AFTER user_id'
  );
}
async function setupDatabase() {
  const missingEnv = getMissingDatabaseEnv();

  if (missingEnv.length > 0) {
    console.error(`Missing database environment variables: ${missingEnv.join(', ')}`);
    process.exit(1);
  }

  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const schemaPath = path.join(currentDir, 'schema.sql');
  const rawSchemaSql = await fs.readFile(schemaPath, 'utf8');
  const schemaSql = rawSchemaSql
    .replace(/^CREATE DATABASE IF NOT EXISTS .*?;\s*/im, '')
    .replace(/^USE .*?;\s*/im, '');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
    multipleStatements: true
  });

  try {
    await connection.query(schemaSql);
    console.log('StudySpark MySQL schema setup completed.');
  } finally {
    await connection.end();
  }
}

setupDatabase().catch((error) => {
  console.error('Unable to set up StudySpark MySQL schema.');
  console.error(`MySQL error: ${error.code || 'UNKNOWN'}`);
  process.exit(1);
});
