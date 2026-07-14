/*
  Owner: Yuki
  Feature: Study Planner CRUD
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Yuki's Study Planner CRUD feature.
*/

import { apiRequest } from './api.js';

function getPlannerPlaceholder() {
  return apiRequest('/api/planner');
}

function createPlannerPlaceholder() {
  return apiRequest('/api/planner', { method: 'POST' });
}

function updatePlannerPlaceholder(id = 'placeholder-id') {
  return apiRequest(`/api/planner/${id}`, { method: 'PUT' });
}

function deletePlannerPlaceholder(id = 'placeholder-id') {
  return apiRequest(`/api/planner/${id}`, { method: 'DELETE' });
}

export {
  createPlannerPlaceholder,
  deletePlannerPlaceholder,
  getPlannerPlaceholder,
  updatePlannerPlaceholder
};
