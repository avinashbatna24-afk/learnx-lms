import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BookX, BookOpen, Clock, Loader2 } from 'lucide-react';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return (
    <div className="empty-state fade-in" style={{border: 'none'}}>
      <Loader2 className="empty-state-icon" style={{ animation: 'spin 2s linear infinite' }} />
      <p>Loading courses...</p>
    </div>
  );
  
  if (error) return (
    <div className="card fade-in mt-8" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error)', padding: '24px', border: 'none', textAlign: 'center' }}>
      {error}
    </div>
  );

  return (
    <div className="course-catalog fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Course Catalog</h1>
          <p>Explore our wide range of personalized courses.</p>
        </div>
      </div>
      
      {courses.length === 0 ? (
        <div className="empty-state fade-in">
          <BookX className="empty-state-icon" />
          <h3>No courses available yet</h3>
          <p>Courses will appear here when instructors publish them.</p>
          <Link to="/dashboard" className="btn secondary-btn">Go to Dashboard</Link>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map(course => (
            <div key={course.id} className="card course-card fade-in">
              <div className="course-thumbnail">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} />
                ) : (
                  <div className="placeholder-thumbnail">{course.title.charAt(0)}</div>
                )}
              </div>
              <div className="course-card-content">
                <div style={{ marginBottom: '12px' }}>
                  <span className="badge badge-secondary">{course.category || 'General'}</span>
                </div>
                <h3>{course.title}</h3>
                <p>{course.description?.substring(0, 100)}...</p>
                
                <div className="course-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge" style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>
                    {course.difficulty || 'Beginner'}
                  </span>
                  <Link to={`/courses/${course.id}`} className="btn primary-btn btn-sm">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
