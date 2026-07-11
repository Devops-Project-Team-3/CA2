/*
  Owner: Izzul
  Feature: User Authentication
  Status: MySQL-backed auth integration.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  registerUser
} from '../services/authService-Izzul.js';

function RegisterIzzul() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await registerUser(formData);
      setMessageType('success');
      setMessage(response.message || 'Account created successfully.');
      navigate('/profile');
    } catch (error) {
      setMessageType('error');
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const messageStyles = {
    background: messageType === 'error' ? '#fef2f2' : '#ecfdf5',
    border: `1px solid ${messageType === 'error' ? '#fecaca' : '#bbf7d0'}`,
    borderRadius: '8px',
    color: messageType === 'error' ? '#b91c1c' : '#047857',
    margin: 0,
    padding: '12px'
  };

  function handleLogout() {
    clearSession();
    window.dispatchEvent(new Event('studyspark-profile-updated'));
    setCurrentUser(null);
  }

  if (getStoredToken() && currentUser) {
    return (
      <section
        className="placeholder-panel"
        style={{
          display: 'grid',
          gap: '24px',
          margin: '0 auto',
          maxWidth: '560px',
          padding: '36px',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'grid', gap: '8px' }}>
          <p style={{ color: '#2563eb', fontWeight: 800, margin: 0 }}>StudySpark</p>
          <h1 style={{ margin: 0 }}>Account already active</h1>
          <p style={{ color: '#5f6b7a', margin: 0 }}>
            You are signed in as {currentUser.name}. Logout first if you want to create a different
            account.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          <Link
            to="/profile"
            style={{
              background: '#2563eb',
              borderRadius: '8px',
              color: '#ffffff',
              fontWeight: 800,
              padding: '12px 18px',
              textDecoration: 'none'
            }}
          >
            Go to profile
          </Link>
          <button
            onClick={handleLogout}
            style={{
              background: '#111827',
              border: 0,
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              font: 'inherit',
              fontWeight: 800,
              padding: '12px 18px'
            }}
            type="button"
          >
            Logout
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="placeholder-panel"
      style={{
        display: 'grid',
        gap: '28px',
        margin: '0 auto',
        maxWidth: '560px',
        padding: '36px'
      }}
    >
      <div style={{ display: 'grid', gap: '8px', textAlign: 'center' }}>
        <p style={{ color: '#2563eb', fontWeight: 800, margin: 0 }}>StudySpark</p>
        <h1 style={{ margin: 0 }}>Create your account</h1>
        <p style={{ color: '#5f6b7a', margin: 0 }}>
          Join StudySpark to organize study sessions and prepare smarter.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
        <label style={{ display: 'grid', gap: '6px', fontWeight: 700 }}>
          Full name
          <input
            autoComplete="name"
            name="name"
            onChange={updateField}
            placeholder="Your name"
            required
            style={{
              background: '#ffffff',
              border: '1px solid #dbe3ef',
              borderRadius: '8px',
              color: '#111827',
              font: 'inherit',
              padding: '12px'
            }}
            value={formData.name}
          />
        </label>

        <label style={{ display: 'grid', gap: '6px', fontWeight: 700 }}>
          Email address
          <input
            autoComplete="email"
            name="email"
            onChange={updateField}
            placeholder="student@example.com"
            required
            style={{
              background: '#ffffff',
              border: '1px solid #dbe3ef',
              borderRadius: '8px',
              color: '#111827',
              font: 'inherit',
              padding: '12px'
            }}
            type="email"
            value={formData.email}
          />
        </label>

        <label style={{ display: 'grid', gap: '6px', fontWeight: 700 }}>
          Password
          <input
            autoComplete="new-password"
            minLength="6"
            name="password"
            onChange={updateField}
            placeholder="At least 6 characters"
            required
            type="password"
            style={{
              background: '#ffffff',
              border: '1px solid #dbe3ef',
              borderRadius: '8px',
              color: '#111827',
              font: 'inherit',
              padding: '12px'
            }}
            value={formData.password}
          />
        </label>

        <button
          disabled={isLoading}
          style={{
            background: isLoading ? '#93c5fd' : '#2563eb',
            border: 0,
            borderRadius: '8px',
            color: '#ffffff',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            font: 'inherit',
            fontWeight: 800,
            padding: '12px 18px'
          }}
          type="submit"
        >
          {isLoading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      {message && <p style={messageStyles}>{message}</p>}

      <p style={{ color: '#5f6b7a', margin: 0, textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </section>
  );
}

export default RegisterIzzul;
