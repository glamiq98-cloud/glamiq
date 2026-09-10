import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import client from '../api/client';

export default function Makeup() {
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionParam = searchParams.get('collection') || 'all';

  const [selectedShade, setSelectedShade] = useState('all');
  const { addToCart } = useCart();
  const [addedItem, setAddedItem] = useState(null);

  const [makeup, setMakeup] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  useEffect(() => {
    const fetchMakeup = async () => {
      setLoadingCatalog(true);
      try {
        const res = await client.get('/catalog/items?category=makeup');
        const apiMakeup = res.data.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          category: item.category,
          color: item.color || 'Custom',
          undertone: 'Universal / All',
          price: item.price || 0,
          image_url: item.image_url,
          description: item.description || '',
        }));
        setMakeup(apiMakeup);
      } catch (err) {
        console.error('Failed to fetch makeup catalog:', err);
      } finally {
        setLoadingCatalog(false);
      }
    };
    fetchMakeup();
  }, []);

  const filteredMakeup = makeup.filter((item) => {
    // Collection Filter
    if (collectionParam === 'lips') {
      const isLip =
        item.item_name.toLowerCase().includes('lip') ||
        item.item_name.toLowerCase().includes('stain') ||
        item.item_name.toLowerCase().includes('elixir');
      if (!isLip) return false;
    } else if (collectionParam === 'eyes') {
      const isEye =
        item.item_name.toLowerCase().includes('eye') ||
        item.item_name.toLowerCase().includes('palette') ||
        item.item_name.toLowerCase().includes('luminizer') ||
        item.item_name.toLowerCase().includes('blush');
      if (!isEye) return false;
    }

    if (selectedShade === 'all') return true;
    return item.color.toLowerCase().includes(selectedShade.toLowerCase());
  });

  const handleAdd = (item) => {
    addToCart(item);
    setAddedItem(item.item_id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      
      {/* Header Banner */}
      <div className="animate-fade-in" style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <span className="badge-pill" style={{ marginBottom: '0.75rem' }}>
          💄 Pakistani Glam & Bridal Beauty
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>
          Curated <span className="gradient-text-italic">Glam Makeup Looks</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 1.5rem' }}>
          Color-matched to South Asian skin undertones and festive luxury attire. Long-wear pigments crafted for wedding celebrations.
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
            All Makeup
          </button>
          <button
            onClick={() => setSearchParams({ collection: 'lips' })}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: collectionParam === 'lips' ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'transparent',
              color: '#ffffff',
              transition: 'all 0.2s',
            }}
          >
            💋 Velvet Matte Lip Colors
          </button>
          <button
            onClick={() => setSearchParams({ collection: 'eyes' })}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: collectionParam === 'eyes' ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'transparent',
              color: '#ffffff',
              transition: 'all 0.2s',
            }}
          >
            ✨ Golden Hour Eye Palettes
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '3rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['all', 'Terracotta', 'Red', 'Gold', 'Bronze', 'Berry', 'Coral', 'Nude'].map((shade) => (
          <button
            key={shade}
            onClick={() => setSelectedShade(shade)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedShade === shade ? '1px solid #ec4899' : '1px solid rgba(236, 72, 153, 0.2)',
              background: selectedShade === shade ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.4), rgba(190, 24, 93, 0.5))' : 'rgba(36, 20, 42, 0.6)',
              color: '#ffffff',
              transition: 'all 0.2s ease',
            }}
          >
            {shade === 'all' ? 'All Makeup Shades' : shade}
          </button>
        ))}
      </div>

      {/* Makeup Grid */}
      {loadingCatalog ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '36px', height: '36px', borderTopColor: '#ec4899' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Loading makeup catalog…</p>
        </div>
      ) : filteredMakeup.length === 0 ? (
        <div className="glass-card" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>💄</span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>No Makeup Items Found</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            No makeup items match your current filters, or the catalog is empty. Check back later or adjust your filters.
          </p>
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
        {filteredMakeup.map((item) => (
          <div
            key={item.item_id}
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
            <div style={{ height: '280px', position: 'relative', overflow: 'hidden' }}>
              <img
                src={item.image_url}
                alt={item.item_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                className="badge-pill"
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  background: 'rgba(12, 7, 14, 0.9)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {item.color}
              </span>
              <span
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  right: '14px',
                  background: 'rgba(36, 20, 42, 0.85)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid rgba(236, 72, 153, 0.2)',
                }}
              >
                {item.undertone}
              </span>
            </div>

            {/* Content Details */}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                  {item.item_name}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {item.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-accent-light)' }}>
                    Rs. {item.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                    ✨ Long-Wear Formula
                  </span>
                </div>

                <button
                  onClick={() => handleAdd(item)}
                  className={addedItem === item.item_id ? 'btn btn-secondary' : 'btn btn-primary'}
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}
                >
                  {addedItem === item.item_id ? '✨ Added to Cart!' : '💄 Add to Fashion Cart'}
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
      )}

    </div>
  );
}
