import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';

export const PAKISTANI_DRESSES = [
  {
    id: 'd1',
    item_name: 'Crimson Velvet Bridal Lehenga with Zardozi Embroidery',
    category: 'dress',
    style_type: 'formal',
    occasion: 'Wedding',
    color: 'Crimson Red',
    price: 185000,
    image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    description: 'Heavily hand-embellished royal crimson velvet lehenga with antique gold zardozi and kora dabka detailing.',
  },
  {
    id: 'd2',
    item_name: 'Mustard Ochre Raw Silk Festive Kurti Suit',
    category: 'dress',
    style_type: 'casual',
    occasion: 'Festival',
    color: 'Mustard Yellow',
    price: 34500,
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    description: 'Radiant mustard yellow raw silk straight kurti ensemble with intricate resham threadwork and ruffled net dupatta.',
  },
  {
    id: 'd3',
    item_name: 'Emerald Green Organza Luxury Pret Anarkali',
    category: 'dress',
    style_type: 'formal',
    occasion: 'Party',
    color: 'Emerald Green',
    price: 68000,
    image_url: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=600&q=80',
    description: 'Floor-length flared emerald green pure organza peshwas accented with gota patti and mirror embroidery.',
  },
  {
    id: 'd4',
    item_name: 'Royal Midnight Navy Chiffon Formal Peshwas',
    category: 'dress',
    style_type: 'formal',
    occasion: 'Formal',
    color: 'Royal Blue',
    price: 52000,
    image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80',
    description: 'Sophisticated deep midnight blue chiffon jacket-style peshwas with silver tilla and sequin hand embroidery.',
  },
  {
    id: 'd5',
    item_name: 'Blush Pink & Ivory Net Bridal Maxi Gown',
    category: 'dress',
    style_type: 'formal',
    occasion: 'Wedding',
    color: 'Blush Pink',
    price: 145000,
    image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    description: 'Ethereal pastel blush pink French net gown enriched with Swarovski crystals, pearls, and silver zardozi work.',
  },
  {
    id: 'd6',
    item_name: 'Onyx Black Silk Velvet Kurta & Jamawar Pants',
    category: 'dress',
    style_type: 'casual',
    occasion: 'Date Night',
    color: 'Midnight Black',
    price: 42000,
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    description: 'Statement black micro-velvet straight shirt with antique bronze bullion embroidery paired with pure woven jamawar.',
  },
];

export default function Dresses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionParam = searchParams.get('collection') || 'all';

  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [stylingLoading, setStylingLoading] = useState(null);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [dresses, setDresses] = useState(PAKISTANI_DRESSES);

  useEffect(() => {
    const fetchDresses = async () => {
      try {
        const res = await client.get('/catalog/items?category=dress');
        const apiDresses = res.data.map(item => ({
          id: item.item_id.toString(),
          item_name: item.item_name,
          category: item.category,
          style_type: item.style_type || 'formal',
          occasion: item.occasion || 'Formal',
          color: item.color || 'Custom',
          price: item.price || 0,
          image_url: item.image_url,
          description: item.description || '',
        }));
        setDresses([...apiDresses, ...PAKISTANI_DRESSES]);
      } catch (err) {
        console.error('Failed to fetch dresses catalog:', err);
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

  const handleStyleWithAI = async (dress) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setStylingLoading(dress.id);
    try {
      navigate(`/analyzer?color=${encodeURIComponent(dress.color)}&style=${dress.style_type}&img=${encodeURIComponent(dress.image_url)}`);
    } finally {
      setStylingLoading(null);
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

                {/* Actions: Style with AI + Add to Cart */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleStyleWithAI(dress)}
                    className="btn btn-primary"
                    style={{ padding: '0.65rem', fontSize: '0.875rem', fontWeight: 700 }}
                  >
                    ✨ Style with AI
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

    </div>
  );
}
