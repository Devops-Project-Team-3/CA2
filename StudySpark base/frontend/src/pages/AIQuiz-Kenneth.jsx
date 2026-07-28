/*
  Owner: Kenneth
  Feature: AI Quiz Generator
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Kenneth's AI Quiz Generator feature.
*/

import { useEffect, useState } from 'react';
import { getPlannerItems } from '../services/plannerService-Yuki.js';
import {
  generateQuiz,
  generateQuizFromDocument,
  saveQuizResultsPlaceholder
} from '../services/quizService-Kenneth.js';

function getRevisionRecommendation(scorePercentage) {
  if (scorePercentage < 60) {
    return 'Revise tomorrow';
  }

  if (scorePercentage <= 80) {
    return 'Revise in 3 days';
  }

  return 'Revise in 7 days';
}

function isCompletedSession(session) {
  return session.completed === true || session.completed === 1 || session.completed === '1' || session.status === 'completed';
}

function formatSessionLabel(session) {
  const subject = session.subject && session.subject !== 'General' ? `${session.subject} - ` : '';
  return `${subject}${session.topic || session.title || 'Completed study topic'}`;
}

function formatSessionSubject(session) {
  return session?.subject || 'General';
}

function formatSessionTopic(session) {
  return session?.topic || session?.title || 'Completed study topic';
}

