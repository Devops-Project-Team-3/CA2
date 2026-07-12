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
  const [formState, setFormState] = useState({
    category: 'Study Reminder',
    title: '',
    message: '',
    scheduledAt: ''
  });

  useEffect(() => {
    getNotifications()
      .then((response) => {
        setNotifications(response.data.notifications || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Notifications API is not available yet.');
        setLoading(false);
      });
  }, []);

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
        setNotifications((prev) => [created, ...prev]);
        setSuccess('New notification added successfully.');
        setFormState({
          category: 'Study Reminder',
          title: '',
          message: '',
          scheduled: ''
        });
      })
      .catch(() => {
        setError('Unable to create notification. Please try again later.');
      });
  }

  return (
    <section className="placeholder-panel">
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
