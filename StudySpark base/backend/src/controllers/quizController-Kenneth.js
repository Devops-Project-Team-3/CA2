/*
  Owner: Kenneth
  Feature: AI Quiz Generator
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Kenneth's AI Quiz Generator feature.
*/

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
    const questions = await requestGeminiQuiz(notes, apiKey);
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
    question: question.question,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation
  }));
}

function buildQuizPrompt(notes) {
  return `
Generate exactly 5 multiple-choice quiz questions from these study notes.

Return JSON only in this exact format:
{
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}

Rules:
- Generate exactly 5 questions.
- Each question must have exactly 4 options.
- correctAnswer must exactly match one option string.
- explanation should briefly explain why the correct answer is right.
- Do not include markdown, code fences, or extra text.

Study notes:
${notes}
`;
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

  return questions.every((question) => {
    const hasValidOptions =
      Array.isArray(question.options) &&
      question.options.length === 4 &&
      question.options.every((option) => typeof option === 'string' && option.trim());

    return (
      Number.isInteger(question.id) &&
      typeof question.question === 'string' &&
      question.question.trim() &&
      hasValidOptions &&
      typeof question.correctAnswer === 'string' &&
      question.options.includes(question.correctAnswer) &&
      typeof question.explanation === 'string' &&
      question.explanation.trim()
    );
  });
}

function generateFromDocumentPlaceholder(req, res) {
  // Future database logic: save document-derived quiz metadata after upload support is added.
  res.json({
    message: 'AI Quiz document generation route placeholder. Kenneth will implement this feature.',
    data: { quiz: null }
  });
}

function saveQuizResultsPlaceholder(req, res) {
  // Future database logic: insert quiz result records for the current user.
  res.json({
    message: 'AI Quiz results route placeholder. Kenneth will implement this feature.',
    data: { result: null }
  });
}

function getQuizHistoryPlaceholder(req, res) {
  // Future database logic: read quiz history records for the requested user.
  res.json({
    message: 'AI Quiz history route placeholder. Kenneth will implement this feature.',
    data: { history: [], userId: req.params.userId }
  });
}

export {
  generateFromDocumentPlaceholder,
  generateQuizPlaceholder,
  getQuizHistoryPlaceholder,
  saveQuizResultsPlaceholder
};
