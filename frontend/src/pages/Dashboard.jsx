/**
 * User Dashboard — Live overview of recent outfits, styling history, and quick actions.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentOutfits, setRecentOutfits] = useState([]);
  const [recentRecs, setRecentRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [outfitsRes, recsRes] = await Promise.all([
          client.get('/outfits'),
          client.get('/recommendations/history'),
        ]);
        setRecentOutfits(outfitsRes.data.outfits?.slice(0, 3) || []);
        setRecentRecs(recsRes.data.recommendations?.slice(0, 3) || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      icon: '👗',
      title: 'Upload Outfit',
      description: 'Upload a dress or ensemble to generate tailored jewelry & makeup looks',
      link: '/outfits',
      gradient: 'linear-gradient(135deg, rgba(183, 110, 121, 0.15), rgba(183, 110, 121, 0.05))',
    },
    {
      icon: '👤',
      title: 'Styling Profile',
      description: user?.skin_tone
        ? `Skin tone detected: ${user.skin_tone.toUpperCase()} • Adjust preferences`
        : 'Upload portrait photo for automatic skin undertone detection',
      link: '/profile',
      gradient: 'linear-gradient(135deg, rgba(201, 169, 110, 0.15), rgba(201, 169, 110, 0.05))',
    },
    {
      icon: '💎',
      title: 'Lookbook & History',
      description: 'Review color harmony analysis and past styled jewelry/makeup combos',
      link: '/recommendations',
      gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))',
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Welcome Section */}
      <div className="animate-fade-in" style={{ marginBottom: '3rem' }}>
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}
        >
          Welcome back,{' '}
          <span className="gradient-text">
            {user?.full_name?.split(' ')[0] || 'Fashion Stylist'}
          </span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.0625rem' }}>
          Ready to create your next coordinated fashion look?
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem',
        }}
      >
        {quickActions.map((action, i) => (
          <Link
            key={action.title}
            to={action.link}
            className="animate-slide-up"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              animationDelay: `${i * 100}ms`,
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            <div
              className="card"
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                cursor: 'pointer',
                background: action.gradient,
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                }}
              >
                {action.icon}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    marginBottom: '0.375rem',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {action.title}
                </h3>
                <p
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                  }}
                >
                  {action.description}
                </p>
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  color: 'var(--color-primary-light)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Get Started →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Styling History & Outfits */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {/* Left Column: Recent Styled Recommendations */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✨</span>
              <span>Recent Styled Looks</span>
            </h2>
            <Link to="/recommendations" style={{ fontSize: '0.85rem', color: 'var(--color-primary-light)', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto 0.5rem' }} />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Loading looks…</p>
            </div>
          ) : recentRecs.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderStyle: 'dashed' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.7 }}>💎</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>No styled looks yet</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Upload an outfit to get personalized jewelry and makeup suggestions.
              </p>
              <Link to="/outfits" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Style an Outfit
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentRecs.map((r) => (
                <Link
                  key={r.rec_id}
                  to={`/recommendations?outfit_id=${r.outfit_id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                        {r.jewelry_suggestion}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        {r.color_harmony}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
                      View Look →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Wardrobe Preview */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>👗</span>
              <span>Recent Wardrobe Uploads</span>
            </h2>
            <Link to="/outfits" style={{ fontSize: '0.85rem', color: 'var(--color-primary-light)', textDecoration: 'none' }}>
              View Wardrobe →
            </Link>
          </div>

          {loading ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto 0.5rem' }} />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Loading wardrobe…</p>
            </div>
          ) : recentOutfits.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderStyle: 'dashed' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: 0.7 }}>👗</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.35rem' }}>No outfits uploaded</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Add your favorite dress, gown, or suit to start styling.
              </p>
              <Link to="/outfits" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                + Add First Outfit
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {recentOutfits.map((o) => (
                <Link
                  key={o.outfit_id}
                  to={`/recommendations?outfit_id=${o.outfit_id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    className="card"
                    style={{
                      padding: '0',
                      overflow: 'hidden',
                      height: '140px',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={o.image_url}
                      alt="Outfit"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '0.5rem',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FFF' }}>
                        {o.occasion_name || o.style_type || 'Look'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
