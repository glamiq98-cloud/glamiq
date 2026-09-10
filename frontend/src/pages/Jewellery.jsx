import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import client from '../api/client';

export default function Jewellery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionParam = searchParams.get('collection') || 'all';

  const [selectedTone, setSelectedTone] = useState('all');
  const { addToCart } = useCart();
  const [addedItem, setAddedItem] = useState(null);

  const [jewellery, setJewellery] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  useEffect(() => {
    const fetchJewellery = async () => {
      setLoadingCatalog(true);
      try {
        const res = await client.get('/catalog/items?category=jewelry');
        const apiJewellery = res.data.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          category: item.category,
          color: item.color || 'Custom',
          price: item.price || 0,
          image_url: item.image_url,
          description: item.description || '',
        }));
        setJewellery(apiJewellery);
      } catch (err) {
        console.error('Failed to fetch jewellery catalog:', err);
      } finally {
        setLoadingCatalog(false);
      }
    };
    fetchJewellery();
  }, []);

  const filteredJewellery = jewellery.filter((item) => {
    // Collection Filter
    if (collectionParam === 'kundan') {
      const isKundan =
        item.color.toLowerCase().includes('kundan') ||
        item.item_name.toLowerCase().includes('kundan') ||
        item.item_name.toLowerCase().includes('polki') ||
        item.item_name.toLowerCase().includes('choker') ||
        item.item_name.toLowerCase().includes('necklace') ||
        item.item_name.toLowerCase().includes('bangle');
      if (!isKundan) return false;
    } else if (collectionParam === 'chandbali') {
      const isChandbali =
        item.item_name.toLowerCase().includes('chandbali') ||
        item.item_name.toLowerCase().includes('matha patti') ||
        item.item_name.toLowerCase().includes('jhumar') ||
        item.item_name.toLowerCase().includes('earring') ||
        item.item_name.toLowerCase().includes('chandelier');
      if (!isChandbali) return false;
    }

    if (selectedTone === 'all') return true;
    return item.color.toLowerCase().includes(selectedTone.toLowerCase());
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
        <span className="badge-pill badge-gold" style={{ marginBottom: '0.75rem' }}>
          💍 300+ Authentic Pakistani Heritage Pieces
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: '0.75rem' }}>
          Kundan & Polki <span className="gradient-text-gold">Heritage Jewellery</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 1.5rem' }}>
          Handcrafted by master Lahore & Karachi artisans. Designed to harmonize seamlessly with Pakistani bridal wear and festive luxury pret.
        </p>

        {/* Collection Selector Tabs */}
        <div style={{ display: 'inline-flex', gap: '0.5rem', background: 'rgba(36, 20, 42, 0.8)', padding: '0.4rem', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(212, 175, 55, 0.3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setSearchParams({})}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: collectionParam === 'all' ? 'linear-gradient(135deg, #e5c88f, #d4af37)' : 'transparent',
              color: collectionParam === 'all' ? '#0c070e' : '#ffffff',
              transition: 'all 0.2s',
            }}
          >
            All Jewellery
          </button>
          <button
            onClick={() => setSearchParams({ collection: 'kundan' })}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: collectionParam === 'kundan' ? 'linear-gradient(135deg, #e5c88f, #d4af37)' : 'transparent',
              color: collectionParam === 'kundan' ? '#0c070e' : '#ffffff',
              transition: 'all 0.2s',
            }}
          >
            👑 Heritage Kundans & Sets
          </button>
          <button
            onClick={() => setSearchParams({ collection: 'chandbali' })}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: collectionParam === 'chandbali' ? 'linear-gradient(135deg, #e5c88f, #d4af37)' : 'transparent',
              color: collectionParam === 'chandbali' ? '#0c070e' : '#ffffff',
              transition: 'all 0.2s',
            }}
          >
            🌙 Chandbalis & Matha Patti
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '3rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['all', 'Kundan Gold', 'Gold', 'Silver', 'Rose Gold'].map((tone) => (
          <button
            key={tone}
            onClick={() => setSelectedTone(tone)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedTone === tone ? '1px solid var(--color-accent)' : '1px solid rgba(236, 72, 153, 0.2)',
              background: selectedTone === tone ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.35), rgba(170, 140, 44, 0.45))' : 'rgba(36, 20, 42, 0.6)',
              color: selectedTone === tone ? '#fffbeb' : '#d1c4d4',
              transition: 'all 0.2s ease',
            }}
          >
            {tone === 'all' ? 'All Jewellery' : tone}
          </button>
        ))}
      </div>

      {/* Jewellery Grid */}
      {loadingCatalog ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1.5rem', width: '36px', height: '36px', borderTopColor: '#d4af37' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>Loading jewellery catalog…</p>
        </div>
      ) : filteredJewellery.length === 0 ? (
        <div className="glass-card" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>💍</span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>No Jewellery Found</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            No jewellery items match your current filters, or the catalog is empty. Check back later or adjust your filters.
          </p>
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
        {filteredJewellery.map((item) => (
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
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.18)';
            }}
          >
            {/* Image Thumbnail */}
            <div style={{ height: '300px', position: 'relative', overflow: 'hidden' }}>
              <img
                src={item.image_url}
                alt={item.item_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                className="badge-pill badge-gold"
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
                    💎 100% Handcrafted
                  </span>
                </div>

                <button
                  onClick={() => handleAdd(item)}
                  className={addedItem === item.item_id ? 'btn btn-secondary' : 'btn btn-gold'}
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
                >
                  {addedItem === item.item_id ? '✨ Added to Cart!' : '🛍️ Add to Fashion Cart'}
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
