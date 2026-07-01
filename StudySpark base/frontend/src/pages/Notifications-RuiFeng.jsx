/*
  Owner: Rui Feng
  Feature: Notifications
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Rui Feng's Notifications feature.
*/

import { useEffect, useState } from 'react';
import { getNotificationsPlaceholder } from '../services/notificationService-RuiFeng.js';

function NotificationsRuiFeng() {
  const [message, setMessage] = useState('Loading notifications placeholder...');

  useEffect(() => {
    getNotificationsPlaceholder()
      .then((response) => setMessage(response.message))
      .catch(() => setMessage('Notifications placeholder API is not available yet.'));
  }, []);

  return (
    <section className="placeholder-panel">
      <h1>Notifications</h1>
      <p>{message}</p>
    </section>
  );
}

export default NotificationsRuiFeng;
