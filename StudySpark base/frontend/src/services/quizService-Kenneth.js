/*
  Owner: Kenneth
  Feature: AI Quiz Generator
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Kenneth's AI Quiz Generator feature.
*/

import { API_BASE_URL, apiRequest } from './api.js';

async function generateQuiz({ notes = '', fileName = '' } = {}) {
  // Gemini API integration runs on the backend only.
  // The frontend never receives or stores the Gemini API key.
  const response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes, fileName })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Unable to generate quiz.');
  }

  return data.questions;
}

function generateQuizPlaceholder(payload) {
  return generateQuiz(payload);
}

function generateQuizFromDocumentPlaceholder() {
  return apiRequest('/api/quiz/generate-from-document', { method: 'POST' });
}

function saveQuizResultsPlaceholder() {
  return apiRequest('/api/quiz/results', { method: 'POST' });
}

function getQuizHistoryPlaceholder(userId = 'placeholder-user') {
  return apiRequest(`/api/quiz/history/${userId}`);
}

export {
  generateQuiz,
  generateQuizFromDocumentPlaceholder,
  generateQuizPlaceholder,
  getQuizHistoryPlaceholder,
  saveQuizResultsPlaceholder
};
