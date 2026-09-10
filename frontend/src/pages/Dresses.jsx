import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';

export default function Dresses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionParam = searchParams.get('collection') || 'all';

  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [dresses, setDresses] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // AI Styles Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiStylesDress, setAiStylesDress] = useState(null);
  const [aiStylesData, setAiStylesData] = useState(null);
  const [aiStylesLoading, setAiStylesLoading] = useState(false);
  const [aiStylesError, setAiStylesError] = useState('');

  useEffect(() => {
    const fetchDresses = async () => {
      setLoadingCatalog(true);
      try {
        const res = await client.get('/catalog/items?category=dress');
        const apiDresses = res.data.map(item => ({
          id: item.item_id.toString(),
          item_id: item.item_id,
          item_name: item.item_name,
          category: item.category,
          style_type: item.style_type || 'formal',
          occasion: item.occasion || 'Formal',
          color: item.color || 'Custom',
          price: item.price || 0,
          image_url: item.image_url,
          description: item.description || '',
        }));
        setDresses(apiDresses);
      } catch (err) {
        console.error('Failed to fetch dresses catalog:', err);
      } finally {
        setLoadingCatalog(false);
      }
    };
    fetchDresses();
  }, []);

  const filteredDresses = dresses.filter((dress) => {
    // Collection Filter
    if (collectionParam === 'bridal') {
      const isBridal =
        dress.occasion.toLowerCase() === 'wedding' ||
        dress.item_name.toLowerCase().includes('bridal') ||
        dress.item_name.toLowerCase().includes('lehenga');
      if (!isBridal) return false;
    } else if (collectionParam === 'festive') {
      const isFestive =
        dress.occasion.toLowerCase() === 'festival' ||
        dress.occasion.toLowerCase() === 'party' ||
        dress.occasion.toLowerCase() === 'formal' ||
        dress.item_name.toLowerCase().includes('velvet') ||
        dress.item_name.toLowerCase().includes('kurti') ||
        dress.item_name.toLowerCase().includes('peshwas');
      if (!isFestive) return false;
    }

    const matchOccasion = selectedOccasion === 'all' || dress.occasion.toLowerCase() === selectedOccasion.toLowerCase();
    const matchColor = selectedColor === 'all' || dress.color.toLowerCase().includes(selectedColor.toLowerCase());
    return matchOccasion && matchColor;
  });

  const handleViewAiStyles = async (dress) => {
    setAiStylesDress(dress);
    setShowAiModal(true);
    setAiStylesData(null);
    setAiStylesError('');
    setAiStylesLoading(true);
    try {
      const res = await client.get(`/catalog/ai-styles/${dress.item_id}`);
      setAiStylesData(res.data);
    } catch (err) {
      console.error('AI Styles failed:', err);
      setAiStylesError(err.response?.data?.detail || 'Failed to generate AI styling recommendations. Please try again.');
    } finally {
      setAiStylesLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      
      {/* Header Banner */}
      <div className="animate-fade-in" style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <span className="badge-pill" style={{ marginBottom: '0.75rem' }}>
          👗 500+ Designer Pakistani Dresses
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>
          Pakistani Bridal & <span className="gradient-text-italic">Festive Dresses</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 1.5rem' }}>
          Browse handcrafted lehengas, silk formals, and organza peshwas. Click <strong>"Style with AI"</strong> on any dress to get instant matched jewelry & makeup suggestions.
        </p>

        {/* Collection Selector Tabs */}
        <div style={{ display: 'inline-flex', gap: '0.5rem', background: 'rgba(36, 20, 42, 0.8)', padding: '0.4rem', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(236, 72, 153, 0.25)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setSearchParams({})}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: collectionParam === 'all' ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'transparent',
              color: '#ffffff',
              transition: 'all 0.2s',
            }}
          >
            All Dresses
          </button>
          <button
            onClick={() => setSearchParams({ collection: 'bridal' })}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: collectionParam === 'bridal' ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'transparent',
              color: '#ffffff',
              transition: 'all 0.2s',
            }}
          >
            👑 Pakistani Bridal Lehengas
          </button>
          <button
            onClick={() => setSearchParams({ collection: 'festive' })}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: collectionParam === 'festive' ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'transparent',
              color: '#ffffff',
              transition: 'all 0.2s',
            }}
          >
            ✨ Festive & Velvet Formals
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Occasion Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Occasion:</span>
          {['all', 'Wedding', 'Festival', 'Party', 'Formal', 'Date Night'].map((occ) => (
            <button
              key={occ}
              onClick={() => setSelectedOccasion(occ)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedOccasion === occ ? '1px solid #ec4899' : '1px solid rgba(236, 72, 153, 0.2)',
                background: selectedOccasion === occ ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(190, 24, 93, 0.5))' : 'rgba(36, 20, 42, 0.6)',
                color: '#ffffff',
                transition: 'all 0.2s ease',
              }}
            >
              {occ === 'all' ? 'All Occasions' : occ}
            </button>
          ))}
        </div>

        {/* Color Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Color:</span>
          {['all', 'Red', 'Yellow', 'Green', 'Blue', 'Pink', 'Black'].map((col) => (
            <button
              key={col}
              onClick={() => setSelectedColor(col)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedColor === col ? '1px solid var(--color-accent)' : '1px solid rgba(212, 175, 55, 0.2)',
                background: selectedColor === col ? 'rgba(212, 175, 55, 0.3)' : 'rgba(36, 20, 42, 0.6)',
                color: '#ffffff',
                transition: 'all 0.2s ease',
              }}
            >
              {col === 'all' ? 'All Colors' : col}
            </button>
          ))}
        </div>

      </div>

      {/* Dress Grid */}
      {loadingCatalog ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '36px', height: '36px', borderTopColor: '#ec4899' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Loading dress catalog…</p>
        </div>
      ) : filteredDresses.length === 0 ? (
        <div className="glass-card" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>👗</span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>No Dresses Found</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            No dresses match your current filters, or the catalog is empty. Check back later or adjust your filters.
          </p>
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {filteredDresses.map((dress) => (
          <div
            key={dress.id}
            className="glass-card"
            style={{
              padding: '0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.3s ease, border-color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.18)';
            }}
          >
            {/* Image Thumbnail */}
            <div style={{ height: '360px', position: 'relative', overflow: 'hidden' }}>
              <img
                src={dress.image_url}
                alt={dress.item_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                className="badge-pill"
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  background: 'rgba(12, 7, 14, 0.85)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {dress.occasion}
              </span>
              <span
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: 'rgba(212, 175, 55, 0.9)',
                  color: '#0c070e',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {dress.color}
              </span>
            </div>

            {/* Content Details */}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                  {dress.item_name}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {dress.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-accent-light)' }}>
                    Rs. {dress.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                    🌸 Free Express Shipping
                  </span>
                </div>

                {/* Actions: View AI Styles + Add to Cart */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleViewAiStyles(dress)}
                    className="btn btn-primary"
                    style={{ padding: '0.65rem', fontSize: '0.875rem', fontWeight: 700 }}
                  >
                    ✨ View AI Styles
                  </button>

                  <button
                    onClick={() => addToCart(dress)}
                    className="btn btn-secondary"
                    style={{ padding: '0.65rem', fontSize: '0.875rem' }}
                  >
                    🛍️ Add to Cart
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
      )}

      {/* AI Styles Modal */}
      {showAiModal && aiStylesDress && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setShowAiModal(false)}
        >
          <div
            className="card animate-scale-in"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'linear-gradient(145deg, rgba(26, 15, 30, 0.98), rgba(46, 26, 53, 0.95))',
              border: '1px solid rgba(236, 72, 153, 0.3)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <img
                  src={aiStylesDress.image_url}
                  alt={aiStylesDress.item_name}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-lg)',
                    objectFit: 'cover',
                    border: '2px solid rgba(236, 72, 153, 0.4)',
                  }}
                />
                <div>
                  <span className="badge-pill" style={{ marginBottom: '0.35rem', fontSize: '0.7rem' }}>✨ AI Styling Analysis</span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>
                    {aiStylesDress.item_name}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.5rem', cursor: 'pointer', padding: '0.25rem' }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            {aiStylesLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '36px', height: '36px', borderTopColor: '#ec4899' }} />
                <h3 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 600 }}>
                  Generating AI Style Recommendations…
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Analyzing color harmony, fabric, and occasion context
                </p>
              </div>
            ) : aiStylesError ? (
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fda4af', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ {aiStylesError}</p>
                <button onClick={() => handleViewAiStyles(aiStylesDress)} className="btn btn-primary" style={{ marginTop: '0.75rem', padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>
                  Retry
                </button>
              </div>
            ) : aiStylesData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

                {/* Jewelry Direction */}
                <div style={{ background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>💎</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-accent-light)' }}>Jewelry Direction</h4>
                  </div>
                  <p style={{ color: '#fce7f3', fontSize: '0.925rem', lineHeight: 1.75 }}>
                    {aiStylesData.jewelry_suggestion}
                  </p>
                </div>

                {/* Makeup Palette */}
                <div style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.25)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>💄</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f472b6' }}>Makeup Palette</h4>
                  </div>
                  <p style={{ color: '#fce7f3', fontSize: '0.925rem', lineHeight: 1.75 }}>
                    {aiStylesData.makeup_suggestion}
                  </p>
                </div>

                {/* Occasion Tips */}
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🎯</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>Occasion Tips</h4>
                  </div>
                  <p style={{ color: '#fce7f3', fontSize: '0.925rem', lineHeight: 1.75 }}>
                    {aiStylesData.occasion_tips}
                  </p>
                </div>

                {/* Full Stylist Explanation */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(236, 72, 153, 0.15)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🧠</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#c084fc' }}>Full Stylist Analysis</h4>
                  </div>
                  <p style={{ color: '#d1c4d4', fontSize: '0.9rem', lineHeight: 1.8, fontStyle: 'italic' }}>
                    "{aiStylesData.explanation}"
                  </p>
                </div>

                {/* Color Harmony Badge */}
                <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.5rem 1.5rem',
                    borderRadius: 'var(--radius-pill)',
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(212, 175, 55, 0.25))',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}>
                    🎨 Color Harmony: {aiStylesData.color_harmony}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

    </div>
  );
}
