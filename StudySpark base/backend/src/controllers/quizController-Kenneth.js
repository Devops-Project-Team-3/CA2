/*
  Owner: Kenneth
  Feature: AI Quiz Generator
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Kenneth's AI Quiz Generator feature.
*/

import { PDFParse } from 'pdf-parse';
import jwt from 'jsonwebtoken';
import { hasDatabaseConfig, query } from '../config/database.js';

const MAX_NOTES_LENGTH = 12000;

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getRevisionLabelForDate(dateKey) {
  const today = parseDateKey(formatLocalDate(new Date()));
  const target = parseDateKey(dateKey);

  if (!today || !target) return 'Schedule a revision';

  const days = Math.round((target - today) / (24 * 60 * 60 * 1000));

  if (days <= 0) return 'Revise today';
  if (days === 1) return 'Revise tomorrow';
  return `Revise in ${days} days`;
}

function getValidStudySessionId(value) {
  const sessionId = Number(value);
  return Number.isInteger(sessionId) && sessionId > 0 ? sessionId : null;
}

function cleanTopicTitle(value) {
  const title = String(value || '').replace(/\s+/g, ' ').trim();

  if (!title) return 'AI Quiz Practice';
  if (title.length > 80 || title.split(' ').length > 12 || title.includes('. ')) {
    if (/\bvlan\b/i.test(title)) return 'VLAN Practice';
    if (/\btrunk\b|802\.1q/i.test(title)) return 'Switching Practice';
    return 'AI Quiz Practice';
  }

  return title.slice(0, 150);
}


function getBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
}

function calculateRevisionDueDate(lastQuizDate, score) {
  const baseDate = new Date(lastQuizDate);
  baseDate.setHours(0, 0, 0, 0);

  if (score < 60) {
    baseDate.setDate(baseDate.getDate() + 1);
  } else if (score <= 80) {
    baseDate.setDate(baseDate.getDate() + 3);
  } else {
    baseDate.setDate(baseDate.getDate() + 7);
  }

  return formatLocalDate(baseDate);
}

function getRevisionLabel(score) {
  return getRevisionLabelForDate(calculateRevisionDueDate(new Date(), score));
}

async function resolveQuizUserId(req) {
  const token = getBearerToken(req);

  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.id || null;
    } catch {
      return null;
    }
  }

  return null;
}

async function buildLocalQuizInsight(userId) {
  if (!userId || !hasDatabaseConfig()) {
    return {
      difficulty: 'standard',
      priority: 'notes-based practice',
      recommendation: 'Generate a quiz from the notes you pasted.'
    };
  }

  try {
    const [scoreRows, dueRows, overdueRows] = await Promise.all([
      query(
        `SELECT AVG(score) AS averageScore
         FROM (
           SELECT score
           FROM quiz_results
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT 5
         ) AS recent_scores`,
        [userId]
      ),
      query(
        `SELECT COUNT(*) AS dueCount
         FROM quiz_results
         WHERE user_id = ?
           AND next_revision_date IS NOT NULL
           AND next_revision_date <= CURDATE()`,
        [userId]
      ),
      query(
        `SELECT COUNT(*) AS overdueCount
         FROM quiz_results
         WHERE user_id = ?
           AND next_revision_date IS NOT NULL
           AND next_revision_date < CURDATE()`,
        [userId]
      )
    ]);

    const averageScore = Number(scoreRows[0]?.averageScore);
    const dueCount = Number(dueRows[0]?.dueCount || 0);
    const overdueCount = Number(overdueRows[0]?.overdueCount || 0);

    if (Number.isFinite(averageScore) && averageScore < 60) {
      return {
        difficulty: 'foundational',
        priority: overdueCount > 0 ? 'review focus' : dueCount > 0 ? 'revision due today' : 'weak-topic practice',
        recommendation: overdueCount > 0
          ? 'You have older low-score quiz practice in your history, so this quiz starts with fundamentals.'
          : 'Start with foundational questions and review explanations carefully.'
      };
    }

    if (Number.isFinite(averageScore) && averageScore >= 80 && overdueCount === 0) {
      return {
        difficulty: 'challenge',
        priority: 'progress extension',
        recommendation: 'Try a harder quiz and focus on application questions.'
      };
    }

    return {
      difficulty: 'standard',
      priority: overdueCount > 0 ? 'review focus' : dueCount > 0 ? 'revision due today' : 'balanced practice',
      recommendation: overdueCount > 0
        ? 'Revise due topics before adding too many new ones.'
        : 'Keep practising with a balanced quiz.'
    };
  } catch (error) {
    console.error('Local quiz insight error:', error.message);
    return {
      difficulty: 'standard',
      priority: 'notes-based practice',
      recommendation: 'Generate a quiz from the notes you pasted.'
    };
  }
}

