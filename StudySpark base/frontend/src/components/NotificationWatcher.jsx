import { useEffect, useState } from 'react';
import { acknowledgeNotification, getNotifications } from '../services/notificationService-RuiFeng.js';
import { getStoredToken } from '../services/authService-Izzul.js';

function findDueNotification(notifications) {
  return notifications.find((notification) => {
    if (notification.isAcknowledged) {
      return false;
    }

    const scheduledAt = notification.scheduledAt ? new Date(notification.scheduledAt) : null;
    return scheduledAt && scheduledAt <= new Date();
  }) || null;
}

function NotificationWatcher() {
  const [dueNotification, setDueNotification] = useState(null);

  useEffect(() => {
    let active = true;

    async function checkDueNotifications() {
      if (!getStoredToken()) {
        setDueNotification(null);
        return;
      }

      try {
        const response = await getNotifications();
        if (!active) return;

        setDueNotification(findDueNotification(response.data.notifications || []));
      } catch {
        if (active) {
          setDueNotification(null);
        }
      }
    }

    checkDueNotifications();

    const interval = window.setInterval(checkDueNotifications, 30000);
    window.addEventListener('focus', checkDueNotifications);
    window.addEventListener('studyspark-profile-updated', checkDueNotifications);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', checkDueNotifications);
      window.removeEventListener('studyspark-profile-updated', checkDueNotifications);
    };
  }, []);

  async function handleAcknowledge() {
    const currentNotification = dueNotification;
    setDueNotification(null);

    if (!currentNotification) {
      return;
    }

    await acknowledgeNotification(currentNotification.id);
  }

  if (!dueNotification) {
    return null;
  }

  return (
    <div className="notification-popup" role="alert">
      <div>
        <span className="notification-category">{dueNotification.category}</span>
        <strong>{dueNotification.title}</strong>
        <p>{dueNotification.message}</p>
      </div>
      <button type="button" onClick={handleAcknowledge}>
        Acknowledge
      </button>
    </div>
  );
}

export default NotificationWatcher;
