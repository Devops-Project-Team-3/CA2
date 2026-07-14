/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Rui Feng's Notifications feature.
*/

import express from 'express';
import {
  acknowledgeNotificationPlaceholder,
  createNotificationPlaceholder,
  getNotificationsPlaceholder
} from '../controllers/notificationController-RuiFeng.js';

const router = express.Router();

router.get('/', getNotificationsPlaceholder);
router.post('/', createNotificationPlaceholder);
router.patch('/:id/acknowledge', acknowledgeNotificationPlaceholder);

export default router;
