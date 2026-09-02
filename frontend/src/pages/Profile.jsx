/**
 * Profile Page — View/edit personal details, upload photo with skin-tone detection.
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    preferences: {
      favorite_colors: '',
      style_preference: 'modern',
      metal_preference: 'gold',
    },
  });
  const [currentSkinTone, setCurrentSkinTone] = useState(null);
  const [profileImgUrl, setProfileImgUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        gender: user.gender || '',
        preferences: {
          favorite_colors: user.preferences?.favorite_colors || '',
          style_preference: user.preferences?.style_preference || 'modern',
          metal_preference: user.preferences?.metal_preference || 'gold',
        },
      });
      setCurrentSkinTone(user.skin_tone || null);
      setProfileImgUrl(user.profile_image_url || null);
    }
  }, [user]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('pref_')) {
      const prefKey = name.replace('pref_', '');
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await client.put('/profile', {
        full_name: formData.full_name,
        gender: formData.gender || null,
        skin_tone: currentSkinTone || null,
        preferences: formData.preferences,
      });
      if (updateUser) updateUser(res.data);
      setMessage({ text: 'Profile updated successfully! ✨', type: 'success' });
    } catch (err) {
      setMessage({
        text: err.response?.data?.detail || 'Failed to update profile. Please try again.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetSkinTone = async (tone) => {
    setCurrentSkinTone(tone);
    try {
      const res = await client.put('/profile', {
        skin_tone: tone,
      });
      if (updateUser) updateUser(res.data);
      setMessage({ text: `Skin Tone DNA successfully set to ${tone.toUpperCase()}! ✨`, type: 'success' });
    } catch (err) {
      console.error('Failed to update skin tone', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    setMessage({ text: '', type: '' });

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const res = await client.post('/profile/image', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileImgUrl(res.data.profile_image_url);
      if (res.data.skin_tone) {
        setCurrentSkinTone(res.data.skin_tone);
      }
      if (updateUser) {
        updateUser({
          profile_image_url: res.data.profile_image_url,
          skin_tone: res.data.skin_tone,
        });
      }
      setMessage({
        text: res.data.message || 'Profile photo uploaded! Skin tone detected.',
        type: 'success',
      });
    } catch (err) {
      setMessage({
        text: err.response?.data?.detail || 'Failed to upload photo.',
        type: 'error',
      });
    } finally {
      setUploadingImg(false);
    }
  };

  const skinToneBadges = {
    fair: { label: 'Fair Tone', color: '#FCE7D6', textColor: '#84422E', desc: 'Cool/pastel & silver/gold tones complement your look' },
    medium: { label: 'Medium Tone', color: '#DEAB88', textColor: '#4E291C', desc: 'Warm neutrals & radiant gold/rose jewelry harmonize best' },
    dark: { label: 'Dark Tone', color: '#88563C', textColor: '#FFF', desc: 'Rich jewel tones & high-contrast gold/statement pieces shine' },
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Personal <span className="gradient-text">Profile & Styling DNA</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
          Manage your personal info and photo for smart skin-tone aware fashion recommendations.
        </p>
      </div>

      {message.text && (
        <div
          className="animate-slide-up"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            background: message.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: message.type === 'success' ? '#4ade80' : '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span>{message.type === 'success' ? '✨' : '⚠️'}</span>
          <span>{message.text}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) 1fr', gap: '2rem' }}>
        {/* Left Column: Avatar & Skin Tone Badge */}
        <div className="card" style={{ textAlign: 'center', height: 'fit-content' }}>
          <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 1.5rem' }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--color-primary)',
                boxShadow: '0 0 20px rgba(183, 110, 121, 0.25)',
                background: 'var(--color-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {profileImgUrl ? (
                <img
                  key={profileImgUrl}
                  src={profileImgUrl}
                  alt="Profile"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <span style={{ fontSize: '3.5rem' }}>👤</span>
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImg}
              className="btn btn-primary"
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
              title="Upload profile photo"
            >
              {uploadingImg ? '⏳' : '📷'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
            />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            {formData.full_name || 'Fashion Enthusiast'}
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {user?.email}
          </p>

          {/* Skin Tone Detection Card */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(36, 20, 42, 0.65)',
              border: '1px solid rgba(236, 72, 153, 0.25)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-light)', letterSpacing: '0.05em' }}>
                🧬 SKIN TONE & UNDERTONE DNA
              </span>
              <span style={{ fontSize: '1.2rem' }}>🎨</span>
            </div>

            {(() => {
              const badgeKey = currentSkinTone ? (
                currentSkinTone.toLowerCase().includes('fair') ? 'fair' :
                (currentSkinTone.toLowerCase().includes('dark') || currentSkinTone.toLowerCase().includes('dusky')) ? 'dark' : 'medium'
              ) : null;

              const badge = badgeKey ? skinToneBadges[badgeKey] : null;

              return badge ? (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: badge.color,
                        border: '2px solid #ffffff',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                      }}
                    />
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff', textTransform: 'capitalize' }}>
                        {badge.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#4ade80', marginLeft: '8px' }}>
                        ✓ Calibrated
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.45, marginTop: '0.4rem' }}>
                    {badge.desc}
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Upload a photo or choose your tone below to personalize all jewelry & makeup matches.
                </p>
              );
            })()}

            {/* Quick Tone Selection Pills */}
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                Quick Calibrate Skin Tone:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                {[
                  { key: 'fair', label: 'Fair' },
                  { key: 'medium', label: 'Medium' },
                  { key: 'dark', label: 'Dusky' },
                ].map((t) => {
                  const isActive = currentSkinTone?.toLowerCase().includes(t.key);
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => handleSetSkinTone(t.key)}
                      style={{
                        padding: '0.45rem 0.3rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: isActive ? '1px solid #ec4899' : '1px solid rgba(236, 72, 153, 0.2)',
                        background: isActive ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'rgba(255, 255, 255, 0.05)',
                        color: '#ffffff',
                        transition: 'all 0.2s',
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct Auto-Detect Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImg}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '0.55rem', fontSize: '0.8125rem', gap: '0.4rem' }}
            >
              <span>{uploadingImg ? '⏳' : '📷'}</span>
              <span>{uploadingImg ? 'Analyzing Face & Undertone...' : 'Auto-Detect from Photo'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Profile Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            Edit Details & Preferences
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleTextChange}
                required
                className="input"
                style={{ width: '100%' }}
                placeholder="e.g. Sarah Jenkins"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleTextChange}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="">Select Gender (Optional)</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-Binary</option>
                <option value="other">Prefer not to say</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                Styling Preferences
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Preferred Metal Tone
                  </label>
                  <select
                    name="pref_metal_preference"
                    value={formData.preferences.metal_preference}
                    onChange={handleTextChange}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="gold">Gold & Rose Gold</option>
                    <option value="silver">Silver & Platinum</option>
                    <option value="both">Mix & Match</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Style Vibe
                  </label>
                  <select
                    name="pref_style_preference"
                    value={formData.preferences.style_preference}
                    onChange={handleTextChange}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="modern">Modern & Chic</option>
                    <option value="classic">Classic & Elegant</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="statement">Bold & Glamorous</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Favorite Outfit Colors
                </label>
                <input
                  type="text"
                  name="pref_favorite_colors"
                  value={formData.preferences.favorite_colors}
                  onChange={handleTextChange}
                  className="input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Navy, Emerald Green, Wine Red"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ marginTop: '1rem', width: '100%', padding: '0.85rem' }}
            >
              {saving ? 'Saving Changes...' : 'Save Profile Preferences'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
