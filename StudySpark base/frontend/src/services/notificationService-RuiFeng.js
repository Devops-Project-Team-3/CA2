/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Implemented
  Description: Fetch and create study notifications from the backend or a local fallback store.
*/

import { apiRequest } from './api.js';
import { getStoredToken, getStoredUser } from './authService-Izzul.js';

const STORAGE_KEY = 'studyspark-notifications';

function getStorageKey() {
  const user = getStoredUser();
  return user?.id ? `${STORAGE_KEY}-${user.id}` : null;
}

function createLocalId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeNotification(notification, fallbackId = createLocalId()) {
  const scheduledAt = notification?.scheduledAt || notification?.scheduled || null;
  const parsedScheduledAt = scheduledAt ? new Date(scheduledAt) : null;
  const isAcknowledged = Boolean(notification?.isAcknowledged || notification?.isRead);

  return {
    id: notification?.id || fallbackId,
    category: notification?.category || 'Study Reminder',
    title: notification?.title || '',
    message: notification?.message || '',
    scheduled: scheduledAt ? parsedScheduledAt.toLocaleString() : null,
    scheduledAt: scheduledAt ? parsedScheduledAt.toISOString() : null,
    isAcknowledged,
    isDue: Boolean(parsedScheduledAt && parsedScheduledAt <= new Date() && !isAcknowledged),
    createdAt: notification?.createdAt || new Date().toISOString()
  };
}

function readStoredNotifications() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storageKey = getStorageKey();

    if (!storageKey) {
      return [];
    }

    const rawValue = window.localStorage.getItem(storageKey);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue.map((item) => normalizeNotification(item)) : [];
  } catch {
    return [];
  }
}

function writeStoredNotifications(notifications) {
  if (typeof window === 'undefined') {
    return;
  }

  const storageKey = getStorageKey();

  if (!storageKey) {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(notifications));
}

async function getNotifications() {
  if (!getStoredToken()) {
    return { data: { notifications: [] } };
  }

  try {
    const response = await apiRequest('/api/notifications');
    const notifications = Array.isArray(response?.data?.notifications)
      ? response.data.notifications.map((item) => normalizeNotification(item))
      : [];

    writeStoredNotifications(notifications);
    return { data: { notifications } };
  } catch (error) {
    if (error.message === 'Login is required to access notifications.') {
      throw error;
    }

    const storedNotifications = readStoredNotifications();
    return { data: { notifications: storedNotifications } };
  }
}


async function clearAcknowledgedNotifications() {
  if (!getStoredToken()) {
    throw new Error('Please login to clear reminders.');
  }

  const response = await apiRequest('/api/notifications/acknowledged', {
    method: 'DELETE'
  });

  const storedNotifications = readStoredNotifications();
  writeStoredNotifications(storedNotifications.filter((notification) => !notification.isAcknowledged));

  return response;
}
async function createNotification(notification) {
  if (!getStoredToken()) {
    throw new Error('Please login to create reminders.');
  }

  try {
    const response = await apiRequest('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notification)
    });

    const createdNotification = response?.data?.notification
      ? normalizeNotification(response.data.notification)
      : null;

    if (createdNotification) {
      const storedNotifications = readStoredNotifications();
      const nextNotifications = [createdNotification, ...storedNotifications.filter((item) => item.id !== createdNotification.id)];
      writeStoredNotifications(nextNotifications);
    }

    return response;
  } catch (error) {
    throw error;
  }
}

async function acknowledgeNotification(notificationId) {
  if (!getStoredToken()) {
    throw new Error('Please login to acknowledge reminders.');
  }

  try {
    const response = await apiRequest(`/api/notifications/${notificationId}/acknowledge`, {
      method: 'PATCH'
    });

    const storedNotifications = readStoredNotifications();
    writeStoredNotifications(
      storedNotifications.map((notification) =>
        String(notification.id) === String(notificationId)
          ? { ...notification, isAcknowledged: true, isDue: false }
          : notification
      )
    );

    return response;
  } catch {
    const storedNotifications = readStoredNotifications();
    writeStoredNotifications(
      storedNotifications.map((notification) =>
        String(notification.id) === String(notificationId)
          ? { ...notification, isAcknowledged: true, isDue: false }
          : notification
      )
    );

    return {
      data: {
        acknowledged: true,
        id: notificationId
      }
    };
  }
}

export { acknowledgeNotification, clearAcknowledgedNotifications, createNotification, getNotifications };
