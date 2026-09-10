/**
 * Outfits Page — Upload, list, and style your outfits.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function Outfits() {
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  // Upload form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [occasionId, setOccasionId] = useState('');
  const [styleType, setStyleType] = useState('casual');
  const [colorPalette, setColorPalette] = useState('');
  const fileInputRef = useRef(null);

  // Fetch outfits and occasions
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [outfitsRes, occasionsRes] = await Promise.all([
        client.get('/outfits'),
        client.get('/occasions'),
      ]);
      setOutfits(outfitsRes.data.outfits || []);
      setOccasions(occasionsRes.data || []);
      if (occasionsRes.data && occasionsRes.data.length > 0) {
        setOccasionId(occasionsRes.data[0].occasion_id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load outfits or occasions.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an outfit photo to upload.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (occasionId) formData.append('occasion_id', occasionId);
    if (styleType) formData.append('style_type', styleType);
    if (colorPalette) formData.append('color_palette', colorPalette);

    try {
      const res = await client.post('/outfits', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowUploadModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setColorPalette('');
      // Refresh outfits list
      await fetchData();
      // Optional: direct navigate to recommendations
      navigate(`/recommendations?outfit_id=${res.data.outfit_id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload outfit.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteOutfit = async (outfitId) => {
    if (!window.confirm('Are you sure you want to delete this outfit? This action cannot be undone.')) {
      return;
    }
    
    try {
      await client.delete(`/outfits/${outfitId}`);
      setOutfits((prev) => prev.filter((o) => o.outfit_id !== outfitId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete outfit.');
    }
  };

  const styleTypes = [
    { id: 'casual', label: 'Casual', emoji: '👕' },
    { id: 'formal', label: 'Formal', emoji: '👔' },
    { id: 'western', label: 'Western', emoji: '👗' },
    { id: 'eastern', label: 'Eastern', emoji: '👘' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Header & CTA */}
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
            My <span className="gradient-text">Wardrobe & Outfits</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
            Upload dresses and outfits to get matching jewelry & makeup styling recommendations.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <span>✨</span>
          <span>Upload New Outfit</span>
        </button>
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

      {/* Outfits Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading your wardrobe…</p>
        </div>
      ) : outfits.length === 0 ? (
        /* Empty State */
        <div
          className="card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            borderStyle: 'dashed',
            borderWidth: '2px',
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.8 }}>👗</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Your wardrobe is empty
          </h2>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              maxWidth: '460px',
              margin: '0 auto 2rem',
              lineHeight: 1.6,
            }}
          >
            Upload your favorite dress, saree, gown, or suit. Our rule-based AI engine will analyze color harmony and recommend perfect jewelry & makeup!
          </p>
          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            ✨ Upload First Look
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem',
          }}
        >
          {outfits.map((outfit) => (
            <div
              key={outfit.outfit_id}
              className="card animate-fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '0',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Outfit Image Container */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '280px',
                  backgroundColor: 'var(--color-bg-secondary)',
                  overflow: 'hidden',
                }}
              >
                {outfit.image_url ? (
                  <img
                    src={outfit.image_url}
                    alt="Outfit"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                    }}
                  >
                    👗
                  </div>
                )}

                {/* Style badge overlay */}
                {outfit.style_type && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: 'rgba(0, 0, 0, 0.7)',
                      backdropFilter: 'blur(4px)',
                      color: 'var(--color-primary-light)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {outfit.style_type}
                  </span>
                )}

                {outfit.occasion_name && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(183, 110, 121, 0.9)',
                      color: '#FFF',
                    }}
                  >
                    {outfit.occasion_name}
                  </span>
                )}
                
                {/* Delete Button overlay */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteOutfit(outfit.outfit_id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ff4d4d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                  }}
                  title="Delete Outfit"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                    e.currentTarget.style.color = '#FFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                    e.currentTarget.style.color = '#ff4d4d';
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Details & Action */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Added on {new Date(outfit.uploaded_at).toLocaleDateString()}
                  </div>
                  {outfit.color_palette && (
                    <div style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                      🎨 Color: <strong style={{ color: 'var(--color-text)' }}>{outfit.color_palette}</strong>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                  <Link
                    to={`/recommendations?outfit_id=${outfit.outfit_id}`}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      padding: '0.65rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>💎</span>
                    <span>Get Styled Look</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="card animate-scale-in"
            style={{
              width: '100%',
              maxWidth: '540px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Upload New Outfit</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Photo selector area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  transition: 'border-color 0.2s',
                }}
              >
                {previewUrl ? (
                  <div>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ maxHeight: '200px', margin: '0 auto 0.75rem', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
                    />
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-primary-light)' }}>Click to change photo</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Click or drag dress image here</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>JPG, PNG, WebP up to 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                />
              </div>

              {/* Occasion dropdown */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Occasion / Event
                </label>
                <select
                  value={occasionId}
                  onChange={(e) => setOccasionId(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                >
                  {occasions.map((occ) => (
                    <option key={occ.occasion_id} value={occ.occasion_id}>
                      {occ.occasion_name} — {occ.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Style Type Pills */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Style Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {styleTypes.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStyleType(st.id)}
                      style={{
                        padding: '0.6rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${styleType === st.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: styleType === st.id ? 'rgba(183, 110, 121, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: styleType === st.id ? 'var(--color-primary-light)' : 'var(--color-text)',
                        fontWeight: styleType === st.id ? 600 : 400,
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div>{st.emoji}</div>
                      <div>{st.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dominant Color Palette */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                  Dominant Color(s)
                </label>
                <input
                  type="text"
                  value={colorPalette}
                  onChange={(e) => setColorPalette(e.target.value)}
                  placeholder="e.g. Red, Royal Blue, Emerald Green, Black, Blush Pink"
                  className="input"
                  style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {['Red', 'Blue', 'Green', 'Black', 'White', 'Pink', 'Gold', 'Silver', 'Yellow', 'Purple'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColorPalette((prev) => (prev ? `${prev}, ${c}` : c))}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      +{c}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="btn btn-primary"
                  style={{ flex: 1.5, justifyContent: 'center' }}
                >
                  {uploading ? 'Analyzing & Uploading...' : '✨ Upload & Style'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
