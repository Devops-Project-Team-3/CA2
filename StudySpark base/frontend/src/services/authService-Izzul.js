/*
  Owner: Izzul
  Feature: User Authentication
  Status: MySQL-backed auth integration.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import { API_BASE_URL } from './api.js';

const AUTH_TOKEN_KEY = 'studyspark_auth_token';
const AUTH_USER_KEY = 'studyspark_auth_user';
const VALID_AVATAR_IDS = new Set(['blob', 'sprout', 'star', 'zap', 'bookbug']);

async function authRequest(path, options = {}) {
  const { headers: optionHeaders = {}, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...optionHeaders
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Authentication request failed.');
  }

  return data;
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  const avatarId = VALID_AVATAR_IDS.has(user.avatarId) ? user.avatarId : 'blob';
  return { ...user, avatarId };
}

function saveSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizeUser(user)));
  window.dispatchEvent(new Event('studyspark-profile-updated'));
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
    const parsedUser = JSON.parse(storedUser);
    const normalizedUser = normalizeUser(parsedUser);

    if (normalizedUser && normalizedUser.avatarId !== parsedUser.avatarId) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizedUser));
    }

    return normalizedUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event('studyspark-profile-updated'));
}

function getStoredAvatar() {
  const avatarId = getStoredUser()?.avatarId;
  return VALID_AVATAR_IDS.has(avatarId) ? avatarId : 'blob';
}

async function saveStoredAvatar(avatarId) {
  const safeAvatarId = VALID_AVATAR_IDS.has(avatarId) ? avatarId : 'blob';
  const token = getStoredToken();

  if (!token) {
    throw new Error('Please login to update your profile avatar.');
  }

  const response = await authRequest('/api/auth/profile/avatar', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ avatarId: safeAvatarId })
  });

  if (response.user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizeUser(response.user)));
  }

  window.dispatchEvent(new Event('studyspark-profile-updated'));
  return response;
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
