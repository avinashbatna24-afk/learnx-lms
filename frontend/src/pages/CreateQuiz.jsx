import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateQuiz = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: ''
  });
  const [questions, setQuestions] = useState([
    { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', topic: '' }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        setCourses(response.data.data);
      } catch (err) {
        setError('Failed to load courses.');
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, e) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][e.target.name] = e.target.value;
    setQuestions(updatedQuestions);
  };

  const addQuestionField = () => {
    setQuestions([...questions, { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', topic: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create Quiz
      const quizRes = await api.post('/quizzes', formData);
      const quizId = quizRes.data.data.id;

      // Add Questions
      for (let q of questions) {
        await api.post(`/quizzes/${quizId}/questions`, q);
      }

      navigate('/instructor/courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
      setLoading(false);
    }
  };

  return (
    <div className="form-container card mx-auto mt-4" style={{ maxWidth: '800px' }}>
      <h2>Create New Quiz</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="course_id">Select Course</label>
          <select id="course_id" name="course_id" value={formData.course_id} onChange={handleChange} required>
            <option value="">-- Select a Course --</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="title">Quiz Title</label>
          <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="2" />
        </div>

        <h3 className="mt-4">Questions</h3>
        {questions.map((q, index) => (
          <div key={index} className="card mt-2" style={{ backgroundColor: '#f9f9f9', padding: '15px' }}>
            <h4>Question {index + 1}</h4>
            <div className="form-group">
              <input type="text" name="question_text" placeholder="Question Text" value={q.question_text} onChange={(e) => handleQuestionChange(index, e)} required />
            </div>
            <div className="form-group">
              <input type="text" name="option_a" placeholder="Option A" value={q.option_a} onChange={(e) => handleQuestionChange(index, e)} required />
            </div>
            <div className="form-group">
              <input type="text" name="option_b" placeholder="Option B" value={q.option_b} onChange={(e) => handleQuestionChange(index, e)} required />
            </div>
            <div className="form-group">
              <input type="text" name="option_c" placeholder="Option C" value={q.option_c} onChange={(e) => handleQuestionChange(index, e)} required />
            </div>
            <div className="form-group">
              <input type="text" name="option_d" placeholder="Option D" value={q.option_d} onChange={(e) => handleQuestionChange(index, e)} required />
            </div>
            <div className="form-group">
              <label>Correct Option</label>
              <select name="correct_option" value={q.correct_option} onChange={(e) => handleQuestionChange(index, e)} required>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div className="form-group">
              <input type="text" name="topic" placeholder="Topic (optional for recommendations)" value={q.topic} onChange={(e) => handleQuestionChange(index, e)} />
            </div>
          </div>
        ))}
        
        <button type="button" onClick={addQuestionField} className="btn secondary-btn mt-2 mb-4 w-100">
          + Add Another Question
        </button>

        <button type="submit" className="btn primary-btn btn-lg w-100" disabled={loading}>
          {loading ? 'Creating...' : 'Create Quiz & Save Questions'}
        </button>
      </form>
    </div>
  );
};

export default CreateQuiz;
