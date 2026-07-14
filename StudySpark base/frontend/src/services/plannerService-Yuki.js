/*
  Owner: Yuki
  Feature: Study Planner CRUD
  Status: Implemented for Phase 1.
  Description: Frontend planner service for create/read/update/delete study sessions.
*/

import { apiRequest } from './api.js';

function getPlannerItems() {
  return apiRequest('/api/planner');
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
