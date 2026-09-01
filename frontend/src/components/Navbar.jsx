import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalCount, setIsDrawerOpen } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dresses', path: '/dresses' },
    { name: 'Jewellery', path: '/jewellery' },
    { name: 'Makeup', path: '/makeup' },
    { name: 'Dress Analyzer', path: '/analyzer' },
    { name: 'AI Stylist', path: '/stylist' },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(12, 7, 14, 0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(236, 72, 153, 0.15)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Glam<span style={{ color: 'var(--color-primary-light)', fontStyle: 'italic', fontFamily: 'var(--font-display)', textShadow: '0 0 15px rgba(236, 72, 153, 0.6)' }}>IQ</span>
          </span>
        </Link>

        {/* Center Pill Menu */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(26, 15, 30, 0.85)', padding: '0.35rem 0.5rem', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive ? 'btn-pill-active' : ''
              }
              style={({ isActive }) => ({
                padding: '0.5rem 1.15rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? '#ffffff' : '#d1c4d4',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              })}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Right Actions: Cart & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          
          {/* Shopping Cart Pill */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            style={{
              position: 'relative',
              background: 'rgba(36, 20, 42, 0.85)',
              border: '1px solid rgba(236, 72, 153, 0.25)',
              color: '#ffffff',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            title="View Cart"
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.25)')}
          >
            <span style={{ fontSize: '1.15rem' }}>🛒</span>
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'linear-gradient(135deg, #f472b6, #db2777)',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(219, 39, 119, 0.6)',
              }}
            >
              {totalCount}
            </span>
          </button>

          {/* User Auth / Profile Pill */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="btn btn-primary"
                style={{
                  padding: '0.5rem 1.15rem',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>👤</span>
                <span>{user?.full_name?.split(' ')[0] || 'Profile'}</span>
                <span style={{ fontSize: '0.7rem' }}>▼</span>
              </button>

              {showUserMenu && (
                <div
                  className="glass-card animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '200px',
                    padding: '0.5rem',
                    zIndex: 60,
                  }}
                >
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'block',
                      padding: '0.65rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    ✨ My Styling DNA
                  </Link>
                  <Link
                    to="/analyzer"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'block',
                      padding: '0.65rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    👗 My Outfits Lookbook
                  </Link>
                  <hr style={{ borderColor: 'rgba(236, 72, 153, 0.15)', margin: '0.35rem 0' }} />
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      navigate('/');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      padding: '0.65rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      color: '#f87171',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary"
              style={{
                padding: '0.55rem 1.4rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>♥</span>
              <span>Login</span>
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}
