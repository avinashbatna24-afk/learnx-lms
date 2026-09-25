import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ChevronLeft, Plus, Save, Trash2 } from 'lucide-react';

const QuizBuilder = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Question Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [qType, setQType] = useState('MCQ');
  const [qText, setQText] = useState('');
  const [qMarks, setQMarks] = useState(1);
  const [qExplanation, setQExplanation] = useState('');
  const [options, setOptions] = useState([
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false }
  ]);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quizzes/${id}`);
      setQuiz(res.data.data);
      setQuestions(res.data.data.questions || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    if (field === 'is_correct' && qType === 'MCQ') {
      newOptions.forEach(o => o.is_correct = false); // Single correct
    }
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '', is_correct: false }]);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/quizzes/${id}/questions`, {
        question_text: qText,
        question_type: qType,
        marks: qMarks,
        explanation: qExplanation,
        options: options.filter(o => o.text.trim() !== '')
      });
      setShowAddForm(false);
      
      // Reset form
      setQText('');
      setQExplanation('');
      setOptions([{ text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }]);
      
      fetchQuiz();
    } catch (err) {
      alert('Failed to save question');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Link to={`/instructor/courses/${quiz.course_id}/build`} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none' }}>
          <ChevronLeft size={20} /> Back to Course Builder
        </Link>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <h2>Quiz Builder: {quiz.title}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{quiz.description}</p>
        <p><strong>Total Questions:</strong> {questions.length}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
        {questions.map((q, idx) => (
          <div key={q.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h4>Question {idx + 1}</h4>
              <span className="badge warning-bg">{q.question_type}</span>
            </div>
            <p style={{ fontSize: '1.1rem', margin: '12px 0' }}>{q.question_text}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {q.options?.map((opt, oIdx) => (
                <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: opt.is_correct ? 'rgba(76, 175, 80, 0.1)' : 'var(--background)', borderRadius: '4px', border: opt.is_correct ? '1px solid var(--success)' : '1px solid var(--border)' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: q.question_type === 'MCQ' ? '50%' : '4px', border: '1px solid var(--border)', backgroundColor: opt.is_correct ? 'var(--success)' : 'transparent' }}></div>
                  <span>{opt.option_text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!showAddForm ? (
        <button className="btn secondary-btn w-100" style={{ padding: '16px', border: '2px dashed var(--border)', backgroundColor: 'transparent' }} onClick={() => setShowAddForm(true)}>
          <Plus size={20} /> Add New Question
        </button>
      ) : (
        <div className="card fade-in">
          <h3>Add Question</h3>
          <form onSubmit={handleSaveQuestion}>
            <div className="form-group">
              <label>Question Type</label>
              <select value={qType} onChange={e => setQType(e.target.value)}>
                <option value="MCQ">Multiple Choice (Single Correct)</option>
                <option value="MRQ">Multiple Response (Multiple Correct)</option>
                <option value="TF">True / False</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Question Text</label>
              <textarea value={qText} onChange={e => setQText(e.target.value)} rows="3" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Marks</label>
                <input type="number" value={qMarks} onChange={e => setQMarks(Number(e.target.value))} min="1" required />
              </div>
            </div>

            <div className="form-group">
              <label>Options</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                {options.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input 
                      type={qType === 'MCQ' ? "radio" : "checkbox"} 
                      checked={opt.is_correct} 
                      onChange={(e) => handleOptionChange(idx, 'is_correct', e.target.checked)}
                      name="correct_option"
                      style={{ width: '24px', height: '24px' }}
                    />
                    <input 
                      type="text" 
                      value={opt.text} 
                      onChange={(e) => handleOptionChange(idx, 'text', e.target.value)} 
                      placeholder={`Option ${idx + 1}`}
                      style={{ flex: 1 }}
                    />
                  </div>
                ))}
              </div>
              <button type="button" className="btn secondary-btn btn-sm" onClick={addOption}>+ Add Another Option</button>
            </div>

            <div className="form-group">
              <label>Explanation (Optional)</label>
              <textarea value={qExplanation} onChange={e => setQExplanation(e.target.value)} rows="2" placeholder="Shown to students after quiz" />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn secondary-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn primary-btn"><Save size={16} /> Save Question</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default QuizBuilder;
