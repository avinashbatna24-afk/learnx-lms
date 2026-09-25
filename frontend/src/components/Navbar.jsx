import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, User, LogOut, LayoutDashboard, TrendingUp, Compass, Target } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <BookOpen size={28} color="var(--primary)" />
        <Link to="/">LearnX</Link>
      </div>
      
      <div className="nav-links">
        <Link to="/courses" className={isActive('/courses')}><Compass size={18} style={{marginRight: 4, verticalAlign: 'text-bottom'}}/>Course Catalog</Link>
        {user && (
          <>
            {user.role === 'instructor' ? (
              <Link to="/instructor/courses" className={isActive('/instructor/courses')}><LayoutDashboard size={18} style={{marginRight: 4, verticalAlign: 'text-bottom'}}/>Manage Courses</Link>
            ) : (
              <>
                <Link to="/dashboard" className={isActive('/dashboard')}><LayoutDashboard size={18} style={{marginRight: 4, verticalAlign: 'text-bottom'}}/>Dashboard</Link>
                <Link to="/performance" className={isActive('/performance')}><TrendingUp size={18} style={{marginRight: 4, verticalAlign: 'text-bottom'}}/>Performance</Link>
                <Link to="/recommendations" className={isActive('/recommendations')}><Target size={18} style={{marginRight: 4, verticalAlign: 'text-bottom'}}/>Recommendations</Link>
              </>
            )}
          </>
        )}
      </div>

      <div className="nav-user">
        {user ? (
          <>
            <div className="user-greeting">
              <User size={18} style={{marginRight: 6, verticalAlign: 'text-bottom'}}/>
              Hi, {user.name}
            </div>
            <button onClick={handleLogout} className="btn btn-sm btn-danger">
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-sm secondary-btn">Login</Link>
            <Link to="/register" className="btn btn-sm primary-btn">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
