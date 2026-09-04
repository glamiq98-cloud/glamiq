import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import client from '../api/client';

export const PAKISTANI_JEWELLERY = [
  {
    item_id: 1,
    item_name: 'Royal Kundan & Polki Heritage Choker Set',
    category: 'jewelry',
    color: 'Kundan Gold',
    price: 89500,
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    description: '22K gold plated heirloom Kundan choker handcrafted with meenakari reverse detailing, uncut polki stones, and freshwater pearl clusters.',
  },
  {
    item_id: 2,
    item_name: 'Celestial Sunburst Gold Chandelier Earrings',
    category: 'jewelry',
    color: 'Gold',
    price: 24500,
    image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
    description: 'Statement Pakistani jhumka chandelier earrings with fine filigree gold carving and zircon drops.',
  },
  {
    item_id: 3,
    item_name: 'Traditional Kashmiri Kundan Matha Patti & Jhumar',
    category: 'jewelry',
    color: 'Kundan Gold',
    price: 45000,
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    description: 'Intricate bridal forehead ornament with cascading pearls and green emerald drop stones.',
  },
  {
    item_id: 4,
    item_name: 'Lustrous 18K Gold Layered Herringbone Necklace',
    category: 'jewelry',
    color: 'Gold',
    price: 38000,
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    description: 'Versatile contemporary layered necklace in radiant 18K gold polish, perfect for modern pret and festive kurtis.',
  },
  {
    item_id: 5,
    item_name: 'Sterling Silver Cascading Tennis Necklace & Studs',
    category: 'jewelry',
    color: 'Silver',
    price: 48000,
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
    description: 'Pure 925 sterling silver brilliant-cut cubic zirconia necklace for navy, emerald, and cool-toned formal ensembles.',
  },
  {
    item_id: 6,
    item_name: 'Hammered 22K Gold Statement Bridal Bangle Set',
    category: 'jewelry',
    color: 'Gold',
    price: 28000,
    image_url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80',
    description: 'Set of 4 artisan-carved traditional kadas with ruby and emerald stone accents.',
  },
  {
    item_id: 7,
    item_name: 'Midnight Sapphire & Platinum Drop Chandbalis',
    category: 'jewelry',
    color: 'Silver',
    price: 36000,
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    description: 'Moon-shaped crescent chandbali earrings crowned with rich royal blue sapphire centerpieces.',
  },
  {
    item_id: 8,
    item_name: 'Baroque Freshwater Pearl & Rose Gold Drop Earrings',
    category: 'jewelry',
    color: 'Rose Gold',
    price: 29500,
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    description: 'Romantic iridescent natural baroque pearls suspended from dainty rose gold diamond pavé huggies.',
  },
];

export default function Jewellery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionParam = searchParams.get('collection') || 'all';

  const [selectedTone, setSelectedTone] = useState('all');
  const { addToCart } = useCart();
  const [addedItem, setAddedItem] = useState(null);

  const [jewellery, setJewellery] = useState(PAKISTANI_JEWELLERY);

  useEffect(() => {
    const fetchJewellery = async () => {
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
        setJewellery([...apiJewellery, ...PAKISTANI_JEWELLERY]);
      } catch (err) {
        console.error('Failed to fetch jewellery catalog:', err);
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

    </div>
  );
}
