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

  if (!response.ok) {
    throw new Error(`Placeholder API request failed: ${response.status}`);
  }

  return response.json();
}

export { API_BASE_URL, apiRequest };
