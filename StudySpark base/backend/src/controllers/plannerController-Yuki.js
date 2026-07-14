/*
  Owner: Yuki
  Feature: Study Planner CRUD
  Status: Connected to MySQL.
  Description: Backend planner controller using the shared StudySpark database.
*/

import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

function getPlannerUserId(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.id) {
        return decoded.id;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function requirePlannerUser(req, res) {
  const userId = getPlannerUserId(req);

  if (!userId) {
    res.status(401).json({
      message: 'Login is required to access study planner data.'
    });
    return null;
  }

  return userId;
}

function toDateOnly(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return String(value).slice(0, 10);
}

function mapDatabaseRow(row) {
  return {
    id: String(row.id),
    title: row.title,
    subject: row.subject,
    description: row.description || '',
    date: toDateOnly(row.date),
    completed: Boolean(row.completed),
    duration: Number(row.duration || 45),
    status: row.status || 'planned',
    studyTime: row.study_time || null,
    createdAt: row.created_at
  };
}

async function getPlannerPlaceholder(req, res) {
  const userId = requirePlannerUser(req, res);
  if (!userId) return;

  try {
    const rows = await query(
      `
        SELECT
          id,
          user_id,
          subject,
          title,
          description,
          date,
          study_time,
          duration,
          status,
          completed,
          created_at
        FROM study_sessions
        WHERE user_id = ?
        ORDER BY date ASC, created_at DESC
      `,
      [userId]
    );

    const plannerItems = rows.map(mapDatabaseRow);

    return res.json({
      message: 'Study Planner sessions fetched successfully.',
      data: { plannerItems }
    });
  } catch (error) {
    console.error('Unable to fetch study sessions:', error);

    return res.status(500).json({
      message: 'Unable to fetch study sessions.'
    });
  }
}

async function createPlannerPlaceholder(req, res) {
  const userId = requirePlannerUser(req, res);
  if (!userId) return;

  try {
    const {
      title,
      subject,
      description,
      date,
      completed,
      duration
    } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        message: 'A study session title is required.'
      });
    }

    if (!date) {
      return res.status(400).json({
        message: 'A study session date is required.'
      });
    }

    const parsedDuration = Number(duration);
    const safeDuration =
      Number.isFinite(parsedDuration) && parsedDuration > 0
        ? parsedDuration
        : 45;

    const safeCompleted = Boolean(completed);
    const status = safeCompleted ? 'completed' : 'planned';

    const result = await query(
      `
        INSERT INTO study_sessions
        (
          user_id,
          subject,
          title,
          description,
          date,
          study_time,
          duration,
          status,
          completed
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        subject ? String(subject).trim() : 'General',
        title.trim(),
        description ? String(description).trim() : '',
        toDateOnly(date),
        null,
        safeDuration,
        status,
        safeCompleted
      ]
    );

    const rows = await query(
      `
        SELECT
          id,
          user_id,
          subject,
          title,
          description,
          date,
          study_time,
          duration,
          status,
          completed,
          created_at
        FROM study_sessions
        WHERE id = ? AND user_id = ?
      `,
      [result.insertId, userId]
    );

    const plannerItem = mapDatabaseRow(rows[0]);

    return res.status(201).json({
      message: 'Study session created successfully.',
      data: { plannerItem }
    });
  } catch (error) {
    console.error('Unable to create study session:', error);

    return res.status(500).json({
      message: 'Unable to create study session.'
    });
  }
}

async function updatePlannerPlaceholder(req, res) {
  const userId = requirePlannerUser(req, res);
  if (!userId) return;

  try {
    const sessionId = Number(req.params.id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({
        message: 'Invalid study session ID.'
      });
    }

    const existingRows = await query(
      `
        SELECT *
        FROM study_sessions
        WHERE id = ? AND user_id = ?
      `,
      [sessionId, userId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        message: 'Study session not found.'
      });
    }

    const existing = existingRows[0];
    const {
      title,
      subject,
      description,
      date,
      completed,
      duration
    } = req.body || {};

    const updatedTitle =
      title !== undefined
        ? String(title).trim() || existing.title
        : existing.title;

    const updatedSubject =
      subject !== undefined
        ? String(subject).trim() || 'General'
        : existing.subject;

    const updatedDescription =
      description !== undefined
        ? String(description).trim()
        : existing.description;

    const updatedDate =
      date !== undefined && date
        ? toDateOnly(date)
        : existing.date;

    const updatedCompleted =
      completed !== undefined
        ? Boolean(completed)
        : Boolean(existing.completed);

    let updatedDuration = Number(existing.duration || 45);

    if (duration !== undefined) {
      const parsedDuration = Number(duration);

      if (Number.isFinite(parsedDuration) && parsedDuration > 0) {
        updatedDuration = parsedDuration;
      }
    }

    const updatedStatus = updatedCompleted ? 'completed' : 'planned';

    await query(
      `
        UPDATE study_sessions
        SET
          subject = ?,
          title = ?,
          description = ?,
          date = ?,
          duration = ?,
          status = ?,
          completed = ?
        WHERE id = ? AND user_id = ?
      `,
      [
        updatedSubject,
        updatedTitle,
        updatedDescription,
        updatedDate,
        updatedDuration,
        updatedStatus,
        updatedCompleted,
        sessionId,
        userId
      ]
    );

    const rows = await query(
      `
        SELECT
          id,
          user_id,
          subject,
          title,
          description,
          date,
          study_time,
          duration,
          status,
          completed,
          created_at
        FROM study_sessions
        WHERE id = ? AND user_id = ?
      `,
      [sessionId, userId]
    );

    const plannerItem = mapDatabaseRow(rows[0]);

    return res.json({
      message: 'Study session updated successfully.',
      data: { plannerItem }
    });
  } catch (error) {
    console.error('Unable to update study session:', error);

    return res.status(500).json({
      message: 'Unable to update study session.'
    });
  }
}

async function deletePlannerPlaceholder(req, res) {
  const userId = requirePlannerUser(req, res);
  if (!userId) return;

  try {
    const sessionId = Number(req.params.id);

    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({
        message: 'Invalid study session ID.'
      });
    }

    const result = await query(
      `
        DELETE FROM study_sessions
        WHERE id = ? AND user_id = ?
      `,
      [sessionId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Study session not found.'
      });
    }

    return res.json({
      message: 'Study session deleted successfully.',
      data: {
        deleted: true,
        id: String(sessionId)
      }
    });
  } catch (error) {
    console.error('Unable to delete study session:', error);

    return res.status(500).json({
      message: 'Unable to delete study session.'
    });
  }
}

export {
  createPlannerPlaceholder,
  deletePlannerPlaceholder,
  getPlannerPlaceholder,
  updatePlannerPlaceholder
};
