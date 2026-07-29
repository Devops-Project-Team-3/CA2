/*
  Owner: Kenneth
  Feature: AI Quiz Generator
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Kenneth's AI Quiz Generator feature.
*/

import { API_BASE_URL, apiRequest } from './api.js';

const AUTH_TOKEN_KEY = 'studyspark_auth_token';

function getAuthHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function generateQuiz({ notes = '', fileName = '' } = {}) {
  // Gemini API integration runs on the backend only.
  // The frontend never receives or stores the Gemini API key.
  const response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ notes, fileName })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Unable to generate quiz.');
  }

  return { questions: data.questions, adaptiveInsight: data.adaptiveInsight || null };
}

async function generateQuizFromDocument(file) {
  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch(`${API_BASE_URL}/api/quiz/generate-from-document`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Unable to generate quiz from PDF.');
  }

  return { questions: data.questions, adaptiveInsight: data.adaptiveInsight || null };
}

function generateQuizPlaceholder(payload) {
  return generateQuiz(payload);
}

function generateQuizFromDocumentPlaceholder(file) {
  return generateQuizFromDocument(file);
}

function saveQuizResultsPlaceholder(payload = {}) {
  return apiRequest('/api/quiz/results', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

function getQuizHistoryPlaceholder(userId = 'placeholder-user') {
  return apiRequest(`/api/quiz/history/${userId}`);
}

export {
  generateQuiz,
  generateQuizFromDocument,
  generateQuizFromDocumentPlaceholder,
  generateQuizPlaceholder,
  getQuizHistoryPlaceholder,
  saveQuizResultsPlaceholder
};
