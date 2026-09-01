import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Analyzer() {
  const [searchParams] = useSearchParams();
  const outfitIdFromUrl = searchParams.get('outfit_id');
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const fileInputRef = useRef(null);

  const [outfits, setOutfits] = useState([]);
  const [selectedOutfitId, setSelectedOutfitId] = useState(outfitIdFromUrl ? parseInt(outfitIdFromUrl) : null);
  const [currentOutfit, setCurrentOutfit] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [addedItem, setAddedItem] = useState(null);

  // Load wardrobe outfits
  useEffect(() => {
    if (isAuthenticated) {
      loadWardrobe();
    }
  }, [isAuthenticated]);

  const loadWardrobe = async () => {
    try {
      const res = await client.get('/outfits');
      const list = res.data.outfits || [];
      setOutfits(list);
      if (!selectedOutfitId && list.length > 0) {
        setSelectedOutfitId(list[0].outfit_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // When selected outfit changes, fetch styling suggestions
  useEffect(() => {
    if (selectedOutfitId) {
      fetchAnalysis(selectedOutfitId);
    }
  }, [selectedOutfitId]);

  const fetchAnalysis = async (id) => {
    setLoading(true);
    setError('');
    try {
      const [recRes, outfitRes] = await Promise.all([
        client.get(`/style-suggestions/${id}`),
        client.get(`/outfits/${id}`),
      ]);
      setRecommendation(recRes.data);
      setCurrentOutfit(outfitRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to generate styling analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleDressUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('style_type', 'casual');

    try {
      const res = await client.post('/outfits', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await loadWardrobe();
      setSelectedOutfitId(res.data.outfit_id);
    } catch (err) {
      console.error(err);
      setError('Failed to upload outfit. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddCart = (item) => {
    addToCart(item);
    setAddedItem(item.item_id || item.id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  const jewelryItems = recommendation?.items?.filter((i) => i.category === 'jewelry') || [];
  const makeupItems = recommendation?.items?.filter((i) => i.category === 'makeup') || [];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      
      {/* Header */}
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="badge-pill" style={{ marginBottom: '0.5rem' }}>
            🎨 AI Dress & Color Analyzer
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            Stylist <span className="gradient-text-italic">Lookbook & Suggestions</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginTop: '0.4rem' }}>
            Rule-based color harmony, metal pairings, and skin-tone matched jewelry & makeup.
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleDressUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
          >
            <span>✨</span>
            <span>{uploading ? 'Analyzing Image...' : '+ Upload New Dress'}</span>
          </button>
        </div>
      </div>

      {/* Wardrobe Selector Ribbon */}
      {outfits.length > 1 && (
        <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            👗 Your Looks:
          </span>
          {outfits.map((o) => (
            <button
              key={o.outfit_id}
              onClick={() => setSelectedOutfitId(o.outfit_id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                border: selectedOutfitId === o.outfit_id ? '1px solid #ec4899' : '1px solid rgba(236, 72, 153, 0.2)',
                background: selectedOutfitId === o.outfit_id ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(190, 24, 93, 0.5))' : 'rgba(36, 20, 42, 0.6)',
                color: '#ffffff',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              <img
                src={o.image_url}
                alt="outfit"
                style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span>Look #{o.outfit_id} ({o.color_palette || o.occasion_name || 'Dress'})</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fda4af', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '36px', height: '36px', borderTopColor: '#ec4899' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 600 }}>
            Curating Matching Kundan Jewelry & Makeup with AI...
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Analyzing color harmony and skin undertones
          </p>
        </div>
      ) : currentOutfit && recommendation ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '2.5rem', alignItems: 'start' }} className="analyzer-grid">
          
          {/* Left Column: Uploaded Dress Card */}
          <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
            <div style={{ position: 'relative', height: '420px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <img
                src={currentOutfit.image_url}
                alt="Analyzed Dress"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                className="badge-pill"
                style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(12, 7, 14, 0.9)' }}
              >
                {currentOutfit.occasion_name || 'Dress'}
              </span>
              <span
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  right: '14px',
                  background: 'rgba(212, 175, 55, 0.95)',
                  color: '#0c070e',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {currentOutfit.color_palette || 'Warm Gold'}
              </span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
              Outfit Profile
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(236, 72, 153, 0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>🎨 Detected Palette:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-accent-light)' }}>{currentOutfit.color_palette || 'Warm Gold'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(236, 72, 153, 0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>✨ Color Harmony:</span>
                <span style={{ fontWeight: 700, color: '#ffffff' }}>{recommendation.color_harmony}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(236, 72, 153, 0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>🧬 Skin Undertone:</span>
                <span style={{ fontWeight: 700, color: '#f472b6', textTransform: 'capitalize' }}>{user?.skin_tone || 'Medium'} Tone</span>
              </div>
            </div>

          </div>

          {/* Right Column: AI Rationale & Curated Product Cards */}
          <div>
            
            {/* AI Stylist Rationale Banner */}
            <div
              className="glass-card"
              style={{
                padding: '2rem',
                marginBottom: '2.5rem',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                background: 'linear-gradient(135deg, rgba(26, 15, 30, 0.95) 0%, rgba(46, 26, 53, 0.8) 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.3rem' }}>💡</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                  Virtual Stylist Rationale & Harmony
                </h3>
              </div>
              <p style={{ color: '#fce7f3', fontSize: '0.975rem', lineHeight: 1.75, fontStyle: 'italic' }}>
                "{recommendation.explanation}"
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(236, 72, 153, 0.15)' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent-light)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    💎 JEWELRY DIRECTION
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: 600 }}>
                    {recommendation.jewelry_suggestion}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f472b6', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    💄 MAKEUP PALETTE
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#ffffff', fontWeight: 600 }}>
                    {recommendation.makeup_suggestion}
                  </p>
                </div>
              </div>
            </div>

            {/* Curated Jewelry Pairings */}
            <div style={{ marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💎</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                  Curated Jewelry Pairings
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {jewelryItems.map((item) => {
                  const pkrPrice = (parseFloat(item.price) || 0) > 500 ? parseFloat(item.price) : (parseFloat(item.price) || 0) * 280;
                  return (
                    <div
                      key={item.item_id}
                      className="glass-card"
                      style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'rgba(36, 20, 42, 0.6)' }}
                    >
                      <div style={{ height: '180px', position: 'relative' }}>
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span className="badge-pill badge-gold" style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
                          {item.color}
                        </span>
                      </div>
                      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                          {item.item_name}
                        </h4>
                        <div>
                          <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-accent-light)', marginBottom: '0.75rem' }}>
                            Rs. {pkrPrice.toLocaleString()}
                          </p>
                          <button
                            onClick={() => handleAddCart(item)}
                            className="btn btn-gold"
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
                          >
                            {addedItem === item.item_id ? '✨ Added!' : '🛍️ Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Matching Makeup & Lip Color */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💄</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                  Matching Makeup & Lip Color
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {makeupItems.map((item) => {
                  const pkrPrice = (parseFloat(item.price) || 0) > 500 ? parseFloat(item.price) : (parseFloat(item.price) || 0) * 280;
                  return (
                    <div
                      key={item.item_id}
                      className="glass-card"
                      style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'rgba(36, 20, 42, 0.6)' }}
                    >
                      <div style={{ height: '180px', position: 'relative' }}>
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span className="badge-pill" style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
                          {item.color}
                        </span>
                      </div>
                      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                          {item.item_name}
                        </h4>
                        <div>
                          <p style={{ fontSize: '1rem', fontWeight: 800, color: '#f472b6', marginBottom: '0.75rem' }}>
                            Rs. {pkrPrice.toLocaleString()}
                          </p>
                          <button
                            onClick={() => handleAddCart(item)}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            {addedItem === item.item_id ? '✨ Added!' : '💄 Add to Cart'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="glass-card" style={{ padding: '5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1.25rem' }}>👗✨</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            No Outfit Selected
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Upload a dress photo or select a look from our catalog to get instant AI-matched jewelry & makeup.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
          >
            Upload Dress Photo
          </button>
        </div>
      )}

      {/* Responsive Style */}
      <style>{`
        @media (max-width: 900px) {
          .analyzer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
