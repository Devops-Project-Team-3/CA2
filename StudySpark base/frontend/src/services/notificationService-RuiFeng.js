/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Implemented
  Description: Fetch and create study notifications from the backend.
*/

import { apiRequest } from './api.js';

function getNotifications() {
  return apiRequest('/api/notifications');
}

function createNotification(notification) {
  return apiRequest('/api/notifications', {
    method: 'POST',
    body: JSON.stringify(notification)
  });
}

export { createNotification, getNotifications };
