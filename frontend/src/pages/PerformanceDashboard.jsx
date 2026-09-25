import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2, TrendingUp, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const PerformanceDashboard = () => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.get('/performance');
        setPerformance(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load performance data.');
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) return (
    <div className="empty-state fade-in" style={{border: 'none'}}>
      <Loader2 className="empty-state-icon" style={{ animation: 'spin 2s linear infinite' }} />
      <p>Loading performance data...</p>
    </div>
  );
  
  if (error) return (
    <div className="card fade-in mt-8" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', padding: '24px', border: 'none', textAlign: 'center' }}>
      {error}
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px' }}>Performance Analytics</h1>
        <p>Track your topic mastery and quiz history.</p>
      </div>
      
      <div className="card text-center mb-6" style={{ padding: '40px' }}>
        <h2 style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '16px' }}>Overall Average Quiz Score</h2>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', fontSize: '2.5rem', fontWeight: 'bold', boxShadow: 'var(--shadow-md)' }}>
          {performance.overall_average}%
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ borderColor: 'rgba(22, 163, 74, 0.2)' }}>
          <h3 className="success-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={20} /> Strong Topics</h3>
          {performance.topics.strong.length === 0 ? (
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>No strong topics yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
              {performance.topics.strong.map(t => (
                <li key={t.topic} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500 }}>{t.topic}</span>
                    <span>{t.percentage}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${t.percentage}%`, backgroundColor: 'var(--success)' }}></div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
          <h3 className="warning-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={20} /> Average Topics</h3>
          {performance.topics.average.length === 0 ? (
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>No average topics yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
              {performance.topics.average.map(t => (
                <li key={t.topic} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500 }}>{t.topic}</span>
                    <span>{t.percentage}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${t.percentage}%`, backgroundColor: 'var(--warning)' }}></div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card" style={{ borderColor: 'rgba(220, 38, 38, 0.2)' }}>
          <h3 className="danger-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={20} /> Weak Topics</h3>
          {performance.topics.weak.length === 0 ? (
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>No weak topics yet! Great job.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '16px' }}>
              {performance.topics.weak.map(t => (
                <li key={t.topic} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500 }}>{t.topic}</span>
                    <span>{t.percentage}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${t.percentage}%`, backgroundColor: 'var(--error)' }}></div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Recent Quiz Scores</h3>
        {performance.recentScores.length === 0 ? (
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>You haven't taken any quizzes yet.</p>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Quiz</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Score</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {performance.recentScores.map((score, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>{score.quiz_title}</td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge ${score.percentage >= 80 ? 'success-bg' : score.percentage >= 50 ? 'warning-bg' : 'danger-bg'}`}>
                        {score.percentage}%
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{new Date(score.attempted_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
