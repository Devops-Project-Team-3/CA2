/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Implemented
  Description: Controller logic for listing and creating study notifications.
*/

import {
  acknowledgeNotification,
  clearAcknowledgedNotifications,
  createNotification,
  getNotifications
} from '../services/notificationService-RuiFeng.js';
import jwt from 'jsonwebtoken';

function getNotificationUserId(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || null;
  } catch {
    return null;
  }
}

function requireNotificationUser(req, res) {
  const userId = getNotificationUserId(req);

  if (!userId) {
    res.status(401).json({
      message: 'Login is required to access notifications.'
    });
    return null;
  }

  return userId;
}

async function getNotificationsPlaceholder(req, res) {
  const userId = requireNotificationUser(req, res);
  if (!userId) return;

  try {
    const notifications = await getNotifications(userId);

    res.json({
      message: 'Notifications loaded successfully.',
      data: { notifications }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to load notifications.',
      error: error.message
    });
  }
}

async function createNotificationPlaceholder(req, res) {
  const userId = requireNotificationUser(req, res);
  if (!userId) return;

  const category = req.body?.category;
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const scheduled = req.body?.scheduled;
  const scheduledAt = typeof req.body?.scheduledAt === 'string' ? req.body.scheduledAt.trim() : '';

  if (!title || !message || !scheduledAt) {
    return res.status(400).json({
      message: 'Title, message, and scheduled date/time are required to create a notification.'
    });
  }

  try {
    const notification = await createNotification({
      category,
      title,
      message,
      scheduled,
      scheduledAt,
      userId
    });

    res.status(201).json({
      message: 'Notification created successfully.',
      data: { notification }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to create notification.',
      error: error.message
    });
  }
}


async function clearAcknowledgedNotificationsPlaceholder(req, res) {
  const userId = requireNotificationUser(req, res);
  if (!userId) return;

  try {
    const deletedCount = await clearAcknowledgedNotifications(userId);

    return res.json({
      message: 'Acknowledged reminders cleared successfully.',
      data: { deletedCount }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to clear acknowledged reminders.',
      error: error.message
    });
  }
}
async function acknowledgeNotificationPlaceholder(req, res) {
  const userId = requireNotificationUser(req, res);
  if (!userId) return;

  const notificationId = Number(req.params.id);

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return res.status(400).json({
      message: 'Invalid notification ID.'
    });
  }

  try {
    const acknowledged = await acknowledgeNotification(userId, notificationId);

    if (!acknowledged) {
      return res.status(404).json({
        message: 'Notification not found.'
      });
    }

    return res.json({
      message: 'Notification acknowledged successfully.',
      data: { acknowledged: true, id: notificationId }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to acknowledge notification.',
      error: error.message
    });
  }
}

export {
  acknowledgeNotificationPlaceholder,
  clearAcknowledgedNotificationsPlaceholder,
  createNotificationPlaceholder,
  getNotificationsPlaceholder
};
