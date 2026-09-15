import React, { useState } from 'react';

/**
 * Smooth SVG Bezier Path Generator for Area Charts
 */
function createSmoothPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

export default function AdminAnalyticsReport({ stats, loading = false, onFilterChange, onRefresh }) {
  const [selectedMetric, setSelectedMetric] = useState('all'); // 'all' | 'recommendations' | 'outfits' | 'users'
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [activePreset, setActivePreset] = useState('14d');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  if (!stats) return null;

  const timeSeries = stats.time_series || [];
  const categories = stats.categories || [];
  const topRecommended = stats.top_recommended || [];
  const colorPalettes = stats.color_palettes || [];

  // ── Area Trend Chart Calculations ──────────────────────────────────────
  const chartWidth = 720;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Max value calculation
  const maxRecs = Math.max(...timeSeries.map((d) => d.recommendations || 0), 1);
  const maxOutfits = Math.max(...timeSeries.map((d) => d.outfits || 0), 1);
  const maxUsers = Math.max(...timeSeries.map((d) => d.users || 0), 1);
  const chartMax = Math.max(maxRecs, maxOutfits, maxUsers, 5);

  const getPoints = (key) => {
    if (timeSeries.length === 0) return [];
    return timeSeries.map((d, index) => {
      const x = paddingX + (index / Math.max(timeSeries.length - 1, 1)) * (chartWidth - paddingX * 2);
      const val = d[key] || 0;
      const y = chartHeight - paddingY - (val / chartMax) * (chartHeight - paddingY * 2);
      return { x, y, val, date: d.date, raw: d };
    });
  };

  const recPoints = getPoints('recommendations');
  const outfitPoints = getPoints('outfits');
  const userPoints = getPoints('users');

  const recPath = createSmoothPath(recPoints);
  const outfitPath = createSmoothPath(outfitPoints);
  const userPath = createSmoothPath(userPoints);

  const bottomY = chartHeight - paddingY;
  const recAreaPath = recPoints.length
    ? `${recPath} L ${recPoints[recPoints.length - 1].x} ${bottomY} L ${recPoints[0].x} ${bottomY} Z`
    : '';
  const outfitAreaPath = outfitPoints.length
    ? `${outfitPath} L ${outfitPoints[outfitPoints.length - 1].x} ${bottomY} L ${outfitPoints[0].x} ${bottomY} Z`
    : '';
  const userAreaPath = userPoints.length
    ? `${userPath} L ${userPoints[userPoints.length - 1].x} ${bottomY} L ${userPoints[0].x} ${bottomY} Z`
    : '';

  // ── Donut Chart Calculations ───────────────────────────────────────────
  const totalCatItems = categories.reduce((acc, c) => acc + (c.count || 0), 0) || 1;
  const donutColors = {
    jewelry: '#d4af37', // Kundan gold
    makeup: '#ec4899',  // Rose pink
    dress: '#a855f7',   // Amethyst violet
  };

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let runningOffset = 0;

  const donutSegments = categories.map((cat) => {
    const pct = (cat.count || 0) / totalCatItems;
    const strokeDasharray = `${pct * circumference} ${circumference}`;
    const strokeDashoffset = -runningOffset;
    runningOffset += pct * circumference;
    return {
      ...cat,
      pct: Math.round(pct * 100),
      strokeDasharray,
      strokeDashoffset,
      color: donutColors[cat.category] || '#94a3b8',
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── Top Control & Date Filter Bar ───────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '1.4rem 1.75rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(26,15,30,0.95) 0%, rgba(212,175,55,0.06) 100%)',
          border: '1px solid rgba(212,175,55,0.25)',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span>⚡</span>
              <span>Platform Intelligence & Analytics Hub</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              Live metrics from active wardrobes, AI stylist sessions, and catalog inventory.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Active Range Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.3)',
                fontSize: '0.8rem',
                color: 'var(--color-accent-light)',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: loading ? '#facc15' : '#4ade80',
                  boxShadow: loading ? '0 0 8px #facc15' : '0 0 8px #4ade80',
                }}
              />
              <span>
                {stats.filter_start && stats.filter_end
                  ? `${stats.filter_start} ➔ ${stats.filter_end}`
                  : '14-Day Rolling Window'}
              </span>
            </div>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', borderRadius: 'var(--radius-pill)' }}
              >
                {loading ? '⏳ Updating...' : '🔄 Refresh Analytics'}
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginRight: '0.4rem', fontWeight: 600 }}>
              Date Range:
            </span>
            {[
              { id: '7d', label: 'Last 7 Days', days: 7 },
              { id: '14d', label: 'Last 14 Days', days: 14 },
              { id: '30d', label: 'Last 30 Days', days: 30 },
              { id: '90d', label: 'Last 90 Days', days: 90 },
              { id: 'all', label: 'All Time', days: 0 },
              { id: 'custom', label: 'Custom Range 📅' },
            ].map((p) => {
              const isSelected = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePreset(p.id);
                    if (p.id === 'custom') {
                      setShowCustomPicker(!showCustomPicker);
                    } else {
                      setShowCustomPicker(false);
                      if (onFilterChange) onFilterChange({ days: p.days });
                    }
                  }}
                  style={{
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: 'var(--radius-pill)',
                    background: isSelected
                      ? 'linear-gradient(135deg, #ec4899 0%, #d4af37 100%)'
                      : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                    border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Period Summary Badges */}
          {(stats.period_users !== undefined || stats.period_outfits !== undefined) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Period Growth:</span>
              <span style={{ padding: '0.2rem 0.55rem', borderRadius: '4px', background: 'rgba(212,175,55,0.12)', color: '#d4af37', fontWeight: 600 }}>
                +{stats.period_users || 0} Users
              </span>
              <span style={{ padding: '0.2rem 0.55rem', borderRadius: '4px', background: 'rgba(96,165,250,0.12)', color: '#60a5fa', fontWeight: 600 }}>
                +{stats.period_outfits || 0} Outfits
              </span>
              <span style={{ padding: '0.2rem 0.55rem', borderRadius: '4px', background: 'rgba(236,72,153,0.12)', color: '#ec4899', fontWeight: 600 }}>
                +{stats.period_recommendations || 0} Recs
              </span>
            </div>
          )}
        </div>

        {/* Expandable Custom Date Range Picker */}
        {showCustomPicker && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!customStart || !customEnd) return;
              if (onFilterChange) onFilterChange({ start_date: customStart, end_date: customEnd });
            }}
            className="animate-fade-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              padding: '1rem',
              background: 'rgba(0,0,0,0.45)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(212,175,55,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                From:
              </label>
              <input
                type="date"
                required
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="input"
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.85rem',
                  colorScheme: 'dark',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                To:
              </label>
              <input
                type="date"
                required
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="input"
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.85rem',
                  colorScheme: 'dark',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#ffffff',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !customStart || !customEnd}
              className="btn btn-primary"
              style={{
                padding: '0.4rem 1.1rem',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-pill)',
                boxShadow: '0 0 12px rgba(236,72,153,0.3)',
              }}
            >
              {loading ? 'Filtering...' : 'Apply Date Filter'}
            </button>
          </form>
        )}
      </div>



      {/* ── Section 2: Velvet Glow Trend Area Graph ─────────────────────── */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          background: 'linear-gradient(180deg, rgba(26,15,30,0.85) 0%, rgba(18,10,21,0.95) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>📈</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {stats.filter_days === 7
                  ? '7-Day'
                  : stats.filter_days === 30
                  ? '30-Day'
                  : stats.filter_days === 90
                  ? '90-Day'
                  : stats.filter_days === 0
                  ? 'All-Time'
                  : stats.filter_days
                  ? `${stats.filter_days}-Day`
                  : 'Activity & Growth'}{' '}
                Trends & Velocity
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Rolling velocity across AI stylist generations, closet uploads, and account signups.
            </p>
          </div>

          {/* Metric Selector Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.4)', padding: '0.25rem', borderRadius: 'var(--radius-pill)' }}>
            {[
              { id: 'all', label: 'All Metrics', color: '#fff' },
              { id: 'recommendations', label: 'AI Looks', color: '#ec4899' },
              { id: 'outfits', label: 'Uploads', color: '#60a5fa' },
              { id: 'users', label: 'Users', color: '#d4af37' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSelectedMetric(btn.id)}
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: selectedMetric === btn.id ? 700 : 500,
                  color: selectedMetric === btn.id ? '#ffffff' : 'var(--color-text-muted)',
                  background: selectedMetric === btn.id ? 'rgba(236,72,153,0.3)' : 'transparent',
                  border: selectedMetric === btn.id ? `1px solid ${btn.color}` : '1px solid transparent',
                  borderRadius: 'var(--radius-pill)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive SVG Area Chart */}
        <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: '100%', height: 'auto', minWidth: '580px', overflow: 'visible' }}
            onMouseLeave={() => setHoveredPointIndex(null)}
          >
            <defs>
              {/* Gradients for glow area fills */}
              <linearGradient id="recGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="outfitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="userGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Horizontal Guide Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    fill="var(--color-text-muted)"
                    fontSize="10"
                    textAnchor="end"
                  >
                    {Math.round(ratio * chartMax)}
                  </text>
                </g>
              );
            })}

            {/* Area Fills */}
            {(selectedMetric === 'all' || selectedMetric === 'outfits') && (
              <path d={outfitAreaPath} fill="url(#outfitGrad)" />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'users') && (
              <path d={userAreaPath} fill="url(#userGrad)" />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'recommendations') && (
              <path d={recAreaPath} fill="url(#recGrad)" />
            )}

            {/* Line Strokes with Glow */}
            {(selectedMetric === 'all' || selectedMetric === 'outfits') && (
              <path
                d={outfitPath}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2.5"
                filter="url(#glow)"
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'users') && (
              <path
                d={userPath}
                fill="none"
                stroke="#d4af37"
                strokeWidth="2.5"
                filter="url(#glow)"
              />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'recommendations') && (
              <path
                d={recPath}
                fill="none"
                stroke="#ec4899"
                strokeWidth="3"
                filter="url(#glow)"
              />
            )}

            {/* X-axis Date Labels */}
            {timeSeries.map((d, index) => {
              const step =
                timeSeries.length > 45 ? 7 : timeSeries.length > 20 ? 4 : timeSeries.length > 10 ? 2 : 1;
              if (index % step !== 0 && index !== timeSeries.length - 1) return null;
              const x = paddingX + (index / Math.max(timeSeries.length - 1, 1)) * (chartWidth - paddingX * 2);
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight - 8}
                  fill="var(--color-text-muted)"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {d.date}
                </text>
              );
            })}

            {/* Interactive Cursor Tracking */}
            {timeSeries.map((d, index) => {
              const x = paddingX + (index / Math.max(timeSeries.length - 1, 1)) * (chartWidth - paddingX * 2);
              const isHovered = hoveredPointIndex === index;
              return (
                <g key={index} onMouseEnter={() => setHoveredPointIndex(index)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x - 15}
                    y={paddingY}
                    width="30"
                    height={chartHeight - paddingY * 2}
                    fill="transparent"
                  />
                  {isHovered && (
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={bottomY}
                      stroke="rgba(236,72,153,0.5)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}
                  {(selectedMetric === 'all' || selectedMetric === 'recommendations') && recPoints[index] && (
                    <circle
                      cx={recPoints[index].x}
                      cy={recPoints[index].y}
                      r={isHovered ? 6 : 3.5}
                      fill="#ec4899"
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2 : 1}
                    />
                  )}
                  {(selectedMetric === 'all' || selectedMetric === 'outfits') && outfitPoints[index] && (
                    <circle
                      cx={outfitPoints[index].x}
                      cy={outfitPoints[index].y}
                      r={isHovered ? 5.5 : 3}
                      fill="#60a5fa"
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2 : 1}
                    />
                  )}
                  {(selectedMetric === 'all' || selectedMetric === 'users') && userPoints[index] && (
                    <circle
                      cx={userPoints[index].x}
                      cy={userPoints[index].y}
                      r={isHovered ? 5.5 : 3}
                      fill="#d4af37"
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2 : 1}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip Callout */}
          {hoveredPointIndex !== null && timeSeries[hoveredPointIndex] && (
            <div
              className="animate-scale-in"
              style={{
                position: 'absolute',
                top: '10px',
                right: '20px',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(26,15,30,0.95)',
                border: '1px solid rgba(236,72,153,0.4)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                pointerEvents: 'none',
                minWidth: '170px',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 700, marginBottom: '0.35rem' }}>
                📅 {timeSeries[hoveredPointIndex].date}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ec4899' }}>
                  <span>AI Recommendations:</span>
                  <strong>{timeSeries[hoveredPointIndex].recommendations}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa' }}>
                  <span>Outfits Uploaded:</span>
                  <strong>{timeSeries[hoveredPointIndex].outfits}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d4af37' }}>
                  <span>New Users:</span>
                  <strong>{timeSeries[hoveredPointIndex].users}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899', display: 'inline-block' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>AI Looks Generated</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>Outfits Uploaded</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d4af37', display: 'inline-block' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>User Registrations</span>
          </div>
        </div>
      </div>

      {/* ── Section 3: Dual Grid (Donut Breakdown + Top AI Recommendations) ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Catalog Categories Donut Card */}
        <div
          className="card"
          style={{
            padding: '1.75rem',
            background: 'linear-gradient(180deg, rgba(26,15,30,0.85) 0%, rgba(18,10,21,0.95) 100%)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.25rem' }}>💎</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Catalog Distribution</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Breakdown of approved pieces available for the AI recommendation engine.
            </p>

            {/* Donut Graphic & Legend Container */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="18"
                  />
                  {donutSegments.map((seg, i) => (
                    <circle
                      key={i}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="18"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      style={{ transition: 'all 0.5s ease' }}
                    />
                  ))}
                </svg>

                {/* Center Badge */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                    {totalCatItems}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Items
                  </span>
                </div>
              </div>

              {/* Segment Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '140px' }}>
                {donutSegments.map((seg) => (
                  <div key={seg.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: seg.color }} />
                      <span style={{ textTransform: 'capitalize' }}>{seg.category}</span>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                      {seg.count} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>({seg.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Color Palettes Section */}
          {colorPalettes.length > 0 && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                Trending Catalog Tones
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {colorPalettes.map((cp, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: cp.color.toLowerCase().includes('gold')
                          ? '#d4af37'
                          : cp.color.toLowerCase().includes('silver')
                          ? '#e2e8f0'
                          : cp.color.toLowerCase().includes('red') || cp.color.toLowerCase().includes('berry')
                          ? '#ef4444'
                          : '#a855f7',
                      }}
                    />
                    <span>{cp.color}</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>({cp.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top AI Recommended Items Leaderboard Card */}
        <div
          className="card"
          style={{
            padding: '1.75rem',
            background: 'linear-gradient(180deg, rgba(26,15,30,0.85) 0%, rgba(18,10,21,0.95) 100%)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>👑</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>AI Stylist Leaderboard</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Most frequently paired catalog pieces recommended by the recommendation model.
          </p>

          {topRecommended.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
              <p style={{ fontSize: '0.9rem' }}>No AI recommendations paired yet.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                As users style outfits with jewelry and makeup, top performers will rank here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topRecommended.map((item, rank) => (
                <div
                  key={item.item_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: rank === 0 ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)',
                    border: rank === 0 ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: rank === 0 ? '#d4af37' : 'rgba(255,255,255,0.1)',
                        color: rank === 0 ? '#000000' : 'var(--color-text-secondary)',
                      }}
                    >
                      {rank + 1}
                    </span>

                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.item_name}
                        style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(255,255,255,0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                        }}
                      >
                        💎
                      </div>
                    )}

                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text)' }}>
                        {item.item_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                        {item.category} {item.price ? `• Rs ${item.price}` : ''}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(236,72,153,0.15)',
                      border: '1px solid rgba(236,72,153,0.3)',
                      color: 'var(--color-primary-light)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    ⭐ {item.recommendation_count} {item.recommendation_count === 1 ? 'pick' : 'picks'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
