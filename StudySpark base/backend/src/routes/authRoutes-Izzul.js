/*
  Owner: Izzul
  Feature: User Authentication
  Status: MySQL-backed auth integration.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import express from 'express';
import { getProfile, loginUser, registerUser } from '../controllers/authController-Izzul.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getProfile);

export default router;
