import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        setQuiz(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quiz');
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleOptionSelect = (questionId, optionKey) => {
    setAnswers({ ...answers, [questionId]: optionKey });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const formattedAnswers = Object.keys(answers).map(qId => ({
      question_id: parseInt(qId),
      selected_option: answers[qId]
    }));

    try {
      const res = await api.post(`/quizzes/${id}/submit`, { answers: formattedAnswers });
      navigate(`/quizzes/result/${res.data.data.attempt_id}`);
    } catch (err) {
      alert('Failed to submit quiz.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading quiz...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="quiz-container mx-auto" style={{ maxWidth: '800px' }}>
      <div className="card mb-4">
        <h1>{quiz.title}</h1>
        <p>{quiz.description}</p>
      </div>

      {quiz.questions && quiz.questions.length > 0 ? (
        quiz.questions.map((q, index) => (
          <div key={q.id} className="card mb-4 question-card">
            <h3>{index + 1}. {q.question_text}</h3>
            <div className="options-list mt-4">
              {['A', 'B', 'C', 'D'].map(opt => (
                <div 
                  key={opt}
                  className={`quiz-option ${answers[q.id] === opt ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(q.id, opt)}
                >
                  <span className="option-letter">{opt}</span>
                  <span className="option-text">{q[`option_${opt.toLowerCase()}`]}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p>This quiz has no questions yet.</p>
      )}

      <button 
        className="btn primary-btn btn-lg w-100" 
        onClick={handleSubmit} 
        disabled={submitting || Object.keys(answers).length !== (quiz.questions?.length || 0)}
      >
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
    </div>
  );
};

export default QuizPage;
