/*
  Owner: Izzul
  Feature: User Authentication
  Status: MySQL-backed auth integration.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import { API_BASE_URL } from './api.js';

const AUTH_TOKEN_KEY = 'studyspark_auth_token';
const AUTH_USER_KEY = 'studyspark_auth_user';
const AUTH_AVATAR_KEY = 'studyspark_profile_avatar';

async function authRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Authentication request failed.');
  }

  return data;
}

function saveSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getStoredUser() {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function getStoredAvatar() {
  return localStorage.getItem(AUTH_AVATAR_KEY) || 'spark';
}

function saveStoredAvatar(avatarId) {
  localStorage.setItem(AUTH_AVATAR_KEY, avatarId);
  window.dispatchEvent(new Event('studyspark-profile-updated'));
}

async function registerUser(formData) {
  const response = await authRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(formData)
  });

  if (response.token && response.user) {
    saveSession(response.token, response.user);
  }

  return response;
}

async function loginUser(credentials) {
  const response = await authRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });

  if (response.token && response.user) {
    saveSession(response.token, response.user);
  }

  return response;
}

function getProfile() {
  const token = getStoredToken();

  if (!token) {
    throw new Error('Please login to view your profile.');
  }

  return authRequest('/api/auth/profile', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export {
  clearSession,
  getProfile,
  getStoredAvatar,
  getStoredToken,
  getStoredUser,
  loginUser,
  registerUser,
  saveStoredAvatar
};
