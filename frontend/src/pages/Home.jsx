import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDressUpload = async (file) => {
    if (!file) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('style_type', 'casual');

    try {
      const res = await client.post('/outfits', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/analyzer?outfit_id=${res.data.outfit_id}`);
    } catch (err) {
      console.error(err);
      navigate('/analyzer');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleDressUpload(file);
  };

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDragDropClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) handleDressUpload(file);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem 1.5rem 5rem' }}>
      
      {/* ── 1. Hero Section (Exact Match to Reference Design) ── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
          gap: '3.5rem',
          alignItems: 'center',
          padding: '3rem 0 5rem',
          minHeight: '75vh',
        }}
        className="hero-grid"
      >
        
        {/* Left Hero Content */}
        <div className="animate-fade-in">
          
          {/* Top Pill Badge */}
          <div style={{ marginBottom: '1.75rem' }}>
            <span className="badge-pill" style={{ padding: '0.45rem 1.25rem', fontSize: '0.8125rem' }}>
              <span style={{ color: '#ec4899', fontSize: '0.9rem' }}>●</span>
              <span>PAKISTAN'S #1 AI FASHION PLATFORM</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.75rem, 5.5vw, 4.5rem)',
              lineHeight: 1.12,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              marginBottom: '1.5rem',
            }}
          >
            Discover Your<br />
            <span
              className="gradient-text-italic"
              style={{
                fontStyle: 'italic',
                fontWeight: 600,
                fontFamily: 'var(--font-display)',
                display: 'inline-block',
                marginRight: '0.4rem',
              }}
            >
              Perfect Pakistani
            </span><br />
            <span style={{ color: '#ffffff' }}>Look</span><br />
            <span style={{ color: '#ffffff', fontWeight: 700 }}>with AI Magic</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.7,
              color: 'var(--color-text-secondary)',
              maxWidth: '560px',
              marginBottom: '2.5rem',
            }}
          >
            Upload your dress photo — GlamIQ AI instantly suggests matching Kundan & Polki jewelry and Pakistani glam makeup. Tailored to your style.
          </p>

          {/* 1-Click AI Dropzone & CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '3.5rem' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="btn btn-primary animate-pulse-glow"
              style={{
                padding: '0.95rem 2rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                gap: '0.75rem',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>✨</span>
              <span>{uploading ? 'Analyzing Dress with AI...' : 'Upload Dress & Style AI'}</span>
            </button>

            <Link
              to="/dresses"
              className="btn btn-secondary"
              style={{
                padding: '0.95rem 1.75rem',
                fontSize: '1.05rem',
                fontWeight: 600,
              }}
            >
              Browse Catalog
            </Link>
          </div>

          {/* Metrics / Social Proof */}
          <div
            style={{
              display: 'flex',
              gap: '2.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(236, 72, 153, 0.15)',
              maxWidth: '560px',
            }}
          >
            <div>
              <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                500+
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Dresses Curated
              </p>
            </div>
            <div>
              <p style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                300+
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Kundan & Polki Pieces
              </p>
            </div>
            <div>
              <p style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary-light)', fontFamily: 'var(--font-display)' }}>
                18K+
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Pakistani Looks Styled
              </p>
            </div>
          </div>

        </div>

        {/* Right Hero Image Card (Exact Match to Bridal Visual) */}
        <div style={{ position: 'relative' }} className="animate-fade-in">
          
          {/* Background Glow */}
          <div
            style={{
              position: 'absolute',
              inset: '-10%',
              background: 'radial-gradient(circle at 60% 40%, rgba(236, 72, 153, 0.35) 0%, rgba(212, 175, 55, 0.15) 50%, transparent 80%)',
              filter: 'blur(50px)',
              zIndex: 0,
            }}
          />

          {/* Bridal Model Visual */}
          <div
            className="glass-card"
            style={{
              position: 'relative',
              zIndex: 1,
              overflow: 'hidden',
              borderRadius: 'var(--radius-xl)',
              border: '2px solid rgba(236, 72, 153, 0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(236, 72, 153, 0.25)',
              maxHeight: '620px',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=85"
              alt="Pakistani Bridal Glam Look"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '620px',
                objectFit: 'cover',
                display: 'block',
              }}
            />

            {/* Bottom Gradient Overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(to top, rgba(12, 7, 14, 0.95) 0%, transparent 100%)',
                padding: '2rem',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span className="badge-pill" style={{ marginBottom: '0.4rem', background: 'rgba(212, 175, 55, 0.2)', borderColor: 'rgba(212, 175, 55, 0.5)', color: '#f3e5ab' }}>
                  👑 Royal Bridal Edit
                </span>
                <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                  Crimson Velvet & Heritage Kundan
                </p>
              </div>

              <Link
                to="/analyzer"
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.15rem', fontSize: '0.875rem' }}
              >
                Style Similar
              </Link>
            </div>
          </div>

          {/* Floating Heart Badge (Top Right) */}
          <div
            className="glass-card animate-float"
            style={{
              position: 'absolute',
              top: '24px',
              right: '-12px',
              zIndex: 2,
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              background: 'rgba(26, 15, 30, 0.9)',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            <span style={{ fontSize: '1.4rem', color: '#ec4899', display: 'block', marginBottom: '0.2rem' }}>
              💖
            </span>
            <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, fontFamily: 'var(--font-display)' }}>
              18K+
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, whiteSpace: 'nowrap' }}>
              Pakistani Looks
            </p>
          </div>

          {/* Floating AI Color Detection Badge (Bottom Left) */}
          <div
            className="glass-card animate-float"
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '-20px',
              zIndex: 2,
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              background: 'rgba(26, 15, 30, 0.95)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              animationDelay: '1.5s',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🎨</span>
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                AI Color Vision
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-accent-light)', margin: 0 }}>
                Auto-matches metals & shades
              </p>
            </div>
          </div>

        </div>

      </section>


      {/* ── 2. Drag & Drop AI Wardrobe Dropzone ── */}
      <section style={{ margin: '3rem 0 6rem' }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={handleDragDropClick}
          className="glass-card"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            border: dragOver ? '2px dashed #ec4899' : '2px dashed rgba(236, 72, 153, 0.3)',
            background: dragOver ? 'rgba(236, 72, 153, 0.1)' : 'rgba(26, 15, 30, 0.6)',
            borderRadius: 'var(--radius-xl)',
            transition: 'all 0.3s ease',
          }}
        >
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
            👗✨
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
            Drop Your Outfit Photo Here
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
            Upload any Pakistani bridal lehenga, festive pret, casual kurti or formal suit. GlamIQ AI will analyze colors, undertones, and curate matching jewelry & makeup instantly.
          </p>
          <span className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}>
            {uploading ? 'Processing Image...' : 'Select Dress Photo from Device'}
          </span>
        </div>
      </section>


      {/* ── 3. Explore Luxury Pakistani Collections ── */}
      <section style={{ marginBottom: '6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge-pill" style={{ marginBottom: '0.5rem' }}>
              🌟 Curated Catalog
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
              Explore Pakistani Fashion Collections
            </h2>
          </div>
          <Link to="/dresses" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
            View Full Catalog →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Collection 1: Pakistani Bridal Lehenga */}
          <Link to="/dresses?collection=bridal" className="glass-card" style={{ overflow: 'hidden', padding: 0, textDecoration: 'none', transition: 'transform 0.3s ease' }}>
            <div style={{ height: '320px', position: 'relative', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
                alt="Pakistani Bridal Lehenga"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,7,14,0.92) 0%, transparent 60%)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span className="badge-pill" style={{ width: 'fit-content', marginBottom: '0.35rem' }}>👑 Bridal Couture</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>Pakistani Bridal Lehenga</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Zardozi Lehengas, Handcrafted Maxis & Royal Barat Ensembles</p>
              </div>
            </div>
          </Link>

          {/* Collection 2: Festive & Velvet Formal */}
          <Link to="/dresses?collection=festive" className="glass-card" style={{ overflow: 'hidden', padding: 0, textDecoration: 'none', transition: 'transform 0.3s ease' }}>
            <div style={{ height: '320px', position: 'relative', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
                alt="Festive & Velvet Formal"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,7,14,0.92) 0%, transparent 60%)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span className="badge-pill" style={{ width: 'fit-content', marginBottom: '0.35rem' }}>✨ Luxury Pret</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>Festive & Velvet Formal</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Raw Silk Kurtis, Organza Anarkalis & Micro-Velvet Peshwas</p>
              </div>
            </div>
          </Link>

          {/* Collection 3: Heritage Kundans */}
          <Link to="/jewellery?collection=kundan" className="glass-card" style={{ overflow: 'hidden', padding: 0, textDecoration: 'none', transition: 'transform 0.3s ease' }}>
            <div style={{ height: '320px', position: 'relative', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
                alt="Heritage Kundans"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,7,14,0.92) 0%, transparent 60%)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span className="badge-pill badge-gold" style={{ width: 'fit-content', marginBottom: '0.35rem' }}>💍 22K Gold & Polki</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>Heritage Kundans</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Royal Chokers, Layered Malas & Artisan-Carved Bridal Kadas</p>
              </div>
            </div>
          </Link>

          {/* Collection 4: Chandbalis & Matha Patti */}
          <Link to="/jewellery?collection=chandbali" className="glass-card" style={{ overflow: 'hidden', padding: 0, textDecoration: 'none', transition: 'transform 0.3s ease' }}>
            <div style={{ height: '320px', position: 'relative', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
                alt="Chandbalis & Matha Patti"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,7,14,0.92) 0%, transparent 60%)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span className="badge-pill badge-gold" style={{ width: 'fit-content', marginBottom: '0.35rem' }}>🌙 Heirloom Ornaments</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>Chandbalis & Matha Patti</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Cascading Pearl Forehead Bands, Jhumkas & Crescent Earrings</p>
              </div>
            </div>
          </Link>

          {/* Collection 5: Velvet Matte Lip Color */}
          <Link to="/makeup?collection=lips" className="glass-card" style={{ overflow: 'hidden', padding: 0, textDecoration: 'none', transition: 'transform 0.3s ease' }}>
            <div style={{ height: '320px', position: 'relative', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80"
                alt="Velvet Matte Lip Color"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,7,14,0.92) 0%, transparent 60%)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span className="badge-pill" style={{ width: 'fit-content', marginBottom: '0.35rem' }}>💄 Signature Lip Wear</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>Velvet Matte Lip Color</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Crimson Bridal Stains, Spiced Terracottas & Caramel Nudes</p>
              </div>
            </div>
          </Link>

          {/* Collection 6: Golden Hour Eye */}
          <Link to="/makeup?collection=eyes" className="glass-card" style={{ overflow: 'hidden', padding: 0, textDecoration: 'none', transition: 'transform 0.3s ease' }}>
            <div style={{ height: '320px', position: 'relative', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80"
                alt="Golden Hour Eye"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,7,14,0.92) 0%, transparent 60%)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span className="badge-pill" style={{ width: 'fit-content', marginBottom: '0.35rem' }}>✨ Candlelight Radiance</span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>Golden Hour Eye</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Sunset Metallic Palettes, Molten Bronzers & Dewy Luminizers</p>
              </div>
            </div>
          </Link>

        </div>
      </section>


      {/* ── 4. How GlamIQ AI Works ── */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="badge-pill" style={{ marginBottom: '0.75rem' }}>
            ⚙️ AI Styling Engine
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
            How GlamIQ Curates Your Look
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0.75rem auto 0' }}>
            From color harmony to metal temperature and skin undertone pairing in three intelligent steps.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          <div className="glass-card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.2)', border: '1px solid rgba(236, 72, 153, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>
              📸
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
              1. Upload Dress Photo
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Snap or upload any outfit photo. Our vision AI instantly isolates the dress, fabric texture, and event context.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid rgba(212, 175, 55, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>
              🧠
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
              2. AI Analyzes Harmony
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Calculates color temperature (warm vs. cool), determines Kundan vs. Platinum pairing, and matches your skin undertone.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.5rem' }}>
              👑
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
              3. Coordinated Lookbook
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Get exact jewelry pieces, lip shades, and blushes with a plain-language stylist explanation ready to wear or buy.
            </p>
          </div>

        </div>
      </section>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>

    </div>
  );
}
