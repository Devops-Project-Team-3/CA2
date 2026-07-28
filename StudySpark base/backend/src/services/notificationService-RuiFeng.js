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

  await createAdaptiveNotifications(userId);

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

async function createAdaptiveNotifications(userId) {
  await createMissedStudyNotifications(userId);
  await createRevisionDueNotifications(userId);
}

async function createMissedStudyNotifications(userId) {
  const missedSessions = await query(
    `SELECT id, title, subject, date
     FROM study_sessions
     WHERE user_id = ?
       AND completed = FALSE
       AND date < CURDATE()
     ORDER BY date ASC
     LIMIT 5`,
    [userId]
  );

  for (const session of missedSessions) {
    const title = `Missed study session: ${session.title}`.slice(0, 150);
    const message = `You missed ${session.subject || 'a study topic'} on ${formatDateOnly(session.date)}. Move it to your next available study slot so your plan stays accurate.`;
    await createSystemNotificationIfMissing({
      userId,
      title,
      message,
      category: 'Adaptive Reminder',
      priority: 'high',
      scheduledAt: new Date()
    });
  }
}

async function createRevisionDueNotifications(userId) {
  const dueResults = await query(
    `SELECT id, topic_title AS topicTitle, score, next_revision_date AS nextRevisionDate
     FROM quiz_results
     WHERE user_id = ?
       AND next_revision_date IS NOT NULL
       AND next_revision_date <= CURDATE()
     ORDER BY next_revision_date ASC, score ASC
     LIMIT 5`,
    [userId]
  );

  for (const result of dueResults) {
    const topicTitle = result.topicTitle || 'AI Quiz Practice';
    const title = `Revision due: ${topicTitle}`.slice(0, 150);
    const message = `Your previous quiz score was ${Math.round(Number(result.score || 0))}%. Review this topic before moving on to stronger areas.`;
    await createSystemNotificationIfMissing({
      userId,
      title,
      message,
      category: 'Adaptive Revision',
      priority: Number(result.score) < 60 ? 'urgent' : 'high',
      scheduledAt: new Date()
    });
  }
}

async function createSystemNotificationIfMissing(notification) {
  const duplicates = await query(
    `SELECT id
     FROM notifications
     WHERE user_id = ?
       AND title = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL 3 DAY)
     LIMIT 1`,
    [notification.userId, notification.title]
  );

  if (duplicates.length > 0) {
    return null;
  }

  return createNotification(notification);
}

function formatDateOnly(value) {
  if (!value) return 'a previous date';
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
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
    isDue: Boolean(scheduledAt && new Date(scheduledAt) <= new Date())
  };
}


async function clearAcknowledgedNotifications(userId) {
  if (!hasDatabaseConfig()) {
    throw new Error('Database configuration is missing.');
  }

  if (!userId) {
    throw new Error('A logged-in user is required to clear reminders.');
  }

  const result = await query(
    `DELETE FROM notifications
     WHERE user_id = ?
       AND is_read = TRUE`,
    [userId]
  );

  return Number(result.affectedRows || 0);
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

export { acknowledgeNotification, clearAcknowledgedNotifications, createNotification, getNotifications, processScheduledNotifications };
