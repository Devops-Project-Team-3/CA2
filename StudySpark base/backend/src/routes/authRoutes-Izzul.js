/*
  Owner: Izzul
  Feature: User Authentication
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import express from 'express';
import {
  getProfilePlaceholder,
  loginPlaceholder,
  registerPlaceholder
} from '../controllers/authController-Izzul.js';

const router = express.Router();

router.post('/register', registerPlaceholder);
router.post('/login', loginPlaceholder);
router.get('/profile', getProfilePlaceholder);

export default router;
