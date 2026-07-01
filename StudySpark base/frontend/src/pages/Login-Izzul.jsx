/*
  Owner: Izzul
  Feature: User Authentication
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import { useEffect, useState } from 'react';
import { loginPlaceholder } from '../services/authService-Izzul.js';

function LoginIzzul() {
  const [message, setMessage] = useState('Loading login placeholder...');

  useEffect(() => {
    loginPlaceholder()
      .then((response) => setMessage(response.message))
      .catch(() => setMessage('Login placeholder API is not available yet.'));
  }, []);

  return (
    <section className="placeholder-panel">
      <h1>Login</h1>
      <p>{message}</p>
    </section>
  );
}

export default LoginIzzul;
