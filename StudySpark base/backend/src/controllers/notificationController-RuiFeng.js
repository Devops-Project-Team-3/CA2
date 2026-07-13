/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Implemented
  Description: Controller logic for listing and creating study notifications.
*/

import { createNotification, getNotifications } from '../services/notificationService-RuiFeng.js';

async function getNotificationsPlaceholder(req, res) {
  try {
    const notifications = await getNotifications();

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
  const { category, title, message, scheduled, scheduledAt } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      message: 'Title and message are required to create a notification.'
    });
  }

  try {
    const notification = await createNotification({
      category,
      title,
      message,
      scheduled,
      scheduledAt,
      userId: req.user?.id
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

export { createNotificationPlaceholder, getNotificationsPlaceholder };
