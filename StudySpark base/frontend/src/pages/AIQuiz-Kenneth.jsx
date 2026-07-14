/*
  Owner: Kenneth
  Feature: AI Quiz Generator
  Status: Base placeholder only. Feature logic not implemented yet.
  Description: This file is reserved for Kenneth's AI Quiz Generator feature.
*/

import { useState } from 'react';
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

function AIQuizKenneth() {
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerateQuiz() {
    setError('');
    setSaveMessage('');
    setResult(null);
    setQuestions([]);
    setSelectedAnswers({});

    if (!notes.trim() && !selectedFile) {
      setError('Please add study notes or choose a file before generating a quiz.');
      return;
    }

    if (selectedFile && selectedFile.type !== 'application/pdf') {
      setError('Please choose a PDF file.');
      return;
    }

    try {
      setIsLoading(true);
      const quizQuestions = selectedFile
        ? await generateQuizFromDocument(selectedFile)
        : await generateQuiz({
            notes,
            fileName: ''
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

  function getQuizTopicTitle() {
    if (selectedFile?.name) {
      return selectedFile.name.replace(/\.pdf$/i, '').slice(0, 150);
    }

    const firstLine = notes.split('\n').find((line) => line.trim());
    return (firstLine || 'AI Quiz Practice').trim().slice(0, 150);
  }

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
        <p>Paste study notes or upload a PDF, then generate a quiz.</p>
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
