/*
  Owner: Izzul
  Feature: User Authentication
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import { useEffect, useState } from 'react';
import { getProfilePlaceholder } from '../services/authService-Izzul.js';

function ProfileIzzul() {
  const [message, setMessage] = useState('Loading profile placeholder...');

  useEffect(() => {
    getProfilePlaceholder()
      .then((response) => setMessage(response.message))
      .catch(() => setMessage('Profile placeholder API is not available yet.'));
  }, []);

  return (
    <section className="placeholder-panel">
      <h1>Profile</h1>
      <p>{message}</p>
    </section>
  );
}

export default ProfileIzzul;
