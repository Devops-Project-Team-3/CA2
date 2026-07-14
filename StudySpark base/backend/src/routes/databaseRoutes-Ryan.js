/*
  Owner: Ryan
  Feature: GitHub & System Design
  Status: MySQL database foundation.
  Description: Routes for database health checks and expected StudySpark tables.
*/

import express from 'express';
import {
  getDatabaseTables,
  testDatabaseConnection
} from '../controllers/databaseController-Ryan.js';

const router = express.Router();

router.get('/test', testDatabaseConnection);
router.get('/tables', getDatabaseTables);

export default router;
