import React, { useEffect, useState } from 'react';
import { getImpactStats } from '../services/api';
import { Link } from 'react-router-dom';
import { Utensils, Users, ArrowRight, Truck } from 'lucide-react';

export const Home: React.FC = () => {
  const [stats, setStats] = useState({ totalDonations: 0, totalUsers: 0, mealsSaved: 0 });

  useEffect(() => {
    getImpactStats()
      .then(res => setStats(res.data))
      .catch(err => console.error("Could not load stats", err));
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ textAlign: 'center', margin: '4rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1>End Hunger. Share Hope.</h1>
        <p style={{ maxWidth: '600px', fontSize: '1.25rem', marginTop: '1rem' }}>
          Join the movement to rescue surplus food and deliver it to those in need. 
          Our AI-powered platform connects donors, NGOs, and volunteers seamlessly.
        </p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <Link to="/register" className="btn btn-primary">
            Start Donating <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Partner NGO Login
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3">
        <div className="glass-panel stat-card">
          <Utensils size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <div className="stat-value">{stats.totalDonations}</div>
          <div className="stat-label">Total Donations</div>
        </div>
        <div className="glass-panel stat-card">
          <Truck size={48} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
          <div className="stat-value">{stats.mealsSaved}</div>
          <div className="stat-label">Meals Saved</div>
        </div>
        <div className="glass-panel stat-card">
          <Users size={48} color="#8b5cf6" style={{ margin: '0 auto 1rem' }} />
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Active Users</div>
        </div>
      </div>
      
      <div className="glass-panel" style={{ marginTop: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>How It Works</h2>
        <div className="grid grid-cols-3">
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>1</span>
            </div>
            <h3>Donate</h3>
            <p>Restaurants & individuals list excess food on our platform instantly.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.5rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>2</span>
            </div>
            <h3>Match</h3>
            <p>NGOs claim the food, and our AI assigns the nearest available truck.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1.5rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>3</span>
            </div>
            <h3>Deliver</h3>
            <p>Real-time logistics ensure safe, timely delivery to those who need it.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
