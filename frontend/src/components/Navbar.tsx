import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, LogOut, User as UserIcon, Activity, CreditCard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <HeartHandshake color="#10b981" size={28} />
        <span>Zero Hunger AI</span>
      </Link>
      
      <div className="navbar-nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/pipeline" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Activity size={18} /> AI Logistics Pipeline
        </Link>
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc' }}>
              <UserIcon size={18} />
              <span style={{ fontSize: '0.875rem' }}>{user.username} ({user.role})</span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary">Join Us</Link>
          </>
        )}
        <a href="http://localhost:3005/donate" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', background: 'var(--brand-gradient)', color: 'white', border: 'none' }}>
          <CreditCard size={18} /> Fund Meals
        </a>
      </div>
    </nav>
  );
};
