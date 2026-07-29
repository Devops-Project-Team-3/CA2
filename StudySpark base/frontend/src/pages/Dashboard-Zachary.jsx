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
  const [focusIndex, setFocusIndex] = useState(0);

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

    const interval = window.setInterval(refreshWhenVisible, 60000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  useEffect(() => {
    const focusCandidates = dashboard?.focusCandidates || [];

    if (focusCandidates.length <= 1) {
      return undefined;
    }

    const rotateFocusCard = window.setInterval(() => {
      setFocusIndex((currentIndex) => (currentIndex + 1) % focusCandidates.length);
    }, 20000);

    return () => window.clearInterval(rotateFocusCard);
  }, [dashboard?.focusCandidates?.length]);

  const metrics = dashboard?.metrics || {
    completedTopics: 0,
    totalTopics: 0,
    progressPercent: 0,
    studyStreak: 0,
    streakPet: {
      health: 0,
      status: 'No study activity yet',
      mood: 'Resting',
      lastStudyDate: null,
      studiedToday: false,
      todayActivityCount: 0,
      message: 'Complete a study session or AI quiz today to wake your streak pet.'
    }
  };
  const sessions = dashboard?.sessions || [];
  const recommendations = dashboard?.recommendations || [];
  const mastery = dashboard?.mastery || [];
  const focusCandidates = dashboard?.focusCandidates || [];
  const currentFocus = focusCandidates.length > 0 ? focusCandidates[focusIndex % focusCandidates.length] : null;
  const nextAction = currentFocus || dashboard?.nextAction || null;
  const displayName = dashboard?.user?.name || 'Student';
  const streakPet = metrics.streakPet || {
    health: 0,
    status: 'No study activity yet',
    mood: 'Resting',
    lastStudyDate: null,
    studiedToday: false,
    message: 'Complete a study session or AI quiz today to wake your streak pet.'
  };
  const petHealth = Math.max(0, Math.min(100, Number(streakPet.health || 0)));
  const petMoodClass = petHealth === 0 ? 'is-empty' : petHealth < 70 ? 'is-risk' : 'is-healthy';
  const hasTodaySessions = Number(metrics.totalTopics || 0) > 0;

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
          <div className={`dashboard-progress-ring ${hasTodaySessions ? '' : 'is-empty'}`} aria-label={hasTodaySessions ? `${metrics.progressPercent}% complete` : 'No sessions scheduled today'}>
            <strong>{hasTodaySessions ? `${metrics.progressPercent}%` : 'No Sessions'}</strong>
            <span>{hasTodaySessions ? 'Complete' : 'Today'}</span>
          </div>
        </div>
      </header>

      <section className="dashboard-metrics" aria-label="Dashboard metrics">
        <article className="dashboard-card streak-pet-card">
          <div className="streak-pet-topline">
            <span className="dashboard-card-label">Study Streak</span>
            <span className={`streak-pet-status ${petMoodClass}`}>{streakPet.status}</span>
          </div>
          <div className="streak-pet-body">
            <div className={`streak-pet-avatar ${petMoodClass}`} aria-hidden="true">
              <span className="streak-pet-eye" />
              <span className="streak-pet-eye" />
              <span className="streak-pet-mouth" />
            </div>
            <div>
              <strong>{metrics.studyStreak} days</strong>
              <p>{streakPet.message}</p>
            </div>
          </div>
          <div className="streak-health" aria-label={`Streak pet health ${petHealth}%`}>
            <span style={{ width: `${petHealth}%` }} />
          </div>
          <small>
            Today activity: {streakPet.todayActivityCount || 0} - Last studied: {streakPet.lastStudyDate ? formatDateOnly(streakPet.lastStudyDate, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Not yet'}
          </small>
        </article>
        <article className="dashboard-card">
          <span className="dashboard-card-label">Today Sessions</span>
          <strong>{hasTodaySessions ? `${metrics.completedTopics} / ${metrics.totalTopics}` : 'No sessions scheduled today'}</strong>
          {hasTodaySessions ? (
            <div className="dashboard-progress-bar">
              <span style={{ width: `${metrics.progressPercent}%` }} />
            </div>
          ) : (
            <p>Schedule a study session for today to start tracking daily progress.</p>
          )}
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
