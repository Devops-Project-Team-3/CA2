/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Implemented
  Description: Displays study reminders, revision reminders, and AI quiz reminders.
*/

import { useEffect, useState } from 'react';
import {
  acknowledgeNotification,
  createNotification,
  getNotifications
} from '../services/notificationService-RuiFeng.js';

const categoryMeta = {
  'Study Reminder': { shortLabel: 'S', label: 'Study' },
  'Revision Reminder': { shortLabel: 'R', label: 'Revision' },
  'AI Quiz Reminder': { shortLabel: 'AI', label: 'AI Quiz' }
};

function getCategoryMeta(category) {
  return categoryMeta[category] || { shortLabel: 'N', label: category || 'Reminder' };
}

function formatNotificationTime(notification) {
  const rawTime = notification.scheduledAt || notification.createdAt;

  if (!rawTime) {
    return notification.scheduled || 'No time set';
  }

  return new Intl.DateTimeFormat('en-SG', {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short'
  }).format(new Date(rawTime));
}

function NotificationsRuiFeng() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
            notification.scheduledAt &&
              new Date(notification.scheduledAt) <= new Date() &&
              !notification.isAcknowledged
          )
        }));

        setNotifications(loadedNotifications);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError('Notifications API is not available yet.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = new Date();

      setNotifications((prev) =>
        prev.map((notification) => {
          const scheduledAt = notification.scheduledAt ? new Date(notification.scheduledAt) : null;
          if (scheduledAt && !notification.isAcknowledged && !notification.isDue && scheduledAt <= now) {
            return { ...notification, isDue: true };
          }
          return notification;
        })
      );
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

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
        const createdIsDue = Boolean(created.scheduledAt && new Date(created.scheduledAt) <= new Date());
        const nextCreated = { ...created, isDue: createdIsDue };
        setNotifications((prev) => [nextCreated, ...prev]);
        setSuccess('New notification added successfully.');
        setFormState({
          category: 'Study Reminder',
          title: '',
          message: '',
          scheduledAt: ''
        });
      })
      .catch((requestError) => {
        setError(requestError.message || 'Unable to create notification. Please try again later.');
      });
  }

  async function handleAcknowledge(notificationId) {
    setError('');
    setSuccess('');
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isAcknowledged: true, isDue: false }
          : notification
      )
    );

    try {
      await acknowledgeNotification(notificationId);
      setSuccess('Notification acknowledged.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to acknowledge notification.');
    }
  }

  const upcomingNotifications = notifications.filter(
    (notification) => !notification.isDue && !notification.isAcknowledged
  );
  const recentNotifications = notifications.filter((notification) => notification.isDue);
  const acknowledgedNotifications = notifications.filter((notification) => notification.isAcknowledged);

  return (
    <section className="notifications-page">
      <header className="notifications-header">
        <div>
          <p className="notification-kicker">Notifications</p>
          <h1>Study reminders</h1>
          <p>Stay on track with study reminders, revision nudges, and AI quiz alerts.</p>
        </div>
        <div className="notification-summary">
          {loading && <p>Loading notifications...</p>}
          {!loading && !notifications.length && <p>No notifications available yet.</p>}
          {!loading && notifications.length > 0 && (
            <>
              <span>
                <strong>{upcomingNotifications.length}</strong>
                Upcoming
              </span>
              <span>
                <strong>{recentNotifications.length}</strong>
                Due
              </span>
              <span>
                <strong>{acknowledgedNotifications.length}</strong>
                Acknowledged
              </span>
            </>
          )}
        </div>
      </header>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <div className="notifications-layout">
        <div className="notifications-main">
          <section className="notification-section">
            <h2 className="notification-section-title">Upcoming reminders</h2>
            {upcomingNotifications.length === 0 ? (
              <p className="notification-empty">You are all caught up.</p>
            ) : (
              <div className="notification-list">
                {upcomingNotifications.map((notification) => {
                  const meta = getCategoryMeta(notification.category);

                  return (
                    <article className="notification-card" key={notification.id}>
                      <span className="notification-icon" aria-hidden="true">
                        {meta.shortLabel}
                      </span>
                      <div className="notification-content">
                        <div className="notification-card-head">
                          <span className="notification-category">{meta.label}</span>
                          <time>{formatNotificationTime(notification)}</time>
                        </div>
                        <h3>{notification.title}</h3>
                        <p>{notification.message}</p>
                      </div>
                      <span className="notification-status">Scheduled</span>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {recentNotifications.length > 0 && (
            <section className="notification-section">
              <h2 className="notification-section-title">Recent reminders</h2>
              <div className="notification-list">
                {recentNotifications.map((notification) => {
                  const meta = getCategoryMeta(notification.category);

                  return (
                    <article className="notification-card notification-card--recent" key={notification.id}>
                      <span className="notification-icon notification-icon--due" aria-hidden="true">
                        {meta.shortLabel}
                      </span>
                      <div className="notification-content">
                        <div className="notification-card-head">
                          <span className="notification-category">{meta.label}</span>
                          <time>{formatNotificationTime(notification)}</time>
                        </div>
                        <h3>{notification.title}</h3>
                        <p>{notification.message}</p>
                      </div>
                      <button
                        className="notification-ack-button"
                        type="button"
                        onClick={() => handleAcknowledge(notification.id)}
                      >
                        Acknowledge
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {acknowledgedNotifications.length > 0 && (
            <section className="notification-section">
              <h2 className="notification-section-title">Acknowledged reminders</h2>
              <div className="notification-list">
                {acknowledgedNotifications.map((notification) => {
                  const meta = getCategoryMeta(notification.category);

                  return (
                    <article className="notification-card notification-card--recent" key={notification.id}>
                      <span className="notification-icon" aria-hidden="true">
                        {meta.shortLabel}
                      </span>
                      <div className="notification-content">
                        <div className="notification-card-head">
                          <span className="notification-category">{meta.label}</span>
                          <time>{formatNotificationTime(notification)}</time>
                        </div>
                        <h3>{notification.title}</h3>
                        <p>{notification.message}</p>
                      </div>
                      <span className="notification-status">Acknowledged</span>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <form className="notification-form" onSubmit={handleSubmit}>
          <h2>Schedule a reminder</h2>

          <label className="form-field">
            <span>Category</span>
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
      </div>
    </section>
  );
}

export default NotificationsRuiFeng;
