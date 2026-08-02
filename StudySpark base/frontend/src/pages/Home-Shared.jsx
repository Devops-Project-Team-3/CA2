/*
  Owner: Shared
  Feature: Base Homepage
  Status: Base placeholder only.
  Description: Main homepage hub for StudySpark feature navigation.
*/

import { useEffect, useState } from 'react';
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

const heroSlides = [
  {
    eyebrow: 'Dashboard',
    title: 'Track study momentum',
    description: 'View streaks, completed topics, upcoming study slots, and the next suggested focus.',
    stats: [
      { label: 'Focus', value: 'Next step' },
      { label: 'Progress', value: 'Live view' },
      { label: 'Review', value: 'Adaptive' }
    ],
    bars: ['82%', '58%', '68%']
  },
  {
    eyebrow: 'Study Planner',
    title: 'Plan sessions and focus time',
    description: 'Create study sessions, use list or calendar views, and run a simple focus timer.',
    stats: [
      { label: 'Views', value: 'List + calendar' },
      { label: 'Timer', value: 'Focus mode' },
      { label: 'Status', value: 'Complete' }
    ],
    bars: ['44%', '76%', '54%']
  },
  {
    eyebrow: 'AI Quiz',
    title: 'Practice from notes or PDFs',
    description: 'Generate mixed quiz practice with multiple-choice and open-ended questions.',
    stats: [
      { label: 'Input', value: 'Notes / PDF' },
      { label: 'Quiz', value: 'Mixed' },
      { label: 'Review', value: 'Answers' }
    ],
    bars: ['64%', '88%', '46%']
  },
  {
    eyebrow: 'Notifications',
    title: 'Keep reminders visible',
    description: 'Schedule study, revision, and AI quiz reminders in a notification-style workspace.',
    stats: [
      { label: 'Types', value: '3' },
      { label: 'Status', value: 'Due' },
      { label: 'Alerts', value: 'Popup' }
    ],
    bars: ['35%', '70%', '92%']
  },
  {
    eyebrow: 'Profile',
    title: 'Personalize your study space',
    description: 'Login, manage your account details, and choose a profile avatar for StudySpark.',
    stats: [
      { label: 'Account', value: 'Saved' },
      { label: 'Avatar', value: 'Preset' },
      { label: 'Theme', value: 'Cozy' }
    ],
    bars: ['52%', '66%', '80%']
  }
];

function HomeShared() {
  const isLoggedIn = Boolean(getStoredToken() && getStoredUser());
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, []);

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

        <div className="study-console rotating-console" aria-label="StudySpark feature showcase">
          <div className="rotating-slide-frame">
            {heroSlides.map((slide, slideIndex) => {
              const isActive = activeSlide === slideIndex;

              return (
                <div
                  aria-hidden={!isActive}
                  className={isActive ? 'rotating-slide active' : 'rotating-slide'}
                  key={slide.title}
                >
                  <div className="console-header">
                    <span>{slide.eyebrow}</span>
                    <strong>{slide.title}</strong>
                  </div>
                  <div className="console-focus-card">
                    <span className="console-dot" />
                    <div>
                      <p>Feature preview</p>
                      <strong>{slide.description}</strong>
                    </div>
                  </div>
                  <div className="console-metrics">
                    {slide.stats.map((stat) => (
                      <div key={stat.label}>
                        <span>{stat.label}</span>
                        <strong>{stat.value}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="console-timeline">
                    {slide.bars.map((barWidth, index) => (
                      <span
                        key={`${slide.title}-${barWidth}`}
                        style={{
                          transitionDelay: `${index * 90}ms`,
                          width: isActive ? barWidth : '24%'
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rotating-dots" aria-label="Choose feature preview">
            {heroSlides.map((slide, index) => (
              <button
                aria-label={`Show ${slide.eyebrow}`}
                aria-pressed={activeSlide === index}
                className={activeSlide === index ? 'active' : ''}
                key={slide.eyebrow}
                onClick={() => setActiveSlide(index)}
                type="button"
              />
            ))}
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
