import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Target, Loader2, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/recommendations');
        setRecommendations(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load personalized recommendations.');
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) return (
    <div className="empty-state fade-in" style={{border: 'none'}}>
      <Loader2 className="empty-state-icon" style={{ animation: 'spin 2s linear infinite' }} />
      <p>Generating your personalized recommendations...</p>
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
        <h1 style={{ marginBottom: '8px' }}>Personalized Learning Path</h1>
        <p>Recommendations generated dynamically based on your recent quiz performance.</p>
      </div>

      {recommendations.length === 0 ? (
        <div className="empty-state">
          <Target className="empty-state-icon" />
          <h3>No recommendations yet</h3>
          <p>Complete a course and take a quiz to generate your personalized learning path.</p>
          <Link to="/courses" className="btn primary-btn mt-2">Take a course</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {recommendations.map((rec) => (
            <div key={rec.id} className="card fade-in" style={{ 
              borderTop: `4px solid ${
                rec.recommendation_type === 'beginner' ? 'var(--error)' : 
                rec.recommendation_type === 'practice' ? 'var(--warning)' : 'var(--success)'
              }`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>{rec.topic}</h3>
                <span className={`badge ${
                  rec.recommendation_type === 'beginner' ? 'danger-bg' : 
                  rec.recommendation_type === 'practice' ? 'warning-bg' : 'success-bg'
                }`}>
                  {rec.recommendation_type === 'beginner' ? 'Revision Needed' :
                   rec.recommendation_type === 'practice' ? 'Practice More' : 'Advanced Learning'}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', backgroundColor: 'var(--background)', padding: '16px', borderRadius: '8px' }}>
                {rec.recommendation_type === 'beginner' ? <AlertTriangle size={20} color="var(--error)" style={{ flexShrink: 0 }} /> : 
                 rec.recommendation_type === 'practice' ? <BookOpen size={20} color="var(--warning)" style={{ flexShrink: 0 }} /> :
                 <Sparkles size={20} color="var(--success)" style={{ flexShrink: 0 }} />}
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{rec.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
