/*
  Owner: Yuki
  Feature: Study Planner CRUD
  Status: Implemented for Phase 1.
  Description: Frontend planner service for create/read/update/delete study sessions.
*/

import { apiRequest } from './api.js';

function getPlannerItems(query = '') {
  const searchParams = new URLSearchParams();
  if (query.trim()) searchParams.set('q', query.trim());
  const search = searchParams.toString();
  return apiRequest(`/api/planner${search ? `?${search}` : ''}`);
}

function createPlannerItem(sessionData) {
  return apiRequest('/api/planner', {
    method: 'POST',
    body: JSON.stringify(sessionData)
  });
}

function updatePlannerItem(id, sessionData) {
  return apiRequest(`/api/planner/${id}`, {
    method: 'PUT',
    body: JSON.stringify(sessionData)
  });
}

function deletePlannerItem(id) {
  return apiRequest(`/api/planner/${id}`, {
    method: 'DELETE'
  });
}

export {
  createPlannerItem,
  deletePlannerItem,
  getPlannerItems,
  updatePlannerItem
};
