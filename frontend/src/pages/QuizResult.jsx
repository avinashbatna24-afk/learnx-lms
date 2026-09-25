import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const QuizResult = () => {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/quizzes/attempt/${attemptId}`);
        setResult(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quiz results');
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) return <div className="loading">Loading results...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const percentage = Math.round((result.score / result.total_questions) * 100);

  return (
    <div className="card mx-auto mt-4 text-center" style={{ maxWidth: '500px', padding: '40px' }}>
      <h1>Quiz Results</h1>
      
      <div className="result-circle mt-4 mb-4 mx-auto">
        <h2>{result.score} / {result.total_questions}</h2>
        <p>{percentage}%</p>
      </div>

      <p className="mb-4">
        {percentage >= 80 ? 'Excellent work! You have a strong understanding of this topic.' : 
         percentage >= 50 ? 'Good job, but there is room for improvement.' : 
         'You might want to review the course material and try again.'}
      </p>

      <Link to="/dashboard" className="btn primary-btn mt-4">Return to Dashboard</Link>
    </div>
  );
};

export default QuizResult;
