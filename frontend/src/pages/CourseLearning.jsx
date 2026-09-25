import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ChevronLeft, ChevronRight, Menu, X, CheckCircle, Circle, PlayCircle, FileText, Link2, Edit3, HelpCircle, File } from 'lucide-react';

const CourseLearning = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState(null); // { type: 'lesson', item: {} }
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data.data);
      
      const contentRes = await api.get(`/courses/${id}/content`);
      const fetchedModules = contentRes.data.data;
      setModules(fetchedModules);
      
      // Expand first module by default
      if (fetchedModules.length > 0) {
        setExpandedModules({ [fetchedModules[0].id]: true });
        // Set first lesson as active
        if (fetchedModules[0].lessons?.length > 0) {
          setActiveItem({ type: 'lesson', item: fetchedModules[0].lessons[0] });
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const selectItem = (type, item) => {
    setActiveItem({ type, item });
    // On mobile, close sidebar on selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDownloadResource = async (resourceId, fileName) => {
    try {
      const response = await api.get(`/resources/${resourceId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download file');
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'lesson': return <PlayCircle size={18} style={{ color: 'var(--primary)' }} />;
      case 'material': return <File size={18} style={{ color: 'var(--info)' }} />;
      case 'resource': return <Link2 size={18} style={{ color: 'var(--info)' }} />;
      case 'assignment': return <Edit3 size={18} style={{ color: 'var(--warning)' }} />;
      case 'quiz': return <HelpCircle size={18} style={{ color: 'var(--success)' }} />;
      default: return <FileText size={18} />;
    }
  };

  const renderMainContent = () => {
    if (!activeItem) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
          <h2>Welcome to {course?.title}</h2>
          <p>Select a module from the sidebar to begin learning.</p>
        </div>
      );
    }

    const { type, item } = activeItem;

    return (
      <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ marginBottom: '24px' }}>{item.title}</h1>
        
        {type === 'lesson' && (
          <div>
            {item.video_url && (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: '24px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                <iframe 
                  src={item.video_url} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  allowFullScreen
                />
              </div>
            )}
            <div className="card" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              {item.content || "No text content provided."}
            </div>
          </div>
        )}

        {type === 'material' && (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <File size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
            <h3>{item.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{item.description}</p>
            <span className="badge warning-bg" style={{ marginBottom: '24px', display: 'inline-block' }}>{item.material_type}</span>
            <div>
              <a href={item.file_url} target="_blank" rel="noreferrer" className="btn primary-btn">
                Download / View Material
              </a>
            </div>
          </div>
        )}

        {type === 'resource' && (
          <div className="card">
            <h3>{item.source_type === 'FILE' ? item.title : 'External Resource'}</h3>
            <p>{item.description}</p>
            <span className="badge success-bg" style={{ marginBottom: '16px', display: 'inline-block' }}>{item.resource_type}</span>
            <div style={{ padding: '16px', backgroundColor: 'var(--background)', borderRadius: '6px', border: '1px solid var(--border)' }}>
              {(!item.source_type || item.source_type === 'EXTERNAL_LINK') ? (
                <a href={item.external_url || item.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                  <Link2 size={20} /> Open Link in New Tab
                </a>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText size={24} style={{ color: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.original_file_name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {item.file_size ? (item.file_size / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown size'}
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn primary-btn btn-sm" 
                    onClick={() => handleDownloadResource(item.id, item.original_file_name)}
                  >
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {type === 'assignment' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span className="badge warning-bg">Total Marks: {item.total_marks}</span>
              {item.due_date && <span className="badge danger-bg">Due: {new Date(item.due_date).toLocaleDateString()}</span>}
            </div>
            <h3>Instructions</h3>
            <p style={{ whiteSpace: 'pre-line', marginBottom: '24px' }}>{item.instructions}</p>
            
            <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--background)' }}>
              <h4>Submit Assignment</h4>
              <textarea rows="4" placeholder="Enter your text submission here..." style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '16px' }}></textarea>
              <button className="btn primary-btn" onClick={() => alert('Phase E: Submission feature')}>Submit Assignment</button>
            </div>
          </div>
        )}

        {type === 'quiz' && (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <HelpCircle size={48} style={{ color: 'var(--success)', marginBottom: '16px' }} />
            <h3>{item.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{item.description}</p>
            <Link to={`/student/quizzes/${item.id}`} className="btn btn-lg primary-btn">
              Start Quiz
            </Link>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="loading">Loading course content...</div>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      
      {/* Sidebar Overlay (Mobile) */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          style={{ position: 'absolute', bottom: '24px', left: '24px', zIndex: 100, backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div style={{ 
        width: sidebarOpen ? '320px' : '0px', 
        backgroundColor: 'var(--card-bg)', 
        borderRight: '1px solid var(--border)', 
        transition: 'width 0.3s ease',
        overflowY: 'auto',
        overflowX: 'hidden',
        flexShrink: 0
      }}>
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Course Content</h3>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '0' }}>
          {modules.map((mod, mIdx) => (
            <div key={mod.id} style={{ borderBottom: '1px solid var(--border)' }}>
              {/* Module Header */}
              <div 
                onClick={() => toggleModule(mod.id)}
                style={{ padding: '16px', cursor: 'pointer', backgroundColor: expandedModules[mod.id] ? 'var(--background)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ fontWeight: 600 }}>Section {mIdx + 1}: {mod.title}</div>
              </div>
              
              {/* Module Content */}
              {expandedModules[mod.id] && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {mod.lessons?.map(l => (
                    <div 
                      key={`l-${l.id}`} 
                      onClick={() => selectItem('lesson', l)}
                      style={{ padding: '12px 16px 12px 32px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: activeItem?.item?.id === l.id && activeItem?.type === 'lesson' ? 'rgba(76, 175, 80, 0.1)' : 'transparent' }}
                    >
                      {renderIcon('lesson')}
                      <span style={{ fontSize: '0.95rem' }}>{l.title}</span>
                    </div>
                  ))}
                  {mod.materials?.map(m => (
                    <div 
                      key={`m-${m.id}`} 
                      onClick={() => selectItem('material', m)}
                      style={{ padding: '12px 16px 12px 32px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: activeItem?.item?.id === m.id && activeItem?.type === 'material' ? 'rgba(76, 175, 80, 0.1)' : 'transparent' }}
                    >
                      {renderIcon('material')}
                      <span style={{ fontSize: '0.95rem' }}>{m.title}</span>
                    </div>
                  ))}
                  {mod.resources?.map(r => (
                    <div 
                      key={`r-${r.id}`} 
                      onClick={() => selectItem('resource', r)}
                      style={{ padding: '12px 16px 12px 32px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: activeItem?.item?.id === r.id && activeItem?.type === 'resource' ? 'rgba(76, 175, 80, 0.1)' : 'transparent' }}
                    >
                      {renderIcon('resource')}
                      <span style={{ fontSize: '0.95rem' }}>{r.title}</span>
                    </div>
                  ))}
                  {mod.assignments?.map(a => (
                    <div 
                      key={`a-${a.id}`} 
                      onClick={() => selectItem('assignment', a)}
                      style={{ padding: '12px 16px 12px 32px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: activeItem?.item?.id === a.id && activeItem?.type === 'assignment' ? 'rgba(76, 175, 80, 0.1)' : 'transparent' }}
                    >
                      {renderIcon('assignment')}
                      <span style={{ fontSize: '0.95rem' }}>{a.title}</span>
                    </div>
                  ))}
                  {mod.quizzes?.map(q => (
                    <div 
                      key={`q-${q.id}`} 
                      onClick={() => selectItem('quiz', q)}
                      style={{ padding: '12px 16px 12px 32px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: activeItem?.item?.id === q.id && activeItem?.type === 'quiz' ? 'rgba(76, 175, 80, 0.1)' : 'transparent' }}
                    >
                      {renderIcon('quiz')}
                      <span style={{ fontSize: '0.95rem' }}>{q.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px', backgroundColor: 'var(--background)' }}>
        {renderMainContent()}
      </div>
    </div>
  );
};

export default CourseLearning;
