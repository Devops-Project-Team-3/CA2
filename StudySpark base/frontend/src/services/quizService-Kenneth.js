/*
  Owner: Kenneth
  Feature: AI Quiz Generator
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Kenneth's AI Quiz Generator feature.
*/

import { apiRequest } from './api.js';

async function generateQuiz({ notes = '', fileName = '' } = {}) {
  // Gemini API integration will be added here later.
  // For now, this sends notes to the backend and receives mock quiz questions.
  const response = await apiRequest('/api/quiz/generate', {
    method: 'POST',
    body: JSON.stringify({ notes, fileName })
  });

  return response.questions;
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
