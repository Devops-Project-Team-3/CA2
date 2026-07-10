/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Implemented
  Description: In-memory notifications service for study reminders and alerts.
*/

const notifications = [
  {
    id: 1,
    category: 'Study Reminder',
    title: 'Finish English reading session',
    message: 'Review Chapter 4 and complete the reading notes before tomorrow.',
    scheduled: 'Today at 5:00 PM',
    scheduledAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    isDue: false
  },
  {
    id: 2,
    category: 'Revision Reminder',
    title: 'Revise math formulas',
    message: 'Spend 30 minutes revising last week’s formula sheet for algebra and geometry.',
    scheduled: 'Tomorrow at 9:00 AM',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isDue: false
  },
  {
    id: 3,
    category: 'AI Quiz Reminder',
    title: 'Try a quick AI quiz',
    message: 'Test your knowledge with a short AI-generated quiz after your study session.',
    scheduled: 'Today at 7:30 PM',
    scheduledAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    isDue: false
  }
];

function getNotifications() {
  return notifications;
}

function createNotification(notification) {
  const scheduledAt = notification.scheduledAt
    ? new Date(notification.scheduledAt).toISOString()
    : new Date().toISOString();

  const newNotification = {
    id: Date.now(),
    category: notification.category || 'Study Reminder',
    title: notification.title,
    message: notification.message,
    scheduled: notification.scheduled || scheduledAt,
    scheduledAt,
    isDue: false
  };

  notifications.unshift(newNotification);
  return newNotification;
}

function processScheduledNotifications() {
  const now = Date.now();
  const dueNotifications = notifications.filter((notification) => {
    return (
      !notification.isDue &&
      notification.scheduledAt &&
      Date.parse(notification.scheduledAt) <= now
    );
  });

  dueNotifications.forEach((notification) => {
    notification.isDue = true;
  });

  return dueNotifications;
}

export { createNotification, getNotifications, processScheduledNotifications };
