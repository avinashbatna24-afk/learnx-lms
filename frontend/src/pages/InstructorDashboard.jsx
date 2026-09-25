import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit, Trash2, Loader2, BookOpen } from 'lucide-react';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        const allCourses = response.data.data;
        const myCourses = allCourses.filter(course => course.instructor_id === user.id);
        setCourses(myCourses);
        setLoading(false);
      } catch (err) {
        setError('Failed to load your courses.');
        setLoading(false);
      }
    };

    if (user && user.role === 'instructor') {
      fetchCourses();
    } else {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${courseId}`);
        setCourses(courses.filter(course => course.id !== courseId));
      } catch (err) {
        alert('Failed to delete course.');
      }
    }
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Instructor Dashboard</h1>
          <p>Manage your courses and learning materials.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/instructor/courses/new" className="btn primary-btn"><Plus size={18} /> Create Course</Link>
          <Link to="/instructor/quizzes/new" className="btn secondary-btn"><Plus size={18} /> Create Quiz</Link>
        </div>
      </div>
      
      {courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-state-icon" />
          <h3>You haven't created any courses yet</h3>
          <p>Start sharing your knowledge with the world.</p>
          <Link to="/instructor/courses/new" className="btn primary-btn mt-4">Create Your First Course</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'var(--background)' }}>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Course Title</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Difficulty</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 500 }}><Link to={`/courses/${course.id}`}>{course.title}</Link></td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className="badge badge-secondary">{course.category}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>{course.difficulty}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Link to={`/instructor/courses/${course.id}/edit`} className="btn secondary-btn btn-sm">
                          <Edit size={16} /> Edit
                        </Link>
                        <button onClick={() => handleDelete(course.id)} className="btn btn-danger btn-sm">
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