function AIQuizKenneth() {
  const [completedSessions, setCompletedSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [adaptiveInsight, setAdaptiveInsight] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getPlannerItems()
      .then((response) => {
        if (!active) return;

        const completed = (response.data?.plannerItems || []).filter(isCompletedSession);
        setCompletedSessions(completed);
        setSelectedSessionId((current) => current || String(completed[0]?.id || ''));
      })
      .catch(() => {
        if (!active) return;
        setCompletedSessions([]);
      })
      .finally(() => {
        if (active) setSessionsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleGenerateQuiz() {
    setError('');
    setSaveMessage('');
    setResult(null);
    setQuestions([]);
    setSelectedAnswers({});
    setAdaptiveInsight(null);

    if (!selectedSessionId) {
      setError('Complete a study session first, then select it here to generate a quiz.');
      return;
    }

    if (!notes.trim() && !selectedFile) {
      setError('Add study notes or upload a PDF for the completed topic you selected.');
      return;
    }

    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Please choose a PDF file.');
      return;
    }

    try {
      setIsLoading(true);
      const quizResponse = selectedFile
        ? await generateQuizFromDocument(selectedFile)
        : await generateQuiz({
            notes,
            fileName: ''
          });
      setQuestions(quizResponse.questions);
      setAdaptiveInsight(quizResponse.adaptiveInsight);
    } catch (requestError) {
      setError(requestError.message || 'Unable to generate quiz right now.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleAnswerChange(questionId, answer) {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: answer
    }));
  }

  function getSelectedSession() {
    return completedSessions.find((session) => String(session.id) === String(selectedSessionId));
  }

  function getQuizTopicTitle() {
    const selectedSession = getSelectedSession();

    if (selectedSession) {
      return formatSessionLabel(selectedSession).slice(0, 150);
    }

    if (selectedFile?.name) {
      return selectedFile.name.replace(/\.pdf$/i, '').slice(0, 150);
    }

    return 'AI Quiz Practice';
  }

  const selectedSession = getSelectedSession();

  async function handleSubmitQuiz() {
    const multipleChoiceQuestions = questions.filter((question) => question.type !== 'open-ended');
    const correctAnswers = multipleChoiceQuestions.filter(
      (question) => selectedAnswers[question.id] === question.correctAnswer
    );
    const scorePercentage = multipleChoiceQuestions.length === 0
      ? 0
      : Math.round((correctAnswers.length / multipleChoiceQuestions.length) * 100);

    const nextResult = {
      correctCount: correctAnswers.length,
      totalQuestions: multipleChoiceQuestions.length,
      openEndedCount: questions.length - multipleChoiceQuestions.length,
      scorePercentage,
      recommendation: getRevisionRecommendation(scorePercentage)
    };

    setResult(nextResult);
    setSaveMessage('Saving result for dashboard recommendations...');

    try {
      await saveQuizResultsPlaceholder({
        studySessionId: selectedSessionId,
        topicTitle: getQuizTopicTitle(),
        questions,
        userAnswers: selectedAnswers,
        score: scorePercentage
      });
      setSaveMessage('Result saved. Dashboard recommendations will update after refresh.');
    } catch (saveError) {
      setSaveMessage(saveError.message || 'Quiz completed, but the result could not be saved.');
    }
  }

  return (
    <section className="placeholder-panel" style={{ display: 'grid', gap: '24px' }}>
      <div>
        <h1>AI Quiz Generator</h1>
        <p>Pick something you already studied, paste the matching notes, then test yourself.</p>
      </div>

      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          color: '#1e3a8a',
          display: 'grid',
          gap: '6px',
          padding: '14px'
        }}
      >
        <strong>Linked quiz mode</strong>
        <span>
          This quiz will be connected to the completed study topic you choose below. Your score will update the
          adaptive dashboard and revision reminders.
        </span>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        <label htmlFor="completed-topic" style={{ fontWeight: 700 }}>
          Completed study topic
        </label>
        <select
          id="completed-topic"
          value={selectedSessionId}
          onChange={(event) => setSelectedSessionId(event.target.value)}
          disabled={sessionsLoading || completedSessions.length === 0}
          style={{
            border: '1px solid #dbe3ef',
            borderRadius: '8px',
            font: 'inherit',
            padding: '12px'
          }}
        >
          {sessionsLoading && <option>Loading completed topics...</option>}
          {!sessionsLoading && completedSessions.length === 0 && <option>No completed study topics yet</option>}
          {completedSessions.map((session) => (
            <option key={session.id} value={session.id}>
              {formatSessionLabel(session)}
            </option>
          ))}
        </select>
        {!sessionsLoading && completedSessions.length === 0 && (
          <p style={{ color: '#64748b', margin: 0 }}>
            Mark a study session as completed in Study Planner first, then come back here for a quiz.
          </p>
        )}
        {selectedSession && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#334155',
              padding: '12px'
            }}
          >
            <strong>{formatSessionTopic(selectedSession)}</strong>
            <p style={{ margin: '4px 0 0' }}>Subject: {formatSessionSubject(selectedSession)}</p>
          </div>
        )}
      </div>


      <div style={{ display: 'grid', gap: '12px' }}>
        <label htmlFor="study-notes" style={{ fontWeight: 700 }}>
          Study notes
        </label>
        <textarea
          id="study-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Paste notes for the completed study topic selected above..."
          rows="8"
          style={{
            border: '1px solid #dbe3ef',
            borderRadius: '8px',
            font: 'inherit',
            padding: '12px',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        <label htmlFor="quiz-file" style={{ fontWeight: 700 }}>
          Upload PDF
        </label>
        <input
          id="quiz-file"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => setSelectedFile(event.target.files[0] || null)}
        />
        {selectedFile && (
          <p>
            Selected file: {selectedFile.name}
            {notes.trim() ? ' - PDF will be used instead of pasted notes.' : ''}
          </p>
        )}
      </div>

      {error && <p style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</p>}

      <button
        type="button"
        onClick={handleGenerateQuiz}
        disabled={isLoading || sessionsLoading || completedSessions.length === 0}
        style={{
          background: isLoading || sessionsLoading || completedSessions.length === 0 ? '#93c5fd' : '#2563eb',
          border: '0',
          borderRadius: '8px',
          color: '#ffffff',
          cursor: isLoading || sessionsLoading || completedSessions.length === 0 ? 'not-allowed' : 'pointer',
          font: 'inherit',
          fontWeight: 800,
          padding: '12px 18px',
          width: 'fit-content'
        }}
      >
        {isLoading ? 'Generating...' : 'Generate Quiz'}
      </button>

      {adaptiveInsight && (
        <div
          style={{
            background: '#0f172a',
            border: '1px solid #38bdf8',
            borderRadius: '8px',
            boxShadow: '0 14px 30px rgba(15, 23, 42, 0.18)',
            color: '#f8fafc',
            display: 'grid',
            gap: '8px',
            padding: '16px'
          }}
        >
          <strong style={{ color: '#7dd3fc' }}>Quiz plan for this topic</strong>
          <span style={{ color: '#f8fafc' }}>Difficulty: {adaptiveInsight.difficulty}</span>
          <span style={{ color: '#f8fafc' }}>Focus: {adaptiveInsight.priority}</span>
          <span style={{ color: '#dbeafe' }}>{adaptiveInsight.recommendation}</span>
        </div>
      )}

      {questions.length > 0 && (
        <div style={{ display: 'grid', gap: '18px' }}>
          <h2>Quiz Questions</h2>
          {questions.map((question, index) => (
            <fieldset
              key={question.id}
              style={{
                border: '1px solid #dbe3ef',
                borderRadius: '8px',
                display: 'grid',
                gap: '10px',
                margin: 0,
                padding: '18px'
              }}
            >
              <legend style={{ fontWeight: 800 }}>
                {index + 1}. {question.question}
              </legend>
              {question.type === 'open-ended' ? (
                <textarea
                  value={selectedAnswers[question.id] || ''}
                  onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                  placeholder="Write your answer..."
                  rows="4"
                  style={{
                    border: '1px solid #dbe3ef',
                    borderRadius: '8px',
                    font: 'inherit',
                    padding: '12px',
                    resize: 'vertical'
                  }}
                />
              ) : (
                question.options.map((option) => (
                  <label key={option} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={selectedAnswers[question.id] === option}
                      onChange={() => handleAnswerChange(question.id, option)}
                    />
                    {option}
                  </label>
                ))
              )}
            </fieldset>
          ))}

          <button
            type="button"
            onClick={handleSubmitQuiz}
            style={{
              background: '#16a34a',
              border: '0',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer',
              font: 'inherit',
              fontWeight: 800,
              padding: '12px 18px',
              width: 'fit-content'
            }}
          >
            Submit Quiz
          </button>
        </div>
      )}

      {result && (
        <div style={{ display: 'grid', gap: '14px' }}>
          <h2>Quiz Results</h2>
          <p>
            Multiple-choice score: {result.scorePercentage}% ({result.correctCount} of{' '}
            {result.totalQuestions} correct)
          </p>
          {result.openEndedCount > 0 && (
            <p>{result.openEndedCount} open-ended answer(s) are shown for self-review.</p>
          )}
          <p>Revision recommendation: {result.recommendation}</p>
          {saveMessage && <p>{saveMessage}</p>}

          {questions.map((question) => (
            <div
              key={question.id}
              style={{
                background: '#f7f9fc',
                border: '1px solid #dbe3ef',
                borderRadius: '8px',
                padding: '16px'
              }}
            >
              <h3>{question.question}</h3>
              <p>User answer: {selectedAnswers[question.id] || 'No answer selected'}</p>
              {question.type === 'open-ended' ? (
                <p>Suggested answer: {question.sampleAnswer}</p>
              ) : (
                <p>Correct answer: {question.correctAnswer}</p>
              )}
              <p>Explanation: {question.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AIQuizKenneth;