async function resolvePlannerTopicTitle(userId, studySessionId, fallbackTitle) {
  const sessionId = Number(studySessionId);

  if (!userId || !Number.isInteger(sessionId) || sessionId <= 0 || !hasDatabaseConfig()) {
    return cleanTopicTitle(fallbackTitle);
  }

  const rows = await query(
    `SELECT subject, title
     FROM study_sessions
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [sessionId, userId]
  );

  if (!rows[0]) {
    return cleanTopicTitle(fallbackTitle);
  }

  const subject = String(rows[0].subject || 'General').trim();
  const title = String(rows[0].title || fallbackTitle || 'AI Quiz Practice').trim();
  return cleanTopicTitle(subject && subject !== 'General' ? `${subject} - ${title}` : title);
}
function generateQuizPlaceholder(req, res) {
  generateQuizWithGemini(req, res);
}

async function generateQuizWithGemini(req, res) {
  const notes = typeof req.body.notes === 'string' ? req.body.notes.trim() : '';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!notes) {
    return res.status(400).json({ error: 'Study notes are required to generate a quiz.' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is missing on the backend.' });
  }

  try {
    const userId = await resolveQuizUserId(req);
    const adaptiveInsight = await buildLocalQuizInsight(userId);
    const questions = await requestGeminiQuiz(trimNotesForPrompt(notes), apiKey, adaptiveInsight);
    return res.json({ questions, adaptiveInsight });
  } catch (error) {
    if (error.message === 'INVALID_GEMINI_JSON') {
      return res.status(502).json({ error: 'Gemini returned invalid JSON. Please try again.' });
    }

    if (error.message === 'INVALID_QUIZ_FORMAT') {
      return res.status(502).json({ error: 'Gemini returned an invalid quiz format. Please try again.' });
    }

    return res.status(502).json({ error: 'Gemini failed to generate a quiz. Please try again.' });
  }
}

async function generateFromDocumentPlaceholder(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PDF file to generate a quiz.' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is missing on the backend.' });
  }

  try {
    const extractedText = await extractPdfText(req.file.buffer);

    if (!extractedText) {
      return res.status(400).json({
        error: 'No readable text was found in this PDF. Try a text-based PDF or paste the notes instead.'
      });
    }

    const userId = await resolveQuizUserId(req);
    const adaptiveInsight = await buildLocalQuizInsight(userId);
    const questions = await requestGeminiQuiz(trimNotesForPrompt(extractedText), apiKey, adaptiveInsight);

    return res.json({
      fileName: req.file.originalname,
      extractedCharacters: extractedText.length,
      questions,
      adaptiveInsight
    });
  } catch (error) {
    if (error.message === 'INVALID_GEMINI_JSON') {
      return res.status(502).json({ error: 'Gemini returned invalid JSON. Please try again.' });
    }

    if (error.message === 'INVALID_QUIZ_FORMAT') {
      return res.status(502).json({ error: 'Gemini returned an invalid quiz format. Please try again.' });
    }

    return res.status(502).json({ error: 'Unable to read this PDF or generate a quiz from it.' });
  }
}

async function requestGeminiQuiz(notes, apiKey, adaptiveInsight = null) {
  const model = 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: buildQuizPrompt(notes, adaptiveInsight) }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    throw new Error('GEMINI_REQUEST_FAILED');
  }

  const geminiResponse = await response.json();
  const text = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('INVALID_GEMINI_JSON');
  }

  const parsedResponse = parseGeminiJson(text);
  const questions = parsedResponse.questions;

  if (!isValidQuizQuestions(questions)) {
    throw new Error('INVALID_QUIZ_FORMAT');
  }

  return questions.map((question, index) => ({
    id: index + 1,
    type: question.type,
    question: question.question,
    options: question.options || [],
    correctAnswer: question.correctAnswer || '',
    sampleAnswer: question.sampleAnswer || question.correctAnswer || '',
    explanation: question.explanation
  }));
}

function buildQuizPrompt(notes, adaptiveInsight = null) {
  const guidanceLines = adaptiveInsight
    ? [
        '',
        'Adaptive learning guidance:',
        `- Difficulty: ${adaptiveInsight.difficulty}.`,
        `- Priority: ${adaptiveInsight.priority}.`,
        `- Recommendation style: ${adaptiveInsight.recommendation}.`,
        'Use this guidance to adjust question difficulty and explanation depth, but base all question content only on the study notes.',
        ''
      ].join('\n')
    : '';

  return `
Generate exactly 5 quiz questions from these study notes.
${guidanceLines}
Return JSON only in this exact format:
{
  "questions": [
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "string",
      "sampleAnswer": "",
      "explanation": "string"
    },
    {
      "id": 4,
      "type": "open-ended",
      "question": "string",
      "options": [],
      "correctAnswer": "",
      "sampleAnswer": "string",
      "explanation": "string"
    }
  ]
}

Rules:
- Generate exactly 5 questions.
- Generate exactly 3 multiple-choice questions and exactly 2 open-ended questions.
- Preserve the main language of the study notes. If the notes are in Chinese, write every generated question, option, correctAnswer, explanation, and sampleAnswer in Chinese. If the notes are mixed-language, use the dominant language from the notes and keep technical terms as written.
- Multiple-choice questions must have type "multiple-choice", exactly 4 options, and correctAnswer must exactly match one option string.
- Open-ended questions must have type "open-ended", options as an empty array, correctAnswer as an empty string, and a clear sampleAnswer.
- explanation should briefly explain why the correct answer is right.
- Do not include markdown, code fences, or extra text.

Study notes:
${notes}
`;
}
async function extractPdfText(pdfBuffer) {
  const parser = new PDFParse({ data: pdfBuffer });

  try {
    const parsedPdf = await parser.getText();
    return (parsedPdf.text || '').replace(/\s+/g, ' ').trim();
  } finally {
    await parser.destroy();
  }
}

function trimNotesForPrompt(notes) {
  return notes.length > MAX_NOTES_LENGTH ? notes.slice(0, MAX_NOTES_LENGTH) : notes;
}

function parseGeminiJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const cleanedText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      throw new Error('INVALID_GEMINI_JSON');
    }
  }
}

function isValidQuizQuestions(questions) {
  if (!Array.isArray(questions) || questions.length !== 5) {
    return false;
  }

  const multipleChoiceCount = questions.filter((question) => question.type === 'multiple-choice').length;
  const openEndedCount = questions.filter((question) => question.type === 'open-ended').length;

  if (multipleChoiceCount !== 3 || openEndedCount !== 2) {
    return false;
  }

  return questions.every((question) => {
    const hasValidOptions =
      Array.isArray(question.options) &&
      question.options.length === 4 &&
      question.options.every((option) => typeof option === 'string' && option.trim());

    const hasBaseFields =
      Number.isInteger(question.id) &&
      typeof question.question === 'string' &&
      question.question.trim() &&
      typeof question.explanation === 'string' &&
      question.explanation.trim();

    if (question.type === 'multiple-choice') {
      return (
        hasBaseFields &&
        hasValidOptions &&
        typeof question.correctAnswer === 'string' &&
        question.options.includes(question.correctAnswer)
      );
    }

    return (
      hasBaseFields &&
      Array.isArray(question.options) &&
      question.options.length === 0 &&
      typeof question.sampleAnswer === 'string' &&
      question.sampleAnswer.trim()
    );
  });
}

async function saveQuizResultsPlaceholder(req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(500).json({ error: 'Database environment variables are missing.' });
  }

  const score = Number(req.body.score);
  const requestedTopicTitle = req.body.topicTitle || 'AI Quiz Practice';
  const questions = Array.isArray(req.body.questions) ? req.body.questions : [];
  const userAnswers = req.body.userAnswers && typeof req.body.userAnswers === 'object'
    ? req.body.userAnswers
    : {};

  if (!Number.isFinite(score)) {
    return res.status(400).json({ error: 'A valid quiz score is required.' });
  }

  try {
    const userId = await resolveQuizUserId(req);

    if (!userId) {
      return res.status(401).json({ error: 'Login is required to save quiz results.' });
    }

    const nextRevisionDate = calculateRevisionDueDate(new Date(), score);
    const revisionRecommendation = getRevisionLabelForDate(nextRevisionDate);
    const topicTitle = await resolvePlannerTopicTitle(userId, req.body.studySessionId, requestedTopicTitle);
    const studySessionId = getValidStudySessionId(req.body.studySessionId);
    const result = await query(
      `INSERT INTO quiz_results
        (user_id, study_session_id, topic_title, questions, user_answers, score, revision_recommendation, next_revision_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        studySessionId,
        topicTitle || 'AI Quiz Practice',
        JSON.stringify(questions),
        JSON.stringify(userAnswers),
        score,
        revisionRecommendation,
        nextRevisionDate
      ]
    );

    return res.status(201).json({
      message: 'Quiz result saved successfully.',
      data: {
        result: {
          id: result.insertId,
          topicTitle,
          score,
          revisionRecommendation,
          nextRevisionDate
        }
      }
    });
  } catch (error) {
    console.error('Save quiz result error:', error.message);
    return res.status(500).json({ error: 'Unable to save quiz result.' });
  }
}

async function getQuizHistoryPlaceholder(req, res) {
  if (!hasDatabaseConfig()) {
    return res.status(500).json({ error: 'Database environment variables are missing.' });
  }

  try {
    const userId = await resolveQuizUserId(req);

    if (!userId) {
      return res.status(401).json({ error: 'Login is required to view quiz history.' });
    }

    const history = await query(
      `SELECT id, topic_title AS topicTitle, score, revision_recommendation AS revisionRecommendation,
        next_revision_date AS nextRevisionDate, created_at AS createdAt
       FROM quiz_results
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    return res.json({
      message: 'Quiz history loaded successfully.',
      data: { history }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to load quiz history.' });
  }
}

export {
  generateFromDocumentPlaceholder,
  generateQuizPlaceholder,
  getQuizHistoryPlaceholder,
  saveQuizResultsPlaceholder
};
