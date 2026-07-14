/*
  Owner: Izzul
  Feature: User Authentication
  Status: MySQL-backed auth integration.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import express from 'express';
import { getProfile, loginUser, registerUser, updateAvatar } from '../controllers/authController-Izzul.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getProfile);
router.patch('/profile/avatar', updateAvatar);

export default router;
