/**
 * Recommendations Page — AI-powered styling results, color harmony, jewelry & makeup breakdown.
 */

import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function Recommendations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const outfitId = searchParams.get('outfit_id');

  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState(null);
  const [outfit, setOutfit] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(outfitId ? 'current' : 'history');

  useEffect(() => {
    if (outfitId) {
      setActiveTab('current');
      fetchRecommendation(outfitId);
    } else {
      setActiveTab('history');
      fetchHistory();
    }
  }, [outfitId]);

  const fetchRecommendation = async (id) => {
    setLoading(true);
    setError('');
    try {
      const [recRes, outfitRes] = await Promise.all([
        client.get(`/style-suggestions/${id}`),
        client.get(`/outfits/${id}`),
      ]);
      setRecommendation(recRes.data);
      setOutfit(outfitRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to generate recommendations for this outfit.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/recommendations/history');
      setHistory(res.data.recommendations || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load styling history.');
    } finally {
      setLoading(false);
    }
  };

  const jewelryItems = recommendation?.items?.filter((i) => i.category === 'jewelry') || [];
  const makeupItems = recommendation?.items?.filter((i) => i.category === 'makeup') || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Header with Switcher Tabs */}
      <div
        className="animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Stylist <span className="gradient-text">Lookbook & Suggestions</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
            Rule-based color harmony, metal pairings, and skin-tone matched jewelry & makeup.
          </p>
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: 'flex',
            background: 'var(--color-bg-secondary)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          {outfitId && (
            <button
              onClick={() => setActiveTab('current')}
              className={activeTab === 'current' ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            >
              Current Look
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('history');
              fetchHistory();
            }}
            className={activeTab === 'history' ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
          >
            Past Looks ({history.length || '•'})
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            marginBottom: '2rem',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div className="spinner" style={{ width: '45px', height: '45px', margin: '0 auto 1.5rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Analyzing Color Harmony & Undertones…</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Matching jewelry metals and makeup shades from our curated catalog.
          </p>
        </div>
      ) : activeTab === 'current' && recommendation ? (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Main Hero Look Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(300px, 380px) 1fr',
              gap: '2.5rem',
            }}
          >
            {/* Left: Outfit Preview Card */}
            <div className="card" style={{ padding: '0', overflow: 'hidden', height: 'fit-content' }}>
              <div style={{ position: 'relative', height: '380px', backgroundColor: 'var(--color-bg-secondary)' }}>
                {outfit?.image_url ? (
                  <img
                    src={outfit.image_url}
                    alt="Current Look"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                    👗
                  </div>
                )}
                {outfit?.style_type && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'var(--color-primary-light)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {outfit.style_type}
                  </span>
                )}
                {outfit?.occasion_name && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'var(--color-primary)',
                      color: '#FFF',
                    }}
                  >
                    {outfit.occasion_name}
                  </span>
                )}
              </div>

              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Outfit Profile
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  <div>🎨 Palette: <strong style={{ color: 'var(--color-text)' }}>{outfit?.color_palette || 'General'}</strong></div>
                  <div>✨ Harmony: <strong style={{ color: 'var(--color-primary-light)' }}>{recommendation.color_harmony}</strong></div>
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      alert('Look link copied to clipboard! 📋');
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                  >
                    📋 Share Look
                  </button>
                  <Link
                    to="/outfits"
                    className="btn btn-ghost"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', textAlign: 'center' }}
                  >
                    Wardrobe
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: AI Stylist Verdict & Stated Reasoning */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Reasoning Box */}
              <div
                className="card"
                style={{
                  background: 'linear-gradient(135deg, rgba(183, 110, 121, 0.1), rgba(201, 169, 110, 0.05))',
                  border: '1px solid rgba(183, 110, 121, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>💡</span>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                    Virtual Stylist <span className="gradient-text">Rationale & Harmony</span>
                  </h2>
                </div>
                <p
                  style={{
                    fontSize: '1.05rem',
                    lineHeight: '1.7',
                    color: 'var(--color-text)',
                    fontStyle: 'normal',
                  }}
                >
                  "{recommendation.explanation}"
                </p>
              </div>

              {/* Suggestions Summary Pillars */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>💎</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      JEWELRY DIRECTION
                    </span>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--color-primary-light)' }}>
                    {recommendation.jewelry_suggestion}
                  </p>
                </div>

                <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>💄</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      MAKEUP PALETTE
                    </span>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--color-accent)' }}>
                    {recommendation.makeup_suggestion}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Catalog Matches: Jewelry Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.5rem' }}>💎</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Curated Jewelry Pairings</h2>
            </div>
            {jewelryItems.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No exact jewelry catalog items found.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {jewelryItems.map((item) => (
                  <div
                    key={item.item_id}
                    className="card"
                    style={{
                      padding: '0',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ height: '180px', backgroundColor: 'var(--color-bg-secondary)', overflow: 'hidden' }}>
                      <img
                        src={item.image_url}
                        alt={item.item_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4 }}>{item.item_name}</h4>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Tone: {item.color}</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>
                          ${item.price ? Number(item.price).toFixed(2) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Catalog Matches: Makeup Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.5rem' }}>💄</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Matching Makeup & Lip Color</h2>
            </div>
            {makeupItems.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No exact makeup catalog items found.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {makeupItems.map((item) => (
                  <div
                    key={item.item_id}
                    className="card"
                    style={{
                      padding: '0',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ height: '180px', backgroundColor: 'var(--color-bg-secondary)', overflow: 'hidden' }}>
                      <img
                        src={item.image_url}
                        alt={item.item_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4 }}>{item.item_name}</h4>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Shade: {item.color}</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>
                          ${item.price ? Number(item.price).toFixed(2) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History View */
        <div>
          {history.length === 0 ? (
            <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                No past recommendations yet
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                Upload an outfit from your wardrobe to see your first tailored recommendation!
              </p>
              <Link to="/outfits" className="btn btn-primary">
                Go to My Outfits
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {history.map((h) => (
                <div
                  key={h.rec_id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    navigate(`/recommendations?outfit_id=${h.outfit_id}`);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {new Date(h.generated_at).toLocaleDateString()}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        background: 'rgba(183, 110, 121, 0.2)',
                        color: 'var(--color-primary-light)',
                        fontWeight: 600,
                      }}
                    >
                      {h.color_harmony}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {h.jewelry_suggestion}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {h.makeup_suggestion}
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem', color: 'var(--color-primary-light)', fontSize: '0.85rem', fontWeight: 600 }}>
                    View Full Styling →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
