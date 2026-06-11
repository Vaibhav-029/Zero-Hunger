import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import type { User } from '../services/api';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<User>({
    username: '',
    password: '',
    role: 'DONOR',
    email: '',
    contactNumber: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data || 'Registration failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Join the Cause</h2>
        {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input name="username" type="text" className="form-input" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-input" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-input" value={formData.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Number</label>
            <input name="contactNumber" type="text" className="form-input" value={formData.contactNumber} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <select name="role" className="form-input" value={formData.role} onChange={handleChange} style={{ appearance: 'none' }}>
              <option value="DONOR">Donor (Restaurant/Individual)</option>
              <option value="NGO">NGO (Food Distributor)</option>
              <option value="DRIVER">Driver (Logistics)</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Register
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: 0 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};
