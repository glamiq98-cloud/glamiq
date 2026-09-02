import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export const PAKISTANI_MAKEUP = [
  {
    item_id: 201,
    item_name: 'Velvet Matte Lip Color in Spiced Terracotta',
    category: 'makeup',
    color: 'Terracotta',
    undertone: 'Medium / Warm',
    price: 4500,
    image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
    description: '16-hour long-wear smudge-proof velvety liquid matte lipstick enriched with jojoba oil. Complements mustard, gold, and warm green outfits.',
  },
  {
    item_id: 202,
    item_name: 'Royal Crimson Red Velvet Bridal Lip Stain',
    category: 'makeup',
    color: 'Red',
    undertone: 'Universal / All',
    price: 4800,
    image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
    description: 'Iconic Pakistani bride bold ruby crimson lip pigment with aTransfer-resistant soft cushion matte finish.',
  },
  {
    item_id: 203,
    item_name: 'Golden Hour Warm Sunset Eyeshadow Palette (16 Shades)',
    category: 'makeup',
    color: 'Copper & Gold',
    undertone: 'Warm / Golden',
    price: 8500,
    image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    description: 'Buttery metallic golds, rich foiled coppers, and deep espresso mattes for creating signature Pakistani festive smoky eyes.',
  },
  {
    item_id: 204,
    item_name: 'Sun-Drenched Molten Bronze & Champagne Luminizer',
    category: 'makeup',
    color: 'Bronze',
    undertone: 'Medium / Olive',
    price: 5200,
    image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    description: 'Glass-skin liquid highlighter loaded with ultra-fine pearl pigments that mimic golden candlelight radiance.',
  },
  {
    item_id: 205,
    item_name: 'Deep Wine Berry & Mulberry Lip Elixir',
    category: 'makeup',
    color: 'Berry',
    undertone: 'Cool / Fair to Dark',
    price: 4600,
    image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
    description: 'Dramatic plum-wine hydrating lip stain that pairs effortlessly with silver, navy, emerald, and black formal outfits.',
  },
  {
    item_id: 206,
    item_name: 'Sunset Coral Silk Liquid Blush',
    category: 'makeup',
    color: 'Coral',
    undertone: 'Warm',
    price: 3900,
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    description: 'Weightless serum-infused cheek tint that melts into skin for a natural, dewy, sun-kissed flush.',
  },
  {
    item_id: 207,
    item_name: 'Smoky Plum & Amethyst Velvet Eyeshadow Quad',
    category: 'makeup',
    color: 'Plum',
    undertone: 'Cool',
    price: 6200,
    image_url: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?auto=format&fit=crop&w=600&q=80',
    description: 'Deep plum and amethyst crushed pigment quad for seductive cool-toned bridal and reception evening looks.',
  },
  {
    item_id: 208,
    item_name: 'Pillow Soft Caramel Nude Hydrating Lip Oil',
    category: 'makeup',
    color: 'Nude',
    undertone: 'Warm / Olive',
    price: 3600,
    image_url: 'https://images.unsplash.com/photo-1631730486784-5456119f69ae?auto=format&fit=crop&w=600&q=80',
    description: 'Non-sticky peptide infused lip glaze providing sheer caramel tint with mirror-shine plumpness.',
  },
];

export default function Makeup() {
  const [searchParams, setSearchParams] = useSearchParams();
  const collectionParam = searchParams.get('collection') || 'all';

  const [selectedShade, setSelectedShade] = useState('all');
  const { addToCart } = useCart();
  const [addedItem, setAddedItem] = useState(null);

  const filteredMakeup = PAKISTANI_MAKEUP.filter((item) => {
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

    </div>
  );
}
