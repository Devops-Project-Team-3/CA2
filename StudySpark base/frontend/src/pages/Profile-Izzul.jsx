/*
  Owner: Izzul
  Feature: User Authentication
  Status: MySQL-backed auth integration.
  Description: This file is reserved for Izzul's User Authentication feature.
*/

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  clearSession,
  getProfile,
  getStoredAvatar,
  getStoredToken,
  getStoredUser,
  saveStoredAvatar
} from '../services/authService-Izzul.js';

const avatarOptions = [
  {
    id: 'blob',
    face: '^_^',
    name: 'Spark Blob',
    description: 'Calm planner energy',
    background: '#dbeafe',
    color: '#1d4ed8'
  },
  {
    id: 'sprout',
    face: 'o_o',
    name: 'Focus Sprout',
    description: 'Quiet study mode',
    background: '#dcfce7',
    color: '#166534'
  },
  {
    id: 'star',
    face: '*_*',
    name: 'Quiz Star',
    description: 'Revision champion',
    background: '#fef3c7',
    color: '#92400e'
  },
  {
    id: 'zap',
    face: '>_<',
    name: 'Deadline Dash',
    description: 'High focus burst',
    background: '#ede9fe',
    color: '#5b21b6'
  },
  {
    id: 'bookbug',
    face: '@_@',
    name: 'Book Buddy',
    description: 'Notes collector',
    background: '#fee2e2',
    color: '#991b1b'
  }
];

const loggedOutAvatar = {
  face: '-_-',
  background: '#e5e7eb',
  color: '#6b7280'
};

function ProfileIzzul() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [selectedAvatarId, setSelectedAvatarId] = useState(() => getStoredAvatar());
  const [message, setMessage] = useState('Loading profile...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getStoredToken()) {
      setMessage('Please login to view your StudySpark profile.');
      setIsLoading(false);
      return;
    }

    getProfile()
      .then((response) => {
        setUser(response.user);
        setMessage(response.message || 'Profile loaded successfully.');
      })
      .catch((error) => {
        clearSession();
        setUser(null);
        setMessage(error.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function handleLogout() {
    clearSession();
    window.dispatchEvent(new Event('studyspark-profile-updated'));
    navigate('/login');
  }

  function handleAvatarChange(avatarId) {
    setSelectedAvatarId(avatarId);
    saveStoredAvatar(avatarId);
  }

  const selectedAvatar =
    avatarOptions.find((avatar) => avatar.id === selectedAvatarId) || avatarOptions[0];
  const isLoggedIn = Boolean(getStoredToken() && user);
  const displayAvatar = isLoggedIn ? selectedAvatar : loggedOutAvatar;

  const formattedDate = user?.createdAt
    ? new Intl.DateTimeFormat('en-SG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(new Date(user.createdAt))
    : 'Not available';

  return (
    <section
      className="placeholder-panel"
      style={{
        display: 'grid',
        gap: '24px',
        margin: '0 auto',
        maxWidth: '720px',
        padding: '36px'
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: 'auto 1fr'
        }}
      >
        <div
          aria-label="Selected profile avatar"
          style={{
            alignItems: 'center',
            background: displayAvatar.background,
            borderRadius: '999px',
            color: displayAvatar.color,
            display: 'flex',
            fontSize: '1.7rem',
            fontWeight: 900,
            height: '92px',
            justifyContent: 'center',
            width: '92px'
          }}
        >
          {displayAvatar.face}
        </div>
        <div style={{ display: 'grid', gap: '8px' }}>
          <p style={{ color: '#2563eb', fontWeight: 800, margin: 0 }}>StudySpark Account</p>
          <h1 style={{ margin: 0 }}>{user?.name || 'Profile'}</h1>
          <p style={{ color: '#5f6b7a', margin: 0 }}>
            Manage your account details, login status, and profile look.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '14px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))'
        }}
      >
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 6px' }}>Name</p>
          <strong>{user?.name || 'Not logged in'}</strong>
        </div>
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 6px' }}>Email</p>
          <strong>{user?.email || 'Not available'}</strong>
        </div>
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 6px' }}>Account status</p>
          <strong>{user ? 'Logged in' : 'Login required'}</strong>
        </div>
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px' }}>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 6px' }}>Joined</p>
          <strong>{formattedDate}</strong>
        </div>
      </div>

      {user && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e5edf7',
            borderRadius: '8px',
            display: 'grid',
            gap: '16px',
            padding: '20px'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.15rem', margin: '0 0 6px' }}>Profile picture</h2>
            <p style={{ color: '#5f6b7a', margin: 0 }}>
              Choose a preset character avatar for your StudySpark account.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))'
            }}
          >
            {avatarOptions.map((avatar) => {
              const isSelected = avatar.id === selectedAvatarId;

              return (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarChange(avatar.id)}
                  style={{
                    alignItems: 'center',
                    background: isSelected ? '#ffffff' : '#f8fafc',
                    border: `2px solid ${isSelected ? '#2563eb' : '#dbe3ef'}`,
                    borderRadius: '8px',
                    color: '#1d2433',
                    cursor: 'pointer',
                    display: 'grid',
                    gap: '8px',
                    justifyItems: 'center',
                    padding: '14px'
                  }}
                  type="button"
                >
                  <span
                    style={{
                      alignItems: 'center',
                      background: avatar.background,
                      borderRadius: '999px',
                      color: avatar.color,
                      display: 'flex',
                      fontWeight: 900,
                      height: '48px',
                      justifyContent: 'center',
                      width: '48px'
                    }}
                  >
                    {avatar.face}
                  </span>
                  <span style={{ fontWeight: 800 }}>{avatar.name}</span>
                  <span style={{ color: '#6b7280', fontSize: '0.82rem' }}>
                    {avatar.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p
        style={{
          background: user ? '#ecfdf5' : '#fff7ed',
          border: `1px solid ${user ? '#bbf7d0' : '#fed7aa'}`,
          borderRadius: '8px',
          color: user ? '#047857' : '#c2410c',
          margin: 0,
          padding: '12px'
        }}
      >
        {isLoading ? 'Checking your login session...' : message}
      </p>

      {user ? (
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
      ) : (
        <Link
          to="/login"
          style={{
            background: '#2563eb',
            borderRadius: '8px',
            color: '#ffffff',
            display: 'inline-block',
            fontWeight: 800,
            justifySelf: 'start',
            padding: '12px 18px',
            textDecoration: 'none'
          }}
        >
          Go to login
        </Link>
      )}
    </section>
  );
}

export default ProfileIzzul;
