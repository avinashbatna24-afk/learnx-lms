import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, GripVertical, Settings, Trash2, ChevronLeft, Eye, Send, FileText, File, Link2, Edit3, HelpCircle } from 'lucide-react';

const CourseBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  // Content Modal State
  const [activeModal, setActiveModal] = useState(null); // 'lesson', 'material', 'resource', 'assignment'
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [contentForm, setContentForm] = useState({});

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data.data);
      
      const contentRes = await api.get(`/courses/${id}/content`);
      setModules(contentRes.data.data);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load course builder: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle) return;
    
    try {
      await api.post(`/courses/${id}/modules`, { title: newModuleTitle, description: newModuleDesc });
      setNewModuleTitle('');
      setNewModuleDesc('');
      setShowAddModule(false);
      fetchCourseData();
    } catch (err) {
      alert('Failed to add module');
    }
  };

  const openContentModal = (type, moduleId) => {
    setActiveModal(type);
    setActiveModuleId(moduleId);
    setContentForm({});
  };

  const closeContentModal = () => {
    setActiveModal(null);
    setActiveModuleId(null);
    setContentForm({});
  };

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeModal === 'lesson') {
        await api.post(`/modules/${activeModuleId}/lessons`, contentForm);
      } else if (activeModal === 'material') {
        await api.post(`/modules/${activeModuleId}/materials`, { ...contentForm, course_id: course.id });
      } else if (activeModal === 'resource') {
        const formData = new FormData();
        formData.append('course_id', course.id);
        formData.append('title', contentForm.title || '');
        formData.append('description', contentForm.description || '');
        formData.append('resource_type', contentForm.resource_type || '');
        formData.append('source_type', contentForm.source_type || 'FILE');
        
        if (contentForm.source_type === 'EXTERNAL_LINK') {
          formData.append('external_url', contentForm.external_url || '');
        } else if (contentForm.file) {
          formData.append('file', contentForm.file);
        }
        
        await api.post(`/modules/${activeModuleId}/resources`, formData);
      } else if (activeModal === 'quiz') {
        const res = await api.post(`/quizzes`, { ...contentForm, course_id: course.id, module_id: activeModuleId });
        // Redirect to Quiz Builder after creating quiz
        navigate(`/instructor/quizzes/${res.data.data.id}/build`);
        return;
      }
      
      closeContentModal();
      fetchCourseData();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to add ${activeModal}`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Client-side size validation (25MB)
    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds the 25 MB limit.');
      return;
    }
    
    setContentForm({ ...contentForm, file });
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module and all its content?')) {
      try {
        await api.delete(`/modules/${moduleId}`);
        fetchCourseData();
      } catch (err) {
        alert('Failed to delete module');
      }
    }
  };

  const handlePublish = async () => {
    try {
      await api.put(`/courses/${id}`, { ...course, status: 'PUBLISHED' });
      alert('Course published successfully!');
      fetchCourseData();
    } catch (err) {
      alert('Failed to publish course');
    }
  };

  if (loading) return <div className="loading">Loading course builder...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Link to="/instructor/courses" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none' }}>
          <ChevronLeft size={20} /> Back to Courses
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ margin: 0 }}>{course.title}</h1>
            <span className={`badge ${course.status === 'PUBLISHED' ? 'success-bg' : 'warning-bg'}`}>
              {course.status}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{course.course_code} • {course.department} • {course.credits} Credits</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn secondary-btn"><Eye size={18} /> Preview</button>
          <button className="btn primary-btn" onClick={handlePublish} disabled={course.status === 'PUBLISHED'}>
            <Send size={18} /> Publish Course
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Course Content</h2>
        
        {modules.length === 0 ? (
          <div className="empty-state">
            <Settings className="empty-state-icon" />
            <h3>No modules yet</h3>
            <p>Start building your course by adding your first module.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {modules.map((module, index) => (
              <div key={module.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'var(--background)', padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <GripVertical size={20} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />
                    <h3 style={{ margin: 0 }}>Module {index + 1}: {module.title}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-sm secondary-btn"><Edit3 size={16} /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteModule(module.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
                
                <div style={{ padding: '24px' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{module.description}</p>
                  
                  {/* Content List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    {module.lessons?.map(lesson => (
                      <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                        <FileText size={18} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 500 }}>Lesson: {lesson.title}</span>
                      </div>
                    ))}
                    {module.materials?.map(mat => (
                      <div key={mat.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                        <File size={18} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 500 }}>Material: {mat.title}</span>
                      </div>
                    ))}
                    {module.resources?.map(res => (
                      <div key={res.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                        <Link2 size={18} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 500 }}>Resource: {res.title}</span>
                      </div>
                    ))}
                    {module.assignments?.map(ass => (
                      <div key={ass.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                        <Edit3 size={18} style={{ color: 'var(--warning)' }} />
                        <span style={{ fontWeight: 500 }}>Assignment: {ass.title}</span>
                      </div>
                    ))}
                    {module.quizzes?.map(quiz => (
                      <div key={quiz.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                        <HelpCircle size={18} style={{ color: 'var(--success)' }} />
                        <span style={{ fontWeight: 500 }}>Quiz: {quiz.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* Add Content Toolbar */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <button className="btn secondary-btn btn-sm" onClick={() => openContentModal('lesson', module.id)}><Plus size={16} /> Add Lesson</button>
                    <button className="btn secondary-btn btn-sm" onClick={() => openContentModal('material', module.id)}><Plus size={16} /> Add Material</button>
                    <button className="btn secondary-btn btn-sm" onClick={() => openContentModal('resource', module.id)}><Plus size={16} /> Add Resource</button>
                    <button className="btn secondary-btn btn-sm" onClick={() => openContentModal('assignment', module.id)}><Plus size={16} /> Add Assignment</button>
                    <button className="btn secondary-btn btn-sm" onClick={() => openContentModal('quiz', module.id)}><Plus size={16} /> Add Quiz</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!showAddModule ? (
        <button className="btn secondary-btn w-100" style={{ padding: '16px', border: '2px dashed var(--border)', backgroundColor: 'transparent' }} onClick={() => setShowAddModule(true)}>
          <Plus size={20} /> Add New Module
        </button>
      ) : (
        <div className="card fade-in">
          <h3>Add New Module</h3>
          <form onSubmit={handleAddModule}>
            <div className="form-group">
              <label>Module Title</label>
              <input type="text" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} required placeholder="e.g. Introduction to React" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={newModuleDesc} onChange={e => setNewModuleDesc(e.target.value)} rows="2" placeholder="Briefly describe this module" />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn secondary-btn" onClick={() => setShowAddModule(false)}>Cancel</button>
              <button type="submit" className="btn primary-btn">Save Module</button>
            </div>
          </form>
        </div>
      )}
    {/* Content Modal Overlays */}
      {activeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Add New {activeModal.charAt(0).toUpperCase() + activeModal.slice(1)}</h3>
            <form onSubmit={handleContentSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={contentForm.title || ''} onChange={e => setContentForm({...contentForm, title: e.target.value})} required />
              </div>
              
              {(activeModal === 'material' || activeModal === 'resource' || activeModal === 'assignment') && (
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={contentForm.description || ''} onChange={e => setContentForm({...contentForm, description: e.target.value})} rows="2" />
                </div>
              )}

              {activeModal === 'lesson' && (
                <>
                  <div className="form-group">
                    <label>Video URL</label>
                    <input type="url" value={contentForm.video_url || ''} onChange={e => setContentForm({...contentForm, video_url: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Content (Text)</label>
                    <textarea value={contentForm.content || ''} onChange={e => setContentForm({...contentForm, content: e.target.value})} rows="4" />
                  </div>
                </>
              )}

              {activeModal === 'material' && (
                <>
                  <div className="form-group">
                    <label>Material Type</label>
                    <input type="text" value={contentForm.material_type || ''} onChange={e => setContentForm({...contentForm, material_type: e.target.value})} placeholder="e.g. PDF, Slide" />
                  </div>
                  <div className="form-group">
                    <label>File URL</label>
                    <input type="url" value={contentForm.file_url || ''} onChange={e => setContentForm({...contentForm, file_url: e.target.value})} required />
                  </div>
                </>
              )}

              {activeModal === 'resource' && (
                <>
                  <div className="form-group">
                    <label>Resource Type</label>
                    <select 
                      value={contentForm.resource_type || ''} 
                      onChange={e => setContentForm({...contentForm, resource_type: e.target.value})}
                      required
                    >
                      <option value="">Select a type...</option>
                      <option value="Study Material">Study Material</option>
                      <option value="Lecture Notes">Lecture Notes</option>
                      <option value="PDF">PDF</option>
                      <option value="Presentation">Presentation</option>
                      <option value="Document">Document</option>
                      <option value="Lab Manual">Lab Manual</option>
                      <option value="Reference Material">Reference Material</option>
                      <option value="Video">Video</option>
                      <option value="External Link">External Link</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Resource Source</label>
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                        <input 
                          type="radio" 
                          name="source_type" 
                          checked={(!contentForm.source_type || contentForm.source_type === 'FILE')} 
                          onChange={() => setContentForm({...contentForm, source_type: 'FILE'})}
                        /> Upload File
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                        <input 
                          type="radio" 
                          name="source_type" 
                          checked={contentForm.source_type === 'EXTERNAL_LINK'} 
                          onChange={() => setContentForm({...contentForm, source_type: 'EXTERNAL_LINK'})}
                        /> External Link
                      </label>
                    </div>
                  </div>

                  {(!contentForm.source_type || contentForm.source_type === 'FILE') ? (
                    <div className="form-group">
                      <label>Upload Resource File</label>
                      <div 
                        style={{ 
                          border: '2px dashed var(--border)', 
                          borderRadius: '8px', 
                          padding: '32px', 
                          textAlign: 'center',
                          backgroundColor: 'var(--background)',
                          position: 'relative'
                        }}
                      >
                        <input 
                          type="file" 
                          onChange={handleFileChange} 
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.jpg,.jpeg,.png,.webp,.txt,.csv"
                          style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'
                          }}
                        />
                        <div style={{ pointerEvents: 'none' }}>
                          <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>📁</span>
                          <p style={{ fontWeight: 600, marginBottom: '8px' }}>Drag & Drop your file here</p>
                          <p style={{ margin: '8px 0' }}>OR</p>
                          <span className="btn secondary-btn btn-sm">Choose File</span>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '16px' }}>
                            PDF, PPT, DOC, XLS, ZIP, Images (Max: 25MB)
                          </p>
                        </div>
                      </div>
                      {contentForm.file && (
                        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--background)', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontWeight: 500, margin: 0 }}>{contentForm.file.name}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{(contentForm.file.size / (1024*1024)).toFixed(2)} MB</p>
                          </div>
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => setContentForm({...contentForm, file: null})}>Remove</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Resource URL</label>
                      <input 
                        type="url" 
                        value={contentForm.external_url || ''} 
                        onChange={e => setContentForm({...contentForm, external_url: e.target.value})} 
                        placeholder="https://..." 
                        required 
                      />
                    </div>
                  )}
                </>
              )}

              {activeModal === 'assignment' && (
                <>
                  <div className="form-group">
                    <label>Instructions</label>
                    <textarea value={contentForm.instructions || ''} onChange={e => setContentForm({...contentForm, instructions: e.target.value})} rows="2" required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Total Marks</label>
                      <input type="number" value={contentForm.total_marks || ''} onChange={e => setContentForm({...contentForm, total_marks: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Submission Type</label>
                      <input type="text" value={contentForm.submission_type || ''} onChange={e => setContentForm({...contentForm, submission_type: e.target.value})} placeholder="e.g. File, Text" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label>Start Date</label>
                      <input type="date" value={contentForm.start_date || ''} onChange={e => setContentForm({...contentForm, start_date: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Due Date</label>
                      <input type="date" value={contentForm.due_date || ''} onChange={e => setContentForm({...contentForm, due_date: e.target.value})} />
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'quiz' && (
                <>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={contentForm.description || ''} onChange={e => setContentForm({...contentForm, description: e.target.value})} rows="2" />
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    After saving, you will be taken to the Quiz Builder to add questions and configure settings.
                  </p>
                </>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn secondary-btn" onClick={closeContentModal}>Cancel</button>
                <button type="submit" className="btn primary-btn">Save Content</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBuilder;
