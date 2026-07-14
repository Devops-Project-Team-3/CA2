/*
  Owner: Zachary
  Feature: Adaptive Dashboard
  Status: API-backed dashboard.
  Description: Renders real dashboard data returned by the backend.
*/

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardPlaceholder } from '../services/dashboardService-Zachary.js';

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
          <p>Based on completed study activity in your account.</p>
        </article>
        <article className="dashboard-card">
          <span className="dashboard-card-label">Completed Topics</span>
          <strong>{metrics.completedTopics} / {metrics.totalTopics}</strong>
          <div className="dashboard-progress-bar">
            <span style={{ width: `${metrics.progressPercent}%` }} />
          </div>
        </article>
        <article className="dashboard-card">
          <span className="dashboard-card-label">Next Focus</span>
          <strong>{nextAction?.title || nextFocus?.name || 'Create a study session'}</strong>
          <p>{nextAction?.description || nextFocus?.revisionLabel || 'Add a topic, then use AI Quiz to test your understanding.'}</p>
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
            <p className="dashboard-empty">No quiz results found yet.</p>
          ) : (
            <div className="revision-list">
              {recommendations.map((topic) => (
                <div
                  className={`revision-item ${topic.isUrgent ? 'revision-urgent' : 'revision-steady'}`}
                  key={topic.id}
                >
                  <div>
                    <strong>{topic.name}</strong>
                    <p>{topic.subject} - Last score: {topic.quizScore}%</p>
                  </div>
                  <div className="revision-date">
                    <span>{topic.revisionLabel}</span>
                    <strong>{formatDate(topic.revisionDate, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
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
            <p className="dashboard-empty">No study sessions found yet.</p>
          ) : (
            <div className="session-table">
              {sessions.map((session) => (
                <div className="session-row" key={session.id}>
                  <span>{formatDate(session.date)}</span>
                  <strong>{session.subject || 'General'}</strong>
                  <p>{session.topic || 'Untitled study session'}</p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="dashboard-panel">
          <p className="dashboard-kicker">Mastery</p>
          <h2>Target domain progress</h2>
          {mastery.length === 0 ? (
            <p className="dashboard-empty">No completed topics found yet.</p>
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
