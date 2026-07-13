/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Implemented
  Description: Displays study reminders, revision reminders, and AI quiz reminders.
*/

import { useEffect, useState } from 'react';
import { createNotification, getNotifications } from '../services/notificationService-RuiFeng.js';

function NotificationsRuiFeng() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [popup, setPopup] = useState(null);
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

        const dueNotification = loadedNotifications.find((notification) => notification.isDue);
        if (dueNotification) {
          setPopup({
            title: 'Reminder due',
            message: `${dueNotification.title} is due now.`
          });
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
  }, []);

  useEffect(() => {
    if (!popup) return undefined;

    const timer = window.setTimeout(() => {
      setPopup(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [popup]);

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!formState.title || !formState.message) {
      setError('Please provide both a title and a message.');
      return;
    }

    createNotification(formState)
      .then((response) => {
        const created = response.data.notification;
        setNotifications((prev) => [{ ...created, isDue: false }, ...prev]);
        setSuccess('New notification added successfully.');
        setPopup({
          title: 'Reminder added',
          message: `${created.title} has been saved.`
        });
        setFormState({
          category: 'Study Reminder',
          title: '',
          message: '',
          scheduledAt: ''
        });
      })
      .catch(() => {
        setError('Unable to create notification. Please try again later.');
      });
  }

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
          <p>{notifications.length} notification{notifications.length === 1 ? '' : 's'} ready.</p>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <div className="notification-grid">
        {notifications.map((notification) => (
          <article className="notification-card" key={notification.id}>
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

        <label>
          Title
          <input
            name="title"
            type="text"
            value={formState.title}
            onChange={handleInputChange}
            placeholder="Enter reminder title"
          />
        </label>

        <label>
          Message
          <textarea
            name="message"
            value={formState.message}
            onChange={handleInputChange}
            placeholder="Enter reminder message"
          />
        </label>

        <label>
          Scheduled time
          <input
            name="scheduledAt"
            type="datetime-local"
            value={formState.scheduledAt}
            onChange={handleInputChange}
          />
        </label>

        <button type="submit">Add reminder</button>
      </form>
    </section>
  );
}

export default NotificationsRuiFeng;
