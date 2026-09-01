/**
 * Register Page — full registration form with validation.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password, form.gender);
      navigate('/login', {
        state: { message: 'Account created! Please sign in.' },
      });
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed. Please try again.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(ellipse 50% 50% at 50% 0%, rgba(201, 169, 110, 0.06) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 30% 80%, rgba(183, 110, 121, 0.06) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />

      <div className="animate-slide-up" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '0.75rem',
            filter: 'drop-shadow(0 0 12px rgba(201, 169, 110, 0.3))',
          }}>✨</div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}>
            Join <span className="gradient-text">Glam IQ</span>
          </h1>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.9375rem',
          }}>
            Create your account and start styling with AI
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{
          padding: '2rem',
          background: 'var(--color-bg-elevated)',
        }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}>
            {/* Server Error */}
            {serverError && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--color-error)',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span>⚠</span> {serverError}
              </div>
            )}

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="register-name" className="form-label">Full Name</label>
              <input
                id="register-name"
                type="text"
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={handleChange('fullName')}
                autoComplete="name"
              />
              {errors.fullName && <span className="form-error">{errors.fullName}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="register-email" className="form-label">Email Address</label>
              <input
                id="register-email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Gender (optional) */}
            <div className="form-group">
              <label htmlFor="register-gender" className="form-label">
                Gender <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <select
                id="register-gender"
                className="form-input"
                value={form.gender}
                onChange={handleChange('gender')}
                style={{
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a1a1aa' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                }}
              >
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="register-password" className="form-label">Password</label>
              <input
                id="register-password"
                type="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange('password')}
                autoComplete="new-password"
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="register-confirm" className="form-label">Confirm Password</label>
              <input
                id="register-confirm"
                type="password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                marginTop: '0.5rem',
                fontSize: '1rem',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Creating Account…
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontSize: '0.9375rem',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
