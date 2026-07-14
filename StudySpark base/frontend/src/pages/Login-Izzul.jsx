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
  loginUser
} from '../services/authService-Izzul.js';

function LoginIzzul() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [formData, setFormData] = useState({
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
      const response = await loginUser(formData);
      setMessageType('success');
      setMessage(response.message || 'Login successful.');
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
          maxWidth: '520px',
          padding: '36px',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'grid', gap: '8px' }}>
          <p style={{ color: '#2563eb', fontWeight: 800, margin: 0 }}>StudySpark</p>
          <h1 style={{ margin: 0 }}>You are already logged in</h1>
          <p style={{ color: '#5f6b7a', margin: 0 }}>
            Signed in as {currentUser.name}. Continue to your profile or logout to use another
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
        maxWidth: '520px',
        padding: '36px'
      }}
    >
      <div style={{ display: 'grid', gap: '8px', textAlign: 'center' }}>
        <p style={{ color: '#2563eb', fontWeight: 800, margin: 0 }}>StudySpark</p>
        <h1 style={{ margin: 0 }}>Welcome back</h1>
        <p style={{ color: '#5f6b7a', margin: 0 }}>
          Sign in to continue planning, revising, and tracking your study progress.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
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
            autoComplete="current-password"
            name="password"
            onChange={updateField}
            placeholder="Password"
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
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {message && <p style={messageStyles}>{message}</p>}

      <p style={{ color: '#5f6b7a', margin: 0, textAlign: 'center' }}>
        New to StudySpark? <Link to="/register">Create an account</Link>
      </p>
    </section>
  );
}

export default LoginIzzul;
