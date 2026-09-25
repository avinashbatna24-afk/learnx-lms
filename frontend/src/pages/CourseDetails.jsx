import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching course details:', err);
        setError('Failed to load course details. It might have been removed.');
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    setEnrollError('');
    
    try {
      await api.post(`/courses/${id}/enroll`);
      navigate(`/learn/${id}`);
    } catch (err) {
      // If already enrolled (400), redirect to learning page
      if (err.response?.status === 400 && err.response?.data?.message.includes('Already enrolled')) {
        navigate(`/learn/${id}`);
      } else {
        setEnrollError(err.response?.data?.message || 'Failed to enroll in course');
        setEnrolling(false);
      }
    }
  };

  if (loading) return <div className="loading">Loading course details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!course) return <div className="error-message">Course not found.</div>;

  return (
    <div className="course-details-container">
      <div className="course-header card">
        <h1>{course.title}</h1>
        <p className="course-meta">
          <span className="category">{course.category}</span> | 
          <span className="difficulty">{course.difficulty}</span>
        </p>
        <p className="description">{course.description}</p>
        
        {enrollError && <div className="error-message mt-2">{enrollError}</div>}
        
        {user?.role !== 'instructor' && (
          <button 
            className="btn primary-btn btn-lg mt-4" 
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? 'Enrolling...' : 'Enroll Now'}
          </button>
        )}
      </div>

      <div className="course-content mt-4">
        <h2>Course Modules</h2>
        {course.modules && course.modules.length > 0 ? (
          <div className="modules-list">
            {course.modules.map((module, idx) => (
              <div key={module.id} className="module-card card mt-2">
                <h3>Module {idx + 1}: {module.title}</h3>
                <p>{module.description}</p>
                {module.lessons && module.lessons.length > 0 ? (
                  <ul className="lessons-list">
                    {module.lessons.map((lesson, lIdx) => (
                      <li key={lesson.id} className="lesson-item">
                        <span>{lIdx + 1}. {lesson.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-state-small">No lessons in this module yet.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No modules have been added to this course yet.</p>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
