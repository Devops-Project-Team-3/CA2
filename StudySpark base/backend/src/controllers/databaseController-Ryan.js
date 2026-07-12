/*
  Owner: Ryan
  Feature: GitHub & System Design
  Status: MySQL database foundation.
  Description: Database health and metadata endpoints for StudySpark.
*/

import { getMissingDatabaseEnv, query } from '../config/database.js';

const expectedTables = [
  'users',
  'study_sessions',
  'completed_topics',
  'materials',
  'quiz_results',
  'notifications'
];

async function testDatabaseConnection(req, res) {
  const missingEnv = getMissingDatabaseEnv();

  if (missingEnv.length > 0) {
    return res.status(500).json({
      success: false,
      message: 'Database environment variables are missing',
      missing: missingEnv
    });
  }

  try {
    await query('SELECT 1 AS result');

    return res.json({
      success: true,
      message: 'MySQL database connected successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to connect to MySQL database'
    });
  }
}

function getDatabaseTables(req, res) {
  res.json({
    success: true,
    tables: expectedTables
  });
}

export { getDatabaseTables, testDatabaseConnection };
