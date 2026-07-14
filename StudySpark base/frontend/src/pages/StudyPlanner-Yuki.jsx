/*
  Owner: Yuki
  Feature: Study Planner CRUD
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Yuki's Study Planner CRUD feature.
*/

import { useEffect, useState } from 'react';
import { getPlannerPlaceholder } from '../services/plannerService-Yuki.js';

function StudyPlannerYuki() {
  const [message, setMessage] = useState('Loading study planner placeholder...');

  useEffect(() => {
    getPlannerPlaceholder()
      .then((response) => setMessage(response.message))
      .catch(() => setMessage('Study Planner placeholder API is not available yet.'));
  }, []);

  return (
    <section className="placeholder-panel">
      <h1>Study Planner</h1>
      <p>{message}</p>
    </section>
  );
}

export default StudyPlannerYuki;
