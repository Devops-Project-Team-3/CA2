/*
  Owner: Yuki
  Feature: Study Planner CRUD
  Status: Connected to MySQL.
  Description: Backend planner controller using the shared StudySpark database.
*/

import { query } from '../config/database.js';

const TEST_USER_ID = 1;

function mapDatabaseRow(row) {
  return {
    id: String(row.id),
    title: row.title,
    subject: row.subject,
    description: row.description || '',
    date: row.date
      ? new Date(row.date).toISOString().slice(0, 10)
      : '',
    completed: Boolean(row.completed),
    duration: Number(row.duration || 45),
    status: row.status || 'planned',
    studyTime: row.study_time || null,
    createdAt: row.created_at
  };
}

async function getPlannerPlaceholder(req, res) {
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
      [TEST_USER_ID]
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
        TEST_USER_ID,
        subject ? String(subject).trim() : 'General',
        title.trim(),
        description ? String(description).trim() : '',
        String(date),
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
      [result.insertId, TEST_USER_ID]
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
      [sessionId, TEST_USER_ID]
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
        ? String(date)
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
        TEST_USER_ID
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
      [sessionId, TEST_USER_ID]
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
      [sessionId, TEST_USER_ID]
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