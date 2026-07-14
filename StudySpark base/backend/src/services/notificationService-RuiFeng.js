/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Implemented
  Description: MySQL-backed notifications service for study reminders and alerts.
*/

import { hasDatabaseConfig, query } from '../config/database.js';

async function getNotifications(userId) {
  if (!hasDatabaseConfig()) {
    return [];
  }

  if (!userId) {
    throw new Error('A logged-in user is required to load notifications.');
  }

  const rows = await query(`
    SELECT
      id,
      title,
      message,
      type,
      priority,
      scheduled_for AS scheduledFor,
      is_read AS isRead,
      created_at AS createdAt
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `, [userId]);

  return rows.map((row) => ({
    id: row.id,
    category: row.type || 'Study Reminder',
    title: row.title,
    message: row.message,
    scheduled: row.scheduledFor
      ? new Date(row.scheduledFor).toLocaleString()
      : null,
    scheduledAt: row.scheduledFor
      ? new Date(row.scheduledFor).toISOString()
      : null,
    isAcknowledged: Boolean(row.isRead),
    isDue: Boolean(row.scheduledFor && new Date(row.scheduledFor) <= new Date() && !row.isRead),
    createdAt: row.createdAt
  }));
}

async function createNotification(notification) {
  if (!hasDatabaseConfig()) {
    throw new Error('Database configuration is missing. Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME.');
  }

  const title = (notification.title || '').trim();
  const message = (notification.message || '').trim();
  const category = notification.category || 'Study Reminder';
  const scheduledAt = notification.scheduledAt || null;
  const userId = notification.userId;

  if (!title || !message || !scheduledAt) {
    throw new Error('Title, message, and scheduled date/time are required.');
  }

  if (!userId) {
    throw new Error('A logged-in user is required to create notifications.');
  }

  const result = await query(
    `INSERT INTO notifications (user_id, title, message, type, priority, scheduled_for, is_read)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, title, message, category, notification.priority || 'normal', scheduledAt ? new Date(scheduledAt) : null, false]
  );

  return {
    id: result.insertId,
    category,
    title,
    message,
    scheduled: scheduledAt ? new Date(scheduledAt).toLocaleString() : null,
    scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    isAcknowledged: false,
    isDue: false
  };
}

async function processScheduledNotifications() {
  if (!hasDatabaseConfig()) {
    return [];
  }

  try {
    const now = new Date();
    const rows = await query(
      `SELECT id FROM notifications
       WHERE is_read = FALSE
         AND scheduled_for IS NOT NULL
         AND scheduled_for <= ?`,
      [now]
    );

    if (!rows.length) {
      return [];
    }

    return rows.map((row) => row.id);
  } catch (error) {
    console.error('Unable to process scheduled notifications:', error.message);
    return [];
  }
}

async function acknowledgeNotification(userId, notificationId) {
  if (!hasDatabaseConfig()) {
    throw new Error('Database configuration is missing.');
  }

  if (!userId) {
    throw new Error('A logged-in user is required to acknowledge notifications.');
  }

  const result = await query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );

  return result.affectedRows > 0;
}

export { acknowledgeNotification, createNotification, getNotifications, processScheduledNotifications };
