/*
  Owner: Shared
  Feature: Shared API Helper
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for shared frontend API setup.
*/

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const AUTH_TOKEN_KEY = 'studyspark_auth_token';

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Placeholder API request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export { API_BASE_URL, apiRequest };
