/*
  Owner: Shared
  Feature: Base Homepage
  Status: Base placeholder only.
  Description: Main homepage hub for StudySpark feature navigation.
*/

import { Link } from 'react-router-dom';

const features = [
  {
    title: 'User Authentication',
    owner: 'Izzul',
    link: '/login',
    description: 'Register, login, and manage user profile.'
  },
  {
    title: 'Study Planner',
    owner: 'Yuki',
    link: '/planner',
    description: 'Create, view, edit, and delete study sessions.'
  },
  {
    title: 'Adaptive Dashboard',
    owner: 'Zachary',
    link: '/dashboard',
    description: 'View study progress, streaks, completed topics, and revision recommendations.'
  },
  {
    title: 'Notifications',
    owner: 'Rui Feng',
    link: '/notifications',
    description: 'Study reminders, revision reminders, and motivational alerts.'
  },
  {
    title: 'AI Quiz Generator',
    owner: 'Kenneth',
    link: '/ai-quiz',
    description: 'Generate quizzes from study material using Gemini API later.'
  },
  {
    title: 'GitHub & System Design',
    owner: 'Ryan',
    link: '/system-design',
    description: 'Repository workflow, branch rules, and system architecture.'
  }
];

function HomeShared() {
  return (
    <div className="home-page">
      <section className="home-intro">
        <p className="home-kicker">Adaptive Study Planner</p>
        <h1>StudySpark</h1>
        <p className="home-description">
          StudySpark helps students plan study sessions, track progress, and revise smarter using
          adaptive recommendations.
        </p>
      </section>

      <section className="feature-grid" aria-label="StudySpark feature owners">
        {features.map((feature) => (
          <Link className="feature-card" key={feature.title} to={feature.link}>
            <span className="feature-owner">Owner: {feature.owner}</span>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
            <span className="feature-link">Open placeholder</span>
          </Link>
        ))}
      </section>

      <section className="work-rules">
        <h2>How to work on this project</h2>
        <ul>
          <li>Create your own feature branch.</li>
          <li>Only edit your assigned feature files.</li>
          <li>Do not push directly to main.</li>
          <li>Ask before editing shared files.</li>
        </ul>
      </section>
    </div>
  );
}

export default HomeShared;
