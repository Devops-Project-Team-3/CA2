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

const requiredDatabaseEnv = ['DB_HOST', 'DB_PORT', 'DB_USER'];

function getMissingDatabaseEnv() {
  return requiredDatabaseEnv.filter((key) => !process.env[key]);
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
  const schemaSql = await fs.readFile(schemaPath, 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
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
