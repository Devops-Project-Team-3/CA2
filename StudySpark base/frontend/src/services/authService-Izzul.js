/*
  Owner: Izzul
  Feature: User Authentication
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import { apiRequest } from './api.js';

function registerPlaceholder() {
  return apiRequest('/api/auth/register', { method: 'POST' });
}

function loginPlaceholder() {
  return apiRequest('/api/auth/login', { method: 'POST' });
}

function getProfilePlaceholder() {
  return apiRequest('/api/auth/profile');
}

export { getProfilePlaceholder, loginPlaceholder, registerPlaceholder };
