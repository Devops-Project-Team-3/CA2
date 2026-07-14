/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Rui Feng's Notifications feature.
*/

import express from 'express';
import {
  createNotificationPlaceholder,
  getNotificationsPlaceholder
} from '../controllers/notificationController-RuiFeng.js';

const router = express.Router();

router.get('/', getNotificationsPlaceholder);
router.post('/', createNotificationPlaceholder);

export default router;
