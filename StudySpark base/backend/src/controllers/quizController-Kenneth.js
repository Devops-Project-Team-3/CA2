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
    const questions = await requestGeminiQuiz(trimNotesForPrompt(notes), apiKey);
    return res.json({ questions });
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

    const questions = await requestGeminiQuiz(trimNotesForPrompt(extractedText), apiKey);

    return res.json({
      fileName: req.file.originalname,
      extractedCharacters: extractedText.length,
      questions
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

async function requestGeminiQuiz(notes, apiKey) {
  const model = 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: buildQuizPrompt(notes) }]
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

function buildQuizPrompt(notes) {
  return `
Generate exactly 5 quiz questions from these study notes.

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
  const topicTitle = String(req.body.topicTitle || 'AI Quiz Practice').trim().slice(0, 150);
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

    const revisionRecommendation = getRevisionLabel(score);
    const nextRevisionDate = calculateRevisionDueDate(new Date(), score);
    const result = await query(
      `INSERT INTO quiz_results
        (user_id, topic_title, questions, user_answers, score, revision_recommendation, next_revision_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
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
