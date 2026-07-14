/*
  Owner: Zachary
  Feature: Adaptive Dashboard
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Zachary's Adaptive Dashboard feature.
*/

import { useEffect, useState } from 'react';
import { getDashboardPlaceholder } from '../services/dashboardService-Zachary.js';

function DashboardZachary() {
  const [message, setMessage] = useState('Loading dashboard placeholder...');

  useEffect(() => {
    getDashboardPlaceholder()
      .then((response) => setMessage(response.message))
      .catch(() => setMessage('Dashboard placeholder API is not available yet.'));
  }, []);

  return (
    <section className="placeholder-panel">
      <h1>Dashboard</h1>
      <p>{message}</p>
    </section>
  );
}

export default DashboardZachary;
