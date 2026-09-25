import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, CheckCircle, Target, AlertTriangle, Loader2, Lightbulb } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [topRec, setTopRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'instructor') {
      navigate('/instructor/courses');
      return;
    }

    const fetchMyCourses = async () => {
      try {
        const response = await api.get('/student/my-courses');
        const enrolledCourses = response.data.data;
        
        const coursesWithProgress = await Promise.all(
          enrolledCourses.map(async (c) => {
            try {
              const pRes = await api.get(`/student/courses/${c.id}/progress`);
              return { ...c, progress: pRes.data.data.progress };
            } catch {
              return { ...c, progress: 0 };
            }
          })
        );

        setCourses(coursesWithProgress);

        try {
          const perfRes = await api.get('/performance');
          setWeakTopics(perfRes.data.data.topics.weak.slice(0, 3)); 
          
          const recRes = await api.get('/recommendations');
          const recs = recRes.data.data;
          const urgentRec = recs.find(r => r.recommendation_type === 'beginner') || recs[0];
          setTopRec(urgentRec);
        } catch {}

        setLoading(false);
      } catch (err) {
        setError('Failed to load your dashboard.');
        setLoading(false);
      }
    };

    if (user) {
      fetchMyCourses();
    }
  }, [user, navigate]);

  if (loading) return (
    <div className="empty-state fade-in" style={{border: 'none'}}>
      <Loader2 className="empty-state-icon" style={{ animation: 'spin 2s linear infinite' }} />
      <p>Loading dashboard...</p>
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
        <h1 style={{ marginBottom: '8px' }}>Good morning, {user?.name} 👋</h1>
        <p>Continue your learning journey.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '12px' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Enrolled Courses</p>
            <h2 style={{ margin: 0 }}>{courses.length}</h2>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--success)', color: 'white', padding: '16px', borderRadius: '12px' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Completed</p>
            <h2 style={{ margin: 0 }}>{courses.filter(c => c.progress === 100).length}</h2>
          </div>
        </div>
      </div>

      <h2>Continue Learning</h2>
      {courses.length === 0 ? (
        <div className="empty-state mt-4">
          <BookOpen className="empty-state-icon" />
          <h3>You haven't enrolled in any courses yet</h3>
          <p>Explore the catalog to start learning.</p>
          <Link to="/courses" className="btn primary-btn mt-2">Browse Course Catalog</Link>
        </div>
      ) : (
        <div className="course-grid mt-4">
          {courses.map(course => (
            <div key={course.id} className="card course-card">
              <div className="course-thumbnail">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} />
                ) : (
                  <div className="placeholder-thumbnail">{course.title.charAt(0)}</div>
                )}
              </div>
              <div className="course-card-content">
                <h3>{course.title}</h3>
                <div className="progress-container mt-2">
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{course.progress || 0}%</span>
                </div>
                <div className="course-footer">
                  <Link to={`/learn/${course.id}`} className="btn primary-btn w-100 text-center btn-sm">
                    {course.progress === 0 ? 'Start Course' : 'Resume Course'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(weakTopics.length > 0 || topRec) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '40px' }}>
          {weakTopics.length > 0 && (
            <div className="card" style={{ backgroundColor: 'var(--error-bg)', borderColor: 'var(--error-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--error)' }}>
                <AlertTriangle size={24} />
                <h3 style={{ margin: 0, color: 'var(--error)' }}>Needs Review</h3>
              </div>
              <p style={{ color: 'var(--error)' }}>Based on your recent quiz scores, you should review these topics:</p>
              <ul style={{ listStyle: 'none', padding: 0, color: 'var(--error)' }}>
                {weakTopics.map((topic, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(220, 38, 38, 0.2)' }}>
                    <strong>{topic.topic}</strong> <span style={{ float: 'right' }}>{topic.percentage}%</span>
                  </li>
                ))}
              </ul>
              <Link to="/performance" className="btn btn-sm mt-4" style={{ backgroundColor: 'white', color: 'var(--error)' }}>View Full Analysis</Link>
            </div>
          )}

          {topRec && (
            <div className="card" style={{ backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#0369A1' }}>
                <Lightbulb size={24} />
                <h3 style={{ margin: 0, color: '#0369A1' }}>Top Recommendation</h3>
              </div>
              <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '16px' }}>
                <h4 style={{ color: '#0369A1', marginBottom: '4px' }}>{topRec.topic}</h4>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>{topRec.reason}</p>
              </div>
              <Link to="/recommendations" className="btn primary-btn btn-sm">View All Recommendations</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
