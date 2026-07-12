/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Implemented
  Description: Controller logic for listing and creating study notifications.
*/

import { createNotification, getNotifications } from '../services/notificationService-RuiFeng.js';

function getNotificationsPlaceholder(req, res) {
  res.json({
    message: 'Notifications loaded successfully.',
    data: { notifications: getNotifications() }
  });
}

function createNotificationPlaceholder(req, res) {
  const { category, title, message, scheduled, scheduledAt } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      message: 'Title and message are required to create a notification.'
    });
  }

  const notification = createNotification({
    category,
    title,
    message,
    scheduled,
    scheduledAt
  });

  res.status(201).json({
    message: 'Notification created successfully.',
    data: { notification }
  });
}

export { createNotificationPlaceholder, getNotificationsPlaceholder };
