/*
  Owner: Izzul
  Feature: User Authentication
  Status: MySQL-backed auth integration.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import express from 'express';
import {
  getProfile,
  loginUser,
  registerUser,
  sendTestEmail,
  updateAvatar,
  verifyEmail
} from '../controllers/authController-Izzul.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/test-email', sendTestEmail);
router.get('/verify-email', verifyEmail);
router.get('/profile', getProfile);
router.patch('/profile/avatar', updateAvatar);

export default router;