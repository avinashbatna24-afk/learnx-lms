import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const EditCourse = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    course_code: '',
    description: '',
    category: '',
    department: '',
    semester: '',
    academic_year: '',
    credits: '',
    difficulty: 'Beginner',
    thumbnail: '',
    objectives: '',
    prerequisites: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        const course = response.data.data;
        setFormData({
          title: course.title || '',
          course_code: course.course_code || '',
          description: course.description || '',
          category: course.category || '',
          department: course.department || '',
          semester: course.semester || '',
          academic_year: course.academic_year || '',
          credits: course.credits || '',
          difficulty: course.difficulty || 'Beginner',
          thumbnail: course.thumbnail || '',
          objectives: course.objectives || '',
          prerequisites: course.prerequisites || ''
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load course details for editing.');
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.put(`/courses/${id}`, formData);
      navigate('/instructor/courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading course...</div>;

  return (
    <div className="form-container card mx-auto mt-4" style={{ maxWidth: '600px' }}>
      <h2>Edit Course</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="title">Course Title</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="course_code">Course Code</label>
            <input type="text" id="course_code" name="course_code" value={formData.course_code} onChange={handleChange} placeholder="e.g. CSE301" required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input type="text" id="department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science" />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="semester">Semester</label>
            <input type="text" id="semester" name="semester" value={formData.semester} onChange={handleChange} placeholder="e.g. III" />
          </div>
          <div className="form-group">
            <label htmlFor="academic_year">Academic Year</label>
            <input type="text" id="academic_year" name="academic_year" value={formData.academic_year} onChange={handleChange} placeholder="e.g. 2026-27" />
          </div>
          <div className="form-group">
            <label htmlFor="credits">Credits</label>
            <input type="number" id="credits" name="credits" value={formData.credits} onChange={handleChange} min="1" max="10" />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="objectives">Course Objectives</label>
          <textarea id="objectives" name="objectives" value={formData.objectives} onChange={handleChange} rows="2" placeholder="What will students learn?" />
        </div>

        <div className="form-group">
          <label htmlFor="prerequisites">Prerequisites</label>
          <textarea id="prerequisites" name="prerequisites" value={formData.prerequisites} onChange={handleChange} rows="2" placeholder="Required prior knowledge" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="thumbnail">Thumbnail URL</label>
            <input type="url" id="thumbnail" name="thumbnail" value={formData.thumbnail} onChange={handleChange} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button type="submit" className="btn primary-btn w-100" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" className="btn secondary-btn w-100" onClick={() => navigate(`/instructor/courses/${id}/build`)}>
            Go to Course Builder
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;
