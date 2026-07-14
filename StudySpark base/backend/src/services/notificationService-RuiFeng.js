/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Implemented
  Description: MySQL-backed notifications service for study reminders and alerts.
*/

import { hasDatabaseConfig, query } from '../config/database.js';

async function getOrCreateDefaultUserId() {
  const existingUsers = await query('SELECT id FROM users ORDER BY id LIMIT 1');

  if (existingUsers[0]?.id) {
    return existingUsers[0].id;
  }

  const result = await query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    ['Default User', 'default@example.com', '$2a$10$placeholderhash']
  );

  return result.insertId;
}

async function getNotifications() {
  if (!hasDatabaseConfig()) {
    return [];
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
    ORDER BY created_at DESC
  `);

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
    isDue: false,
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
  const userId = notification.userId || (await getOrCreateDefaultUserId());

  if (!title || !message || !scheduledAt) {
    throw new Error('Title, message, and scheduled date/time are required.');
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

    const ids = rows.map((row) => row.id);
    await query(
      `UPDATE notifications SET is_read = TRUE WHERE id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    return ids;
  } catch (error) {
    console.error('Unable to process scheduled notifications:', error.message);
    return [];
  }
}

export { createNotification, getNotifications, processScheduledNotifications };
