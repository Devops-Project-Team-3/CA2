/*
  Owner: Shared
  Feature: Shared API Helper
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for shared frontend API setup.
*/

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
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
