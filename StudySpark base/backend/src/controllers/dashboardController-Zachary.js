/*
  Owner: Zachary
  Feature: Adaptive Dashboard
  Status: MySQL-backed dashboard summary.
  Description: Reads planner, completed topic, and quiz data for the current user.
*/

import jwt from 'jsonwebtoken';
import { hasDatabaseConfig, query } from '../config/database.js';

function getBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
}

function calculateRevisionDueDate(lastQuizDate, score) {
  const baseDate = new Date(lastQuizDate);

  if (score < 60) {
    baseDate.setDate(baseDate.getDate() + 1);
  } else if (score <= 80) {
    baseDate.setDate(baseDate.getDate() + 3);
  } else {
    baseDate.setDate(baseDate.getDate() + 7);
  }

  return baseDate.toISOString().slice(0, 10);
}

function getRevisionLabel(score) {
  if (score < 60) {
    return 'Revise tomorrow';
  }

  if (score <= 80) {
    return 'Revise in 3 days';
  }

  return 'Revise in 7 days';
}

function isSessionCompleted(session) {
  return session.completed === true
    || session.completed === 1
    || session.completed === '1'
    || session.status === 'completed';
}

function toDateKey(dateValue) {
  if (!dateValue) {
    return null;
  }

  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
    return dateValue.slice(0, 10);
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateStudyStreak(activityDates) {
  const completedDays = new Set(activityDates.map(toDateKey).filter(Boolean));

  if (completedDays.size === 0) {
    return 0;
  }

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  let streak = 0;

  while (completedDays.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function buildNextAction({ recommendations, sessions, completedTopics, completedSessions }) {
  if (recommendations[0]) {
    const topic = recommendations[0];
    return {
      title: topic.isUrgent ? `Revise ${topic.name}` : `Review ${topic.name}`,
      description: `Last quiz score: ${topic.quizScore}%. ${topic.revisionLabel}, then try another AI quiz.`,
      actionLabel: 'Open AI Quiz',
      actionPath: '/ai-quiz'
    };
  }

  if (completedTopics[0] || completedSessions[0]) {
    const completedTopic = completedTopics[0]?.topic || completedSessions[0]?.topic || 'your completed topic';
    return {
      title: 'Take an AI quiz',
      description: `You completed ${completedTopic}. Test your understanding now.`,
      actionLabel: 'Open AI Quiz',
      actionPath: '/ai-quiz'
    };
  }

  if (sessions[0]) {
    return {
      title: sessions[0].topic || 'Upcoming study session',
      description: 'Study this next, then generate an AI quiz to check your understanding.',
      actionLabel: 'Open AI Quiz',
      actionPath: '/ai-quiz'
    };
  }

  return {
    title: 'Create a study session',
    description: 'Add a topic to start tracking progress and unlock AI quiz recommendations.',
    actionLabel: 'Open Planner',
    actionPath: '/planner'
  };
}

async function resolveDashboardUser(req) {
  const token = getBearerToken(req);

  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = await query('SELECT id, name, email FROM users WHERE id = ?', [decoded.id]);

      if (users[0]) {
        return users[0];
      }
    } catch {
      return null;
    }
  }

  return null;
}

async function getTableColumns(tableName) {
  const rows = await query(`SHOW COLUMNS FROM ${tableName}`);
  return new Set(rows.map((row) => row.Field));
}

function pickColumn(columns, candidates) {
  return candidates.find((candidate) => columns.has(candidate)) || null;
}

async function getStudySessions(userId) {
  const columns = await getTableColumns('study_sessions');
  const topicColumn = pickColumn(columns, ['title', 'topic']);
  const dateColumn = pickColumn(columns, ['date', 'study_date']);
  const completedColumn = pickColumn(columns, ['completed', 'is_completed']);
  const descriptionColumn = pickColumn(columns, ['description']);
  const durationColumn = pickColumn(columns, ['duration']);
  const studyTimeColumn = pickColumn(columns, ['study_time']);
  const statusColumn = pickColumn(columns, ['status']);

  const selectColumns = [
    'id',
    'subject',
    topicColumn ? `${topicColumn} AS topic` : "'Untitled study session' AS topic",
    dateColumn ? `${dateColumn} AS session_date` : 'NULL AS session_date',
    descriptionColumn ? `${descriptionColumn} AS description` : 'NULL AS description',
    studyTimeColumn ? `${studyTimeColumn} AS study_time` : 'NULL AS study_time',
    durationColumn ? `${durationColumn} AS duration` : 'NULL AS duration',
    statusColumn ? `${statusColumn} AS status` : 'NULL AS status',
    completedColumn ? `${completedColumn} AS completed` : 'FALSE AS completed'
  ];
  const orderColumn = dateColumn || 'created_at';

  return query(
    `SELECT ${selectColumns.join(', ')}
     FROM study_sessions
     WHERE user_id = ?
     ORDER BY ${orderColumn} ASC, created_at DESC
     LIMIT 50`,
    [userId]
  );
}

async function getDashboardPlaceholder(req, res) {
  if (!hasDatabaseConfig()) {
    return res.json({
      message: 'Dashboard loaded without database configuration.',
      data: {
        configured: false,
        user: null,
        metrics: {
          completedTopics: 0,
          totalTopics: 0,
          progressPercent: 0,
          studyStreak: 0
        },
        sessions: [],
        recommendations: [],
        mastery: []
      }
    });
  }

  try {
    const user = await resolveDashboardUser(req);

    if (!user) {
      return res.status(401).json({
        message: 'Login is required to load your dashboard data.',
        data: {
          configured: true,
          user: null,
          metrics: {
            completedTopics: 0,
            totalTopics: 0,
            progressPercent: 0,
            studyStreak: 0
          },
          sessions: [],
          recommendations: [],
          mastery: []
        }
      });
    }

    const allSessions = await getStudySessions(user.id);
    const sessions = allSessions.filter((session) => !isSessionCompleted(session)).slice(0, 5);
    const completedSessions = allSessions.filter(isSessionCompleted);

    const completedTopics = await query(
      `SELECT id, subject, topic, completed_at
       FROM completed_topics
       WHERE user_id = ?
       ORDER BY completed_at DESC`,
      [user.id]
    );

    const quizResults = await query(
      `SELECT id, topic_title, score, revision_recommendation, next_revision_date, created_at
       FROM quiz_results
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [user.id]
    );

    const masteryRows = await query(
      `SELECT subject, COUNT(*) AS completedCount
       FROM completed_topics
       WHERE user_id = ?
       GROUP BY subject
       ORDER BY completedCount DESC`,
      [user.id]
    );

    const completedTopicCount = completedTopics.length + completedSessions.length;
    const totalTopics = Math.max(completedTopicCount + sessions.length, allSessions.length, completedTopics.length, 0);
    const progressPercent = totalTopics === 0
      ? 0
      : Math.min(100, Math.round((completedTopicCount / totalTopics) * 100));

    const recommendations = quizResults.map((result) => {
      const score = Number(result.score || 0);
      const createdAt = result.created_at || new Date();
      const nextRevisionDate = result.next_revision_date
        ? toDateKey(result.next_revision_date)
        : calculateRevisionDueDate(createdAt, score);

      return {
        id: result.id,
        name: result.topic_title || 'Untitled quiz topic',
        subject: result.topic_title || 'General',
        quizScore: score,
        revisionLabel: result.revision_recommendation || getRevisionLabel(score),
        revisionDate: nextRevisionDate,
        isUrgent: score < 60
      };
    });
    const mappedSessions = sessions.map((session) => ({
      id: session.id,
      date: session.session_date,
      subject: session.subject,
      topic: session.topic,
      description: session.description,
      studyTime: session.study_time,
      duration: session.duration,
      status: session.status,
      completed: Boolean(session.completed)
    }));
    const nextAction = buildNextAction({
      recommendations,
      sessions: mappedSessions,
      completedTopics,
      completedSessions
    });
    const studyStreak = calculateStudyStreak([
      ...completedTopics.map((topic) => topic.completed_at),
      ...completedSessions.map((session) => session.session_date)
    ]);

    return res.json({
      message: 'Dashboard loaded successfully.',
      data: {
        configured: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        metrics: {
          completedTopics: completedTopicCount,
          totalTopics,
          progressPercent,
          studyStreak
        },
        sessions: mappedSessions,
        recommendations,
        mastery: masteryRows.map((row) => ({
          subject: row.subject,
          completedCount: Number(row.completedCount || 0),
          percent: completedTopics.length === 0
            ? 0
            : Math.round((Number(row.completedCount || 0) / completedTopics.length) * 100)
        })),
        nextAction
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error.message);
    return res.status(500).json({
      message: 'Unable to load dashboard data. Check MySQL and schema setup.'
    });
  }
}

export { getDashboardPlaceholder };
