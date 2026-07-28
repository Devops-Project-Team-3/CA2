import { useEffect, useMemo, useState } from 'react';
import {
  createPlannerItem,
  deletePlannerItem,
  getPlannerItems,
  updatePlannerItem
} from '../services/plannerService-Yuki.js';

const emptyForm = {
  title: '',
  subject: '',
  description: '',
  date: '',
  completed: false,
  duration: 45
};

function isSessionCompleted(session) {
  return session.completed === true || session.completed === 1 || session.completed === '1' || session.status === 'completed';
}

function getInitialTimerState(session) {
  return {
    remainingSeconds: isSessionCompleted(session) ? 0 : Math.max(0, Number(session.duration || 0) * 60),
    isRunning: false
  };
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds || 0);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const seconds = String(safeSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
  const days = [];

  for (let index = 0; index < totalCells; index += 1) {
    const dayOffset = index - leadingDays + 1;
    const currentDate = new Date(year, month, dayOffset);
    days.push({
      date: currentDate,
      isCurrentMonth: currentDate.getMonth() === month,
      key: toDateKey(currentDate)
    });
  }

  return days;
}

function StudyPlannerYuki() {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timerStates, setTimerStates] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const [focusSessionId, setFocusSessionId] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimerStates((currentTimerStates) => {
        const nextTimerStates = { ...currentTimerStates };

        Object.entries(currentTimerStates).forEach(([sessionId, timerState]) => {
          if (!timerState.isRunning || timerState.remainingSeconds <= 0) {
            return;
          }

          const nextRemainingSeconds = timerState.remainingSeconds - 1;
          if (nextRemainingSeconds <= 0) {
            nextTimerStates[sessionId] = {
              ...timerState,
              remainingSeconds: 0,
              isRunning: false
            };
            const completedSession = sessions.find((session) => String(session.id) === String(sessionId));
            if (completedSession && !completedSession.completed) {
              void completeSessionByTimer(completedSession);
            }
          } else {
            nextTimerStates[sessionId] = {
              ...timerState,
              remainingSeconds: nextRemainingSeconds
            };
          }
        });

        return nextTimerStates;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [sessions]);

  const todayKey = toDateKey(new Date());
  const todaysSessions = useMemo(
    () => sessions.filter((session) => session.date === todayKey),
    [sessions, todayKey]
  );
  const listSessions = useMemo(
    () => sessions.filter((session) => !session.date || session.date >= todayKey),
    [sessions, todayKey]
  );
  const totalPlannedMinutes = useMemo(
    () => todaysSessions.reduce((total, session) => total + Number(session.duration || 0), 0),
    [todaysSessions]
  );
  const totalCompletedMinutes = useMemo(
    () => todaysSessions.filter(isSessionCompleted).reduce((total, session) => total + Number(session.duration || 0), 0),
    [todaysSessions]
  );
  const progressPercent = totalPlannedMinutes === 0 ? 0 : Math.round((totalCompletedMinutes / totalPlannedMinutes) * 100);

  const sessionsByDate = useMemo(() => {
    return sessions.reduce((groupedSessions, session) => {
      if (!session.date) {
        return groupedSessions;
      }
      if (!groupedSessions[session.date]) {
        groupedSessions[session.date] = [];
      }
      groupedSessions[session.date].push(session);
      return groupedSessions;
    }, {});
  }, [sessions]);

  const selectedDaySessions = selectedDate ? sessionsByDate[selectedDate] || [] : [];
  const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);

  async function loadSessions() {
    setLoading(true);
    setError('');

    try {
      const response = await getPlannerItems();
      const plannerItems = response.data?.plannerItems || [];
      setSessions(plannerItems);
      setTimerStates((currentTimerStates) => {
        const nextTimerStates = {};
        plannerItems.forEach((session) => {
          nextTimerStates[session.id] = isSessionCompleted(session)
            ? getInitialTimerState(session)
            : currentTimerStates[session.id] || getInitialTimerState(session);
        });
        return nextTimerStates;
      });
    } catch (err) {
      setError('Unable to load study sessions. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setMessage('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form.title.trim()) {
      setError('Please enter a title for the study session.');
      return;
    }

    const duration = Number(form.duration);
    const payload = {
      ...form,
      subject: form.subject.trim(),
      duration: Number.isFinite(duration) && duration > 0 ? duration : 45,
      completed: Boolean(form.completed)
    };

    try {
      if (editingId) {
        await updatePlannerItem(editingId, payload);
        setMessage('Study session updated successfully.');
      } else {
        await createPlannerItem(payload);
        setMessage('Study session created successfully.');
      }

      resetForm();
      await loadSessions();
    } catch (err) {
      setError('Unable to save study session. Please try again.');
    }
  }

  function handleEdit(session) {
    setEditingId(session.id);
    setForm({
      title: session.title,
      subject: session.subject || '',
      description: session.description || '',
      date: session.date || '',
      completed: session.completed || false,
      duration: Number(session.duration || 45)
    });
    setError('');
    setMessage('');
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this study session?');
    if (!confirmed) return;

    try {
      await deletePlannerItem(id);
      setMessage('Study session deleted successfully.');
      setTimerStates((currentTimerStates) => {
        const nextTimerStates = { ...currentTimerStates };
        delete nextTimerStates[id];
        return nextTimerStates;
      });
      await loadSessions();
    } catch (err) {
      setError('Unable to delete study session. Please try again.');
    }
  }

  async function toggleCompleted(session) {
    try {
      await updatePlannerItem(session.id, { completed: !session.completed });
      setSessions((currentSessions) =>
        currentSessions.map((item) => (item.id === session.id ? { ...item, completed: !item.completed } : item))
      );
      setTimerStates((currentTimerStates) => ({
        ...currentTimerStates,
        [session.id]: !isSessionCompleted(session) ? { remainingSeconds: 0, isRunning: false } : getInitialTimerState({ ...session, completed: false })
      }));
      setMessage(isSessionCompleted(session) ? 'Study session marked pending.' : 'Study session marked complete.');
    } catch (err) {
      setError('Unable to update completion status.');
    }
  }

  async function completeSessionByTimer(session) {
    try {
      await updatePlannerItem(session.id, { completed: true });
      setSessions((currentSessions) =>
        currentSessions.map((item) => (item.id === session.id ? { ...item, completed: true } : item))
      );
      setTimerStates((currentTimerStates) => ({
        ...currentTimerStates,
        [session.id]: {
          ...currentTimerStates[session.id],
          remainingSeconds: 0,
          isRunning: false
        }
      }));
      setMessage('🎉 Study session completed!');
    } catch (err) {
      setError('Unable to update completion status.');
    }
  }

  function controlTimer(session, action) {
    const timerState = timerStates[session.id] || getInitialTimerState(session);

    if (isSessionCompleted(session) && action !== 'complete') {
      return;
    }

    if (action === 'start') {
      setTimerStates((currentTimerStates) => ({
        ...currentTimerStates,
        [session.id]: {
          ...timerState,
          isRunning: true
        }
      }));
      return;
    }

    if (action === 'pause') {
      setTimerStates((currentTimerStates) => ({
        ...currentTimerStates,
        [session.id]: {
          ...timerState,
          isRunning: false
        }
      }));
      return;
    }

    if (action === 'reset') {
      setTimerStates((currentTimerStates) => ({
        ...currentTimerStates,
        [session.id]: {
          ...timerState,
          remainingSeconds: Math.max(0, Number(session.duration || 0) * 60),
          isRunning: false
        }
      }));
      return;
    }

    if (action === 'complete') {
      void completeSessionByTimer(session);
    }
  }

  const focusSession = focusSessionId ? sessions.find((session) => String(session.id) === String(focusSessionId)) : null;
  const focusTimerState = focusSession ? timerStates[focusSession.id] || getInitialTimerState(focusSession) : null;

  if (focusSession) {
    return (
      <section className="focus-mode-overlay">
        <div className="container py-4">
          <div className="card shadow-lg border-0 focus-card">
            <div className="card-body p-4 p-md-5 text-center">
              <p className="text-uppercase fw-bold text-primary mb-3">Focus Mode</p>
              <h1 className="display-6 mb-3">{focusSession.title}</h1>
              <p className="lead text-muted mb-4">{focusSession.subject || 'No subject provided'}</p>
              <div className="display-1 fw-bold mb-4">{formatTime(focusTimerState?.remainingSeconds || 0)}</div>
              <p className="text-muted mb-4">Remaining Time</p>

              <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => controlTimer(focusSession, 'start')}
                >
                  ▶ Resume
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => controlTimer(focusSession, 'pause')}
                  disabled={!focusTimerState?.isRunning}
                >
                  ⏸ Pause
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => controlTimer(focusSession, 'reset')}
                >
                  🔄 Reset
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => controlTimer(focusSession, 'complete')}
                >
                  ✔ Complete Session
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => setFocusSessionId(null)}
                >
                  ✕ Exit Focus Mode
                </button>
              </div>

              {message && <div className="alert alert-info d-inline-block">{message}</div>}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="planner-page">
      <header className="planner-header">
        <h1>Study Planner</h1>
        <p>Manage your study sessions, track progress, and stay focused with built-in timers.</p>
      </header>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h2 className="h4 mb-2">Study Goal Progress</h2>
              <p className="text-muted mb-0">
                Today completed: {totalCompletedMinutes} / {totalPlannedMinutes} minutes
              </p>
            </div>
            <div className="text-md-end">
              <div className="h2 mb-1">{progressPercent}%</div>
              <p className="mb-0 text-muted">
                {totalPlannedMinutes === 0
                  ? 'No study sessions scheduled for today.'
                  : progressPercent >= 100
                    ? 'Congratulations! You completed today\'s study goal!'
                  : 'Keep going with today\'s study sessions.'}
              </p>
            </div>
          </div>
          <div className="progress mt-3" style={{ height: '14px' }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${progressPercent}%` }}
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>

      <div className="planner-grid">
        <form className="planner-form card shadow-sm" onSubmit={handleSubmit}>
          <div className="card-body">
            <h2 className="h4 mb-3">{editingId ? 'Edit Study Session' : 'New Study Session'}</h2>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {message && <div className="alert alert-primary" role="status">{message}</div>}

            <label className="form-label">
              Title
              <input
                className="form-control mt-2"
                type="text"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="E.g. Chemistry revision"
              />
            </label>

            <label className="form-label">
              Subject
              <input
                className="form-control mt-2"
                type="text"
                value={form.subject}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
                placeholder="E.g. Mathematics"
              />
            </label>

            <label className="form-label">
              Description
              <textarea
                className="form-control mt-2"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="E.g. review chapter 4 questions"
              />
            </label>

            <label className="form-label">
              Date
              <input
                className="form-control mt-2"
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </label>

            <label className="form-label">
              Duration (minutes)
              <input
                className="form-control mt-2"
                type="number"
                min="1"
                value={form.duration}
                onChange={(event) => setForm({ ...form, duration: Number(event.target.value) || 45 })}
              />
            </label>

            <div className="form-check mt-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={form.completed}
                onChange={(event) => setForm({ ...form, completed: event.target.checked })}
              />
              <label className="form-check-label">Mark as completed</label>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Save changes' : 'Add session'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        <section className="planner-list card shadow-sm">
          <div className="card-body">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 className="h4 mb-0">My Study Sessions</h2>
              <div className="btn-group" role="group" aria-label="Planner views">
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('list')}
                >
                  List View
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setViewMode('calendar')}
                >
                  Calendar View
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-muted">Loading study sessions...</p>
            ) : sessions.length === 0 ? (
              <p className="text-muted">No study sessions yet. Add one to start planning.</p>
            ) : viewMode === 'calendar' ? (
              <div className="d-grid gap-4">
                <div className="card border-0 bg-light-subtle">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h3 className="h5 mb-0">
                        {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setViewDate(new Date())}
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                        >
                          →
                        </button>
                      </div>
                    </div>

                    <div className="row g-2 text-center fw-semibold text-muted small">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
                        <div className="col" key={dayName}>
                          {dayName}
                        </div>
                      ))}
                    </div>

                    <div className="row g-2 mt-1">
                      {calendarDays.map((day) => {
                        const daySessions = sessionsByDate[day.key] || [];
                        const isToday = day.key === toDateKey(new Date());
                        const isSelected = day.key === selectedDate;
                        return (
                          <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={day.key}>
                            <button
                              type="button"
                              className={`calendar-day-button w-100 ${!day.isCurrentMonth ? 'opacity-50' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                              onClick={() => setSelectedDate(day.key)}
                            >
                              <span className="calendar-day-number">{day.date.getDate()}</span>
                              {daySessions.length > 0 && <span className="calendar-day-count">{daySessions.length}</span>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="card border-0 bg-light-subtle">
                  <div className="card-body">
                    <h3 className="h6 mb-3">Sessions for {selectedDate}</h3>
                    {selectedDaySessions.length === 0 ? (
                      <p className="text-muted mb-0">No study sessions scheduled for this date.</p>
                    ) : (
                      <ul className="list-unstyled mb-0 d-grid gap-2">
                        {selectedDaySessions.map((session) => (
                          <li key={session.id} className="d-flex justify-content-between align-items-center">
                            <span>
                              {session.completed ? '✅' : '⏳'} {session.title}
                            </span>
                            <span className="small text-muted">{session.subject || 'General'}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : listSessions.length === 0 ? (
              <p className="text-muted">No current or upcoming study sessions. Past sessions are kept in Calendar View.</p>
            ) : (
              <ul className="list-unstyled d-grid gap-3 mb-0">
                {listSessions.map((session) => {
                  const timerState = isSessionCompleted(session) ? getInitialTimerState(session) : timerStates[session.id] || getInitialTimerState(session);
                  return (
                    <li key={session.id} className={`card ${session.completed ? 'border-success' : 'border-light'}`}>
                      <div className="card-body">
                        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                          <div>
                            <h3 className="h5 mb-2">{session.title}</h3>
                            <p className="text-muted mb-2">{session.description || 'No description provided.'}</p>
                            <p className="small text-muted mb-2">
                              {session.date ? `Date: ${session.date}` : 'No date set'}
                              {' · '}
                              {session.completed ? 'Completed' : 'Pending'}
                            </p>
                            <p className="small fw-semibold mb-3">Subject: {session.subject || 'General'}</p>
                            <p className="small fw-semibold mb-3">Duration: {session.duration || 0} minutes</p>
                          </div>

                          <div className="text-md-end">
                            <div className="badge bg-primary-subtle text-primary mb-2">Timer</div>
                            <div className="h3 mb-2">{formatTime(timerState.remainingSeconds)}</div>
                            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                              <button type="button" className="btn btn-sm btn-success" disabled={isSessionCompleted(session)} onClick={() => controlTimer(session, 'start')}>
                                ▶ Start
                              </button>
                              <button type="button" className="btn btn-sm btn-warning" disabled={isSessionCompleted(session)} onClick={() => controlTimer(session, 'pause')}>
                                ⏸ Pause
                              </button>
                              <button type="button" className="btn btn-sm btn-outline-secondary" disabled={isSessionCompleted(session)} onClick={() => controlTimer(session, 'reset')}>
                                🔄 Reset
                              </button>
                              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => controlTimer(session, 'complete')}>
                                ✔ Complete
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mt-3">
                          <button type="button" className="btn btn-sm btn-dark" onClick={() => setFocusSessionId(session.id)}>
                            Start Focus Mode
                          </button>
                          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(session)}>
                            Edit
                          </button>
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(session.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default StudyPlannerYuki;
