/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Rui Feng's Notifications feature.
*/

import { apiRequest } from './api.js';

function getNotificationsPlaceholder() {
  return apiRequest('/api/notifications');
}

function createNotificationPlaceholder() {
  return apiRequest('/api/notifications', { method: 'POST' });
}

export { createNotificationPlaceholder, getNotificationsPlaceholder };
