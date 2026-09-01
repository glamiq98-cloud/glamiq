import React from 'react';

export default function AnnouncementTicker() {
  const announcements = [
    "💍 Premium Jewellery — 300+ pieces",
    "👗 500+ Dresses for every occasion",
    "🌸 Free shipping on orders over Rs. 2,999",
    "✨ New Bridal Collection is here!",
    "💄 Makeup looks curated weekly",
    "🇵🇰 Pakistan's #1 AI Fashion & Styling Platform",
  ];

  return (
    <div className="ticker-wrap" aria-label="Announcements">
      <div className="ticker-content">
        {[...announcements, ...announcements, ...announcements].map((item, idx) => (
          <span key={idx} style={{ margin: '0 2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{item}</span>
            <span style={{ color: 'var(--color-primary-light)', opacity: 0.6 }}>•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
