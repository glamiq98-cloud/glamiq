/**
 * Admin Login Page — Separate authentication portal for staff/administrators.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username_or_email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await client.post('/admin/auth/login', formData);
      // Store admin token in sessionStorage for administrative sessions
      sessionStorage.setItem('admin_token', res.data.access_token);
      sessionStorage.setItem('admin_username', res.data.username);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem',
          border: '1px solid rgba(201, 169, 110, 0.3)',
          background: 'linear-gradient(135deg, rgba(201, 169, 110, 0.05), rgba(15, 15, 20, 0.95))',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(201, 169, 110, 0.15)',
              border: '1px solid rgba(201, 169, 110, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              margin: '0 auto 1rem',
            }}
          >
            🛡️
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Admin <span className="gradient-text">Portal</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Sign in to manage catalog items, users & platform styling rules
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Username or Admin Email
            </label>
            <input
              type="text"
              name="username_or_email"
              value={formData.username_or_email}
              onChange={handleChange}
              placeholder="e.g. admin"
              required
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Admin Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.85rem',
              marginTop: '0.5rem',
              justifyContent: 'center',
              fontWeight: 600,
            }}
          >
            {loading ? 'Authenticating...' : 'Access Admin Dashboard →'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          Default demo credentials: <code>admin</code> / <code>admin12345</code>
        </div>
      </div>
    </div>
  );
}
