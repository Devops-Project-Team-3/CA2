import React, { useState, useEffect } from 'react';
import { calculateRevisionDueDate, calculateStreak } from '../utils/dashboardEngine';

export default function Dashboard({ userId }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating database pull from CRUD and Auth modules
    const fetchDashboardData = async () => {
      try {
        // In reality: await fetch(`/api/dashboard/${userId}`)
        const mockDbPull = {
          user: { name: "Zachary" },
          sessions: [
            { id: 1, date: "2026-07-02", subject: "Cisco Networking", topic: "VLAN Trunking" },
            { id: 2, date: "2026-07-04", subject: "AWS Cloud", topic: "EC2 & S3 Pricing" }
          ],
          completedTopics: [
            { id: 101, name: "Linux System Admin Basics", subject: "Linux", quizScore: 55, quizDate: "2026-07-01" },
            { id: 102, name: "Routing Protocols", subject: "Networking", quizScore: 85, quizDate: "2026-06-29" }
          ],
          totalTopicsCount: 4
        };
        
        setUserData(mockDbPull);
        setLoading(false);
      } catch (err) {
        console.error("Error pulling dashboard data", err);
      }
    };

    fetchDashboardData();
  }, [userId]);

  if (loading) return <div className="loading-spinner">Loading StudySpark Space...</div>;

  const totalCompleted = userData.completedTopics.length;
  const progressPercent = Math.round((totalCompleted / userData.totalTopicsCount) * 100);
  const currentStreak = calculateStreak(userData.completedTopics);

  return (
    <div className="dashboard-container" style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f9f9fb' }}>
      
      {/* Header Banner */}
      <header style={{ marginBottom: '30px' }}>
        <h2>Welcome back, {userData.user.name}! ✨</h2>
        <p style={{ color: '#666' }}>"You've completed {totalCompleted} topics today. Try an AI quiz to test your understanding!"</p>
      </header>

      {/* Top Metrics Row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div className="card" style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h4>🔥 Study Streak</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>{currentStreak} Days Consecutive</p>
        </div>
        
        <div className="card" style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h4>📈 Learning Progress</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>{progressPercent}% Complete</p>
          <div style={{ width: '100%', backgroundColor: '#f0f0f0', borderRadius: '4px', height: '10px', marginTop: '10px' }}>
            <div style={{ width: `${progressPercent}%`, backgroundColor: '#52c41a', height: '10px', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>

      {/* Adaptive Revision Recommendations Section */}
      <section style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ color: '#1890ff', marginTop: 0 }}>🤖 Adaptive Revision Engine (USP)</h3>
        <p style={{ fontSize: '14px', color: '#777' }}>Schedules calculated instantly using custom performance metric criteria.</p>
        <div style={{ display: 'grid', gap: '10px' }}>
          {userData.completedTopics.map(topic => {
            const nextRevision = calculateRevisionDueDate(topic.quizDate, topic.quizScore);
            const isUrgent = topic.quizScore < 60;
            return (
              <div key={topic.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '6px', backgroundColor: isUrgent ? '#fff1f0' : '#f6ffed', border: isUrgent ? '1px solid #ffa39e' : '1px solid #b7eb8f' }}>
                <div>
                  <strong>{topic.name}</strong> ({topic.subject})
                  <div style={{ fontSize: '13px', color: '#555' }}>Last Score: <span style={{ fontWeight: 'bold', color: isUrgent ? '#cf1322' : '#389e0d' }}>{topic.quizScore}%</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', display: 'block', color: '#888' }}>Target Review Window</span>
                  <strong style={{ color: isUrgent ? '#cf1322' : '#389e0d' }}>{nextRevision.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Grid: Schedules & Visual Trackers */}
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Upcoming Study Sessions Table */}
        <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0 }}>📅 Upcoming Study Slots</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0', color: '#888' }}>
                <th style={{ paddingBottom: '10px' }}>Date</th>
                <th style={{ paddingBottom: '10px' }}>Subject</th>
                <th style={{ paddingBottom: '10px' }}>Focus Topic</th>
              </tr>
            </thead>
            <tbody>
              {userData.sessions.map(session => (
                <tr key={session.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 0' }}>{new Date(session.date).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}</td>
                  <td><span style={{ background: '#e6f7ff', color: '#1890ff', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>{session.subject}</span></td>
                  <td style={{ color: '#444' }}>{session.topic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Breakdown Panel / Visual Charts Simulation */}
        <div style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0 }}>📚 Target Domain Mastery</h3>
          <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                <span>Linux Administration</span>
                <strong>1 / 2 Topics</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}><div style={{ width: '50%', height: '8px', backgroundColor: '#13c2c2', borderRadius: '4px' }}></div></div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                <span>Cisco Networking</span>
                <strong>1 / 1 Topics</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}><div style={{ width: '100%', height: '8px', backgroundColor: '#722ed1', borderRadius: '4px' }}></div></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}