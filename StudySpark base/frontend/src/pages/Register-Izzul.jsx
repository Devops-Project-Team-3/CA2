/*
  Owner: Izzul
  Feature: User Authentication
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import { useEffect, useState } from 'react';
import { registerPlaceholder } from '../services/authService-Izzul.js';

function RegisterIzzul() {
  const [message, setMessage] = useState('Loading register placeholder...');

  useEffect(() => {
    registerPlaceholder()
      .then((response) => setMessage(response.message))
      .catch(() => setMessage('Register placeholder API is not available yet.'));
  }, []);

  return (
    <section className="placeholder-panel">
      <h1>Register</h1>
      <p>{message}</p>
    </section>
  );
}

export default RegisterIzzul;
