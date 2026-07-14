/*
  Owner: Kenneth
  Feature: AI Quiz Generator
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Kenneth's AI Quiz Generator feature.
*/

import { useState } from 'react';
import { generateQuiz } from '../services/quizService-Kenneth.js';

function getRevisionRecommendation(scorePercentage) {
  if (scorePercentage < 60) {
    return 'Revise tomorrow';
  }

  if (scorePercentage <= 80) {
    return 'Revise in 3 days';
  }

  return 'Revise in 7 days';
}

function AIQuizKenneth() {
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerateQuiz() {
    setError('');
    setResult(null);
    setQuestions([]);
    setSelectedAnswers({});

    if (!notes.trim() && !selectedFile) {
      setError('Please add study notes or choose a file before generating a quiz.');
      return;
    }

    if (!notes.trim() && selectedFile) {
      setError('File upload is a placeholder for now. Please paste study notes to generate a quiz.');
      return;
    }

    try {
      setIsLoading(true);
      const quizQuestions = await generateQuiz({
        notes,
        fileName: selectedFile ? selectedFile.name : ''
      });
      setQuestions(quizQuestions);
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

  function handleSubmitQuiz() {
    const correctAnswers = questions.filter(
      (question) => selectedAnswers[question.id] === question.correctAnswer
    );
    const scorePercentage = Math.round((correctAnswers.length / questions.length) * 100);

    setResult({
      correctCount: correctAnswers.length,
      totalQuestions: questions.length,
      scorePercentage,
      recommendation: getRevisionRecommendation(scorePercentage)
    });
  }

  return (
    <section className="placeholder-panel" style={{ display: 'grid', gap: '24px' }}>
      <div>
        <h1>AI Quiz Generator</h1>
        <p>Paste study notes or choose a file placeholder, then generate a mock quiz.</p>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        <label htmlFor="study-notes" style={{ fontWeight: 700 }}>
          Study notes
        </label>
        <textarea
          id="study-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Paste your study notes here..."
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
          File upload placeholder
        </label>
        <input
          id="quiz-file"
          type="file"
          onChange={(event) => setSelectedFile(event.target.files[0] || null)}
        />
        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
      </div>

      {error && <p style={{ color: '#b91c1c', fontWeight: 700 }}>{error}</p>}

      <button
        type="button"
        onClick={handleGenerateQuiz}
        disabled={isLoading}
        style={{
          background: '#2563eb',
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
        {isLoading ? 'Generating...' : 'Generate Quiz'}
      </button>

      {questions.length > 0 && (
        <div style={{ display: 'grid', gap: '18px' }}>
          <h2>Mock Quiz Questions</h2>
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
              {question.options.map((option) => (
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
              ))}
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
            Total score: {result.scorePercentage}% ({result.correctCount} of{' '}
            {result.totalQuestions} correct)
          </p>
          <p>Revision recommendation: {result.recommendation}</p>

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
              <p>Correct answer: {question.correctAnswer}</p>
              <p>Explanation: {question.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AIQuizKenneth;
