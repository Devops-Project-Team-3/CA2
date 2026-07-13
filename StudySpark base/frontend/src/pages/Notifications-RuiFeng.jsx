/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Implemented
  Description: Displays study reminders, revision reminders, and AI quiz reminders.
*/

import { useEffect, useState } from 'react';
import { createNotification, getNotifications } from '../services/notificationService-RuiFeng.js';

function getStoredPopupIds() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.sessionStorage.getItem('shown-notification-popups');
    return rawValue ? JSON.parse(rawValue) : [];
  } catch {
    return [];
  }
}

function saveStoredPopupIds(ids) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem('shown-notification-popups', JSON.stringify(ids));
}

function NotificationsRuiFeng() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [popup, setPopup] = useState(null);
  const [shownPopupIds, setShownPopupIds] = useState(() => getStoredPopupIds());
  const [validationErrors, setValidationErrors] = useState({});
  const [formState, setFormState] = useState({
    category: 'Study Reminder',
    title: '',
    message: '',
    scheduledAt: ''
  });

  useEffect(() => {
    let active = true;

    getNotifications()
      .then((response) => {
        if (!active) return;

        const loadedNotifications = (response.data.notifications || []).map((notification) => ({
          ...notification,
          isDue: Boolean(
            notification.scheduledAt && new Date(notification.scheduledAt) <= new Date()
          )
        }));

        setNotifications(loadedNotifications);
        setLoading(false);

        const dueNotification = loadedNotifications.find(
          (notification) => notification.isDue && !shownPopupIds.includes(notification.id)
        );

        if (dueNotification) {
          setPopup({
            title: 'Reminder due',
            message: `${dueNotification.title} is due now.`
          });
          const updatedIds = [...shownPopupIds, dueNotification.id];
          setShownPopupIds(updatedIds);
          saveStoredPopupIds(updatedIds);
        }
      })
      .catch(() => {
        if (!active) return;
        setError('Notifications API is not available yet.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [shownPopupIds]);

  useEffect(() => {
    if (!popup) return undefined;

    const timer = window.setTimeout(() => {
      setPopup(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [popup]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNotifications((prev) => {
        const now = new Date();
        const newlyDue = prev.filter((notification) => {
          const scheduledAt = notification.scheduledAt ? new Date(notification.scheduledAt) : null;
          return Boolean(scheduledAt && !notification.isDue && scheduledAt <= now && !shownPopupIds.includes(notification.id));
        });

        if (newlyDue.length > 0) {
          const nextReminder = newlyDue[0];
          setPopup({
            title: 'Reminder due',
            message: `${nextReminder.title} is due now.`
          });
          const updatedIds = [...shownPopupIds, nextReminder.id];
          setShownPopupIds(updatedIds);
          saveStoredPopupIds(updatedIds);
        }

        return prev.map((notification) => {
          const scheduledAt = notification.scheduledAt ? new Date(notification.scheduledAt) : null;
          if (scheduledAt && !notification.isDue && scheduledAt <= now) {
            return { ...notification, isDue: true };
          }
          return notification;
        });
      });
    }, 30000);

    return () => window.clearInterval(interval);
  }, [shownPopupIds]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const title = (formState.title || '').trim();
    const message = (formState.message || '').trim();
    const scheduledAt = (formState.scheduledAt || '').trim();
    const nextErrors = {};

    if (!title) {
      nextErrors.title = 'Please enter a reminder title.';
    }

    if (!message) {
      nextErrors.message = 'Please enter a reminder message.';
    }

    if (!scheduledAt) {
      nextErrors.scheduledAt = 'Please choose a date and time.';
    } else {
      const parsedTime = new Date(scheduledAt);
      if (Number.isNaN(parsedTime.getTime())) {
        nextErrors.scheduledAt = 'Please enter a valid date and time.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setValidationErrors(nextErrors);
      return;
    }

    setValidationErrors({});

    createNotification({
      ...formState,
      title,
      message,
      scheduledAt
    })
      .then((response) => {
        const created = response.data.notification;
        setNotifications((prev) => [{ ...created, isDue: false }, ...prev]);
        setSuccess('New notification added successfully.');
        setPopup({
          title: 'Reminder added',
          message: `${title} has been saved.`
        });
        setFormState({
          category: 'Study Reminder',
          title: '',
          message: '',
          scheduledAt: ''
        });
      })
      .catch((error) => {
        setError(error.message || 'Unable to create notification. Please try again later.');
      });
  }

  const upcomingNotifications = notifications.filter((notification) => !notification.isDue);
  const recentNotifications = notifications.filter((notification) => notification.isDue);

  return (
    <section className="placeholder-panel">
      {popup && (
        <div className="popup-overlay" role="status" aria-live="polite">
          <div className="popup-card">
            <h3>{popup.title}</h3>
            <p>{popup.message}</p>
          </div>
        </div>
      )}

      <h1>Notifications</h1>
      <p>Stay on track with study reminders, revision nudges, and AI quiz alerts.</p>

      <div className="notification-summary">
        {loading && <p>Loading notifications…</p>}
        {!loading && !notifications.length && <p>No notifications available yet.</p>}
        {!loading && notifications.length > 0 && (
          <p>{upcomingNotifications.length} upcoming reminder{upcomingNotifications.length === 1 ? '' : 's'} • {recentNotifications.length} recent reminder{recentNotifications.length === 1 ? '' : 's'}</p>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <div className="notification-section">
        <h2 className="notification-section-title">Upcoming reminders</h2>
        {upcomingNotifications.length === 0 ? (
          <p className="notification-empty">You are all caught up.</p>
        ) : (
          <div className="notification-grid">
            {upcomingNotifications.map((notification) => (
              <article className="notification-card" key={notification.id}>
                <span className="notification-category">{notification.category}</span>
                <h2>{notification.title}</h2>
                <p>{notification.message}</p>
                {notification.scheduled && (
                  <p className="notification-scheduled">Scheduled: {notification.scheduled}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {recentNotifications.length > 0 && (
        <div className="notification-section">
          <h2 className="notification-section-title">Recent reminders</h2>
          <div className="notification-grid">
            {recentNotifications.map((notification) => (
              <article className="notification-card notification-card--recent" key={notification.id}>
                <span className="notification-category">{notification.category}</span>
                <h2>{notification.title}</h2>
                <p>{notification.message}</p>
                {notification.scheduled && (
                  <p className="notification-scheduled">Scheduled: {notification.scheduled}</p>
                )}
                {notification.isDue && (
                  <p className="notification-due">Due now</p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      <form className="notification-form" onSubmit={handleSubmit}>
        <h2>Schedule a reminder</h2>

        <label>
          Category
          <select name="category" value={formState.category} onChange={handleInputChange}>
            <option>Study Reminder</option>
            <option>Revision Reminder</option>
            <option>AI Quiz Reminder</option>
          </select>
        </label>

        <label className="form-field">
          <span>Title</span>
          <input
            name="title"
            type="text"
            value={formState.title}
            onChange={handleInputChange}
            placeholder="Enter reminder title"
            className={validationErrors.title ? 'input-error' : ''}
          />
          {validationErrors.title && <span className="field-error">{validationErrors.title}</span>}
        </label>

        <label className="form-field">
          <span>Message</span>
          <textarea
            name="message"
            value={formState.message}
            onChange={handleInputChange}
            placeholder="Enter reminder message"
            className={validationErrors.message ? 'input-error' : ''}
          />
          {validationErrors.message && <span className="field-error">{validationErrors.message}</span>}
        </label>

        <label className="form-field">
          <span>Scheduled time</span>
          <input
            name="scheduledAt"
            type="datetime-local"
            value={formState.scheduledAt}
            onChange={handleInputChange}
            className={validationErrors.scheduledAt ? 'input-error' : ''}
          />
          {validationErrors.scheduledAt && <span className="field-error">{validationErrors.scheduledAt}</span>}
        </label>

        <button type="submit">Add reminder</button>
      </form>
    </section>
  );
}

export default NotificationsRuiFeng;
