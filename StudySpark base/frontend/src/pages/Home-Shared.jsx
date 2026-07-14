/*
  Owner: Shared
  Feature: Base Homepage
  Status: Base placeholder only.
  Description: Main homepage hub for StudySpark feature navigation.
*/

import { Link } from 'react-router-dom';
import { getStoredToken, getStoredUser } from '../services/authService-Izzul.js';

const studyActions = [
  {
    title: 'Start Your Study Plan',
    link: '/planner',
    description: 'Map out what to study, when to study it, and what needs attention first.',
    tag: 'Plan',
    accent: 'blue'
  },
  {
    title: 'Check Your Progress',
    link: '/dashboard',
    description: 'See your study streak, completed work, and progress at a glance.',
    tag: 'Track',
    accent: 'green'
  },
  {
    title: 'Practice From Notes',
    link: '/ai-quiz',
    description: 'Paste study notes and turn them into quick revision questions.',
    tag: 'Quiz',
    accent: 'gold'
  },
  {
    title: 'Stay On Schedule',
    link: '/notifications',
    description: 'Keep study and revision reminders in one place so nothing slips.',
    tag: 'Remind',
    accent: 'red'
  },
  {
    title: 'Personalize Your Space',
    link: '/profile',
    description: 'Manage your account, profile avatar, and StudySpark identity.',
    tag: 'Profile',
    accent: 'purple'
  }
];

function HomeShared() {
  const isLoggedIn = Boolean(getStoredToken() && getStoredUser());

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-intro">
          <p className="home-kicker">Adaptive Study Planner</p>
          <h1>StudySpark</h1>
          <p className="home-description">
            StudySpark helps students plan study sessions, track progress, and revise smarter using
            adaptive recommendations.
          </p>
          <div className="home-actions">
            {isLoggedIn ? (
              <>
                <Link className="primary-action" to="/dashboard">
                  Open dashboard
                </Link>
                <Link className="secondary-action" to="/ai-quiz">
                  Try AI quiz
                </Link>
              </>
            ) : (
              <>
                <Link className="primary-action" to="/register">
                  Create account
                </Link>
                <Link className="secondary-action" to="/login">
                  Login
                </Link>
              </>
            )}
          </div>
          {!isLoggedIn && (
            <p className="home-auth-note">
              Login or create an account to save your profile and start tracking study progress.
            </p>
          )}
        </div>

        <div className="study-console" aria-label="StudySpark workspace preview">
          <div className="console-header">
            <span>Today</span>
            <strong>Network Revision</strong>
          </div>
          <div className="console-focus-card">
            <span className="console-dot" />
            <div>
              <p>Current focus</p>
              <strong>VLANs, trunk ports, and tagging</strong>
            </div>
          </div>
          <div className="console-metrics">
            <div>
              <span>Streak</span>
              <strong>7 days</strong>
            </div>
            <div>
              <span>Quiz target</span>
              <strong>5 questions</strong>
            </div>
            <div>
              <span>Next review</span>
              <strong>8 PM</strong>
            </div>
          </div>
          <div className="console-timeline">
            <span style={{ width: '36%' }} />
            <span style={{ width: '62%' }} />
            <span style={{ width: '48%' }} />
          </div>
        </div>
      </section>

      <section className="home-section-heading">
        <p>Study workspace</p>
        <h2>Everything you need to plan, revise, and stay consistent.</h2>
      </section>

      <section className="feature-grid" aria-label="StudySpark study actions">
        {studyActions.map((action) => (
          <Link
            className={`feature-card feature-card-${action.accent}`}
            key={action.title}
            to={action.link}
          >
            <div className="feature-card-topline">
              <span>{action.tag}</span>
            </div>
            <h3>{action.title}</h3>
            <p>{action.description}</p>
            <span className="feature-link">Open</span>
          </Link>
        ))}
      </section>

      <section className="home-focus-strip">
        <div>
          <span>Plan</span>
          <strong>Schedule focused study sessions</strong>
        </div>
        <div>
          <span>Track</span>
          <strong>See progress and revision gaps</strong>
        </div>
        <div>
          <span>Revise</span>
          <strong>Turn notes into quiz practice</strong>
        </div>
      </section>
    </div>
  );
}

export default HomeShared;
