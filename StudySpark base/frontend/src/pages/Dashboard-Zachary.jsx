/*
  Owner: Zachary
  Feature: Adaptive Dashboard
  Status: API-backed dashboard.
  Description: Renders real dashboard data returned by the backend.
*/

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardPlaceholder } from '../services/dashboardService-Zachary.js';

function formatDateOnly(dateValue, options = { month: 'short', day: 'numeric' }) {
  if (!dateValue) {
    return 'Not scheduled';
  }

  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [year, month, day] = dateValue.split('-').map(Number);
    return new Intl.DateTimeFormat('en-SG', options).format(new Date(year, month - 1, day));
  }

  return new Intl.DateTimeFormat('en-SG', options).format(new Date(dateValue));
}
function formatDate(dateValue, options = { month: 'short', day: 'numeric' }) {
  if (!dateValue) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-SG', options).format(new Date(dateValue));
}

function DashboardZachary() {
  const [dashboard, setDashboard] = useState(null);
  const [message, setMessage] = useState('Loading dashboard...');
  const [isLoading, setIsLoading] = useState(true);

  function loadDashboard({ showLoading = false } = {}) {
    if (showLoading) {
      setIsLoading(true);
    }

    getDashboardPlaceholder()
      .then((response) => {
        setDashboard(response.data);
        setMessage(response.message || 'Dashboard loaded successfully.');
      })
      .catch((error) => {
        setMessage(error.message || 'Dashboard data is not available yet.');
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadDashboard({ showLoading: true });

    function refreshWhenVisible() {
      if (!document.hidden) {
        loadDashboard();
      }
    }

    const interval = window.setInterval(refreshWhenVisible, 15000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  const metrics = dashboard?.metrics || {
    completedTopics: 0,
    totalTopics: 0,
    progressPercent: 0,
    studyStreak: 0
  };
  const sessions = dashboard?.sessions || [];
  const recommendations = dashboard?.recommendations || [];
  const mastery = dashboard?.mastery || [];
  const nextAction = dashboard?.nextAction || null;
  const displayName = dashboard?.user?.name || 'Student';

  const nextFocus = useMemo(() => {
    return recommendations[0] || null;
  }, [recommendations]);

  if (isLoading) {
    return (
      <section className="placeholder-panel">
        <h1>Dashboard</h1>
        <p>{message}</p>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <header className="dashboard-hero">
        <div>
          <p className="dashboard-kicker">Adaptive Dashboard</p>
          <h1>Welcome back, {displayName}</h1>
          <p>{message}</p>
        </div>
        <div className="dashboard-hero-actions">
          <button type="button" className="dashboard-refresh" onClick={() => loadDashboard({ showLoading: true })}>
            Refresh
          </button>
          <div className="dashboard-progress-ring" aria-label={`${metrics.progressPercent}% complete`}>
            <strong>{metrics.progressPercent}%</strong>
            <span>Complete</span>
          </div>
        </div>
      </header>

      <section className="dashboard-metrics" aria-label="Dashboard metrics">
        <article className="dashboard-card">
          <span className="dashboard-card-label">Study Streak</span>
          <strong>{metrics.studyStreak} days</strong>
          <p>Based on your recent completed study activity.</p>
        </article>
        <article className="dashboard-card">
          <span className="dashboard-card-label">Today Sessions</span>
          <strong>{metrics.completedTopics} / {metrics.totalTopics}</strong>
          <div className="dashboard-progress-bar">
            <span style={{ width: `${metrics.progressPercent}%` }} />
          </div>
        </article>
        <article className="dashboard-card">
          <span className="dashboard-card-label">Next Focus</span>
          <strong>{nextAction?.title || nextFocus?.name || 'Create a study session'}</strong>
          <p>{nextAction?.description || nextFocus?.revisionLabel || 'Complete a study session, then take a linked AI Quiz to unlock recommendations.'}</p>
          <Link className="dashboard-card-action" to={nextAction?.actionPath || '/planner'}>
            {nextAction?.actionLabel || 'Open Planner'}
          </Link>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel dashboard-panel-wide">
          <p className="dashboard-kicker">Revision Engine</p>
          <h2>Adaptive recommendations</h2>

          {recommendations.length === 0 ? (
            <p className="dashboard-empty">No linked quiz results yet. Complete a Study Planner session, then take an AI Quiz for that topic to get adaptive recommendations.</p>
          ) : (
            <div className="revision-list">
              {recommendations.map((topic) => (
                <div
                  className={`revision-item ${topic.isUrgent ? 'revision-urgent' : 'revision-steady'}`}
                  key={topic.id}
                >
                  <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
                    <span
                      aria-hidden="true"
                      style={{
                        alignItems: 'center',
                        background: '#e0f2fe',
                        border: '1px solid #7dd3fc',
                        borderRadius: '8px',
                        color: '#075985',
                        display: 'inline-flex',
                        flex: '0 0 34px',
                        fontSize: '18px',
                        height: '34px',
                        justifyContent: 'center',
                        width: '34px'
                      }}
                    >
                      {'\uD83D\uDCD8'}
                    </span>
                    <div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 800, margin: '0 0 3px', textTransform: 'uppercase' }}>
                        {topic.subject || 'General'}
                      </p>
                      <strong>{topic.name}</strong>
                      <p>Last score: {topic.quizScore}%</p>
                    </div>
                  </div>
                  <div className="revision-date">
                    <span>{topic.revisionLabel}</span>
                    <strong>{formatDateOnly(topic.revisionDate, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="dashboard-panel">
          <p className="dashboard-kicker">Planner</p>
          <h2>Upcoming study slots</h2>
          {sessions.length === 0 ? (
            <p className="dashboard-empty">No upcoming study sessions yet. Add one in Study Planner to start tracking progress.</p>
          ) : (
            <div className="session-table">
              {sessions.map((session) => (
                <div className="session-row" key={session.id}>
                  <span>{formatDate(session.date)}</span>
                  <strong>{session.subject || 'General'}</strong>
                  <p>{session.topic || session.title || 'Untitled study session'}</p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="dashboard-panel">
          <p className="dashboard-kicker">Mastery</p>
          <h2>Target domain progress</h2>
          {mastery.length === 0 ? (
            <p className="dashboard-empty">No completed topics yet. Mark planner sessions as completed to build your mastery view.</p>
          ) : (
            <div className="mastery-list">
              {mastery.map((item) => (
                <div key={item.subject}>
                  <span>{item.subject}</span>
                  <strong>{item.completedCount} topic(s)</strong>
                  <div className="dashboard-progress-bar">
                    <span style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </section>
  );
}

export default DashboardZachary;
