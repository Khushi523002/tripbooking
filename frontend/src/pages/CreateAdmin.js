import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createAdmin } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function CreateAdmin() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', adminSecret: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createAdmin(form);
      login(res.data);
      toast.success(`Admin account ready! Welcome, ${res.data.name} 🛡️`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🛡️ Create Admin</h1>
          <p>Set up an admin account with the secret key</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Admin name" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="admin@example.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Phone (optional)</label>
            <input type="tel" placeholder="+91 98765 43210"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Minimum 6 characters" required minLength={6}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Admin Secret Key</label>
            <input type="password" placeholder="Enter admin secret key" required
              value={form.adminSecret} onChange={e => setForm({ ...form, adminSecret: e.target.value })} />
          </div>
          <div className="admin-hint">
            💡 Tip: If the email already exists in the system, the user will be promoted to admin (no new account created).
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have admin access? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
