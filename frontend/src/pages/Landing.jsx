/**
 * Landing Page — hero section, features, trending looks, CTA.
 * First impression: premium, dark, with rose-gold/champagne accents.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    icon: '🎨',
    title: 'Color Harmony Engine',
    description: 'Our AI analyzes your outfit colors and finds perfectly complementary jewelry and makeup using color theory.',
  },
  {
    icon: '💍',
    title: 'Jewelry Matching',
    description: 'Gold or silver? Statement or subtle? Get precise jewelry suggestions that elevate your outfit for any occasion.',
  },
  {
    icon: '💄',
    title: 'Makeup Coordination',
    description: 'Lipstick, eyeshadow, and blush recommendations tailored to your outfit, skin tone, and the event.',
  },
  {
    icon: '🤖',
    title: 'Virtual Stylist Chat',
    description: 'Ask our AI stylist anything — from "what earrings go with this?" to "is this too formal for brunch?"',
  },
  {
    icon: '🌟',
    title: 'Skin Tone Aware',
    description: 'Upload a profile photo and our system adapts makeup suggestions to complement your unique skin tone.',
  },
  {
    icon: '📸',
    title: 'Complete Look Builder',
    description: 'See your entire look assembled — outfit, jewelry, and makeup — with clear explanations for every choice.',
  },
];

const trendingLooks = [
  {
    name: 'Midnight Gala',
    outfit: 'Navy Velvet Gown',
    jewelry: 'Silver Statement Necklace',
    makeup: 'Smoky Eyes + Nude Lip',
    gradient: 'linear-gradient(135deg, #1a1a3e 0%, #2d1b4e 50%, #4a1942 100%)',
  },
  {
    name: 'Golden Hour',
    outfit: 'Champagne Silk Dress',
    jewelry: 'Gold Layered Chains',
    makeup: 'Bronze Glow + Peach Lip',
    gradient: 'linear-gradient(135deg, #3d2b1f 0%, #5c3d2e 50%, #7a5230 100%)',
  },
  {
    name: 'Blush Romance',
    outfit: 'Dusty Rose Midi',
    jewelry: 'Rose Gold Hoops',
    makeup: 'Soft Pink Monochrome',
    gradient: 'linear-gradient(135deg, #3d2027 0%, #4e2a33 50%, #6b3a45 100%)',
  },
  {
    name: 'Power Boardroom',
    outfit: 'Black Tailored Blazer',
    jewelry: 'Minimalist Silver Studs',
    makeup: 'Red Lip + Clean Base',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #3a1a1a 100%)',
  },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* ── Hero Section ──────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 72px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '4rem 2rem',
      }}>
        {/* Animated gradient background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(183, 110, 121, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 50%, rgba(201, 169, 110, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(183, 110, 121, 0.08) 0%, transparent 50%)
          `,
          zIndex: 0,
        }} />

        {/* Floating decorative elements */}
        <div className="animate-float" style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(183, 110, 121, 0.1), rgba(201, 169, 110, 0.05))',
          border: '1px solid rgba(183, 110, 121, 0.15)',
          zIndex: 0,
        }} />
        <div className="animate-float delay-300" style={{
          position: 'absolute',
          bottom: '20%',
          left: '8%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(201, 169, 110, 0.08), rgba(183, 110, 121, 0.04))',
          border: '1px solid rgba(201, 169, 110, 0.1)',
          zIndex: 0,
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '800px',
        }}>
          {/* Badge */}
          <div className="animate-fade-in" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            background: 'rgba(183, 110, 121, 0.1)',
            border: '1px solid rgba(183, 110, 121, 0.2)',
            borderRadius: 'var(--radius-full)',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            color: 'var(--color-primary-light)',
            letterSpacing: '0.05em',
          }}>
            <span style={{ fontSize: '0.75rem' }}>✨</span>
            AI-Powered Fashion Styling
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up" style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
          }}>
            Your Outfit,{' '}
            <span className="gradient-text">Perfected</span>
            <br />
            by Intelligence
          </h1>

          {/* Subtitle */}
          <p className="animate-slide-up delay-200" style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--color-text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            Upload your outfit and let Glam IQ's styling engine find the perfect jewelry and makeup match — with a clear explanation for every suggestion.
          </p>

          {/* CTA Buttons */}
          <div className="animate-slide-up delay-300" style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="btn btn-primary"
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.0625rem',
                borderRadius: 'var(--radius-xl)',
              }}
            >
              Start Styling Free →
            </Link>
            <Link
              to="#features"
              className="btn btn-secondary"
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.0625rem',
                borderRadius: 'var(--radius-xl)',
              }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See How It Works
            </Link>
          </div>

          {/* Social proof */}
          <div className="animate-fade-in delay-500" style={{
            marginTop: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
          }}>
            {[
              { number: '10K+', label: 'Looks Created' },
              { number: '98%', label: 'Match Accuracy' },
              { number: '4.9★', label: 'User Rating' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                }} className="gradient-text">{stat.number}</div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────── */}
      <section id="features" style={{
        padding: '6rem 2rem',
        background: 'var(--color-bg-card)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              marginBottom: '1rem',
            }}>
              Style, <span className="gradient-text">Intelligently</span>
            </h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '1.125rem',
              maxWidth: '500px',
              margin: '0 auto',
            }}>
              Every feature designed to make your styling decisions effortless and confident.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="card animate-fade-in"
                style={{
                  animationDelay: `${i * 100}ms`,
                  opacity: 0,
                  animationFillMode: 'forwards',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(183, 110, 121, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  fontFamily: 'var(--font-body)',
                }}>{feature.title}</h3>
                <p style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Looks Section ────────────────────────── */}
      <section style={{
        padding: '6rem 2rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              marginBottom: '1rem',
            }}>
              Trending <span className="gradient-text">Looks</span>
            </h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '1.125rem',
              maxWidth: '500px',
              margin: '0 auto',
            }}>
              See how Glam IQ puts together complete, coordinated styles.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {trendingLooks.map((look, i) => (
              <div
                key={look.name}
                className="animate-fade-in"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.4s ease',
                  cursor: 'pointer',
                  animationDelay: `${i * 150}ms`,
                  opacity: 0,
                  animationFillMode: 'forwards',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-elevated)';
                  e.currentTarget.style.borderColor = 'rgba(183, 110, 121, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
              >
                {/* Gradient preview */}
                <div style={{
                  height: '200px',
                  background: look.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{
                    fontSize: '3rem',
                    opacity: 0.6,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                  }}>
                    {i === 0 ? '🌙' : i === 1 ? '☀️' : i === 2 ? '🌸' : '🖤'}
                  </span>
                </div>

                {/* Info */}
                <div style={{
                  padding: '1.25rem',
                  background: 'var(--color-bg-card)',
                }}>
                  <h3 style={{
                    fontSize: '1.0625rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-body)',
                  }}>{look.name}</h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.375rem',
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-secondary)',
                  }}>
                    <div><span style={{ color: 'var(--color-primary-light)' }}>Outfit:</span> {look.outfit}</div>
                    <div><span style={{ color: 'var(--color-accent)' }}>Jewelry:</span> {look.jewelry}</div>
                    <div><span style={{ color: 'var(--color-primary-300)' }}>Makeup:</span> {look.makeup}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section style={{
        padding: '6rem 2rem',
        background: 'var(--color-bg-card)',
        borderTop: '1px solid var(--color-border)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 700,
            marginBottom: '1rem',
          }}>
            Ready to <span className="gradient-text">Elevate Your Style</span>?
          </h2>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '1.125rem',
            marginBottom: '2.5rem',
            lineHeight: 1.7,
          }}>
            Join Glam IQ and let AI transform how you put together outfits. No more guessing — just confidence.
          </p>
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="btn btn-accent"
            style={{
              padding: '1rem 3rem',
              fontSize: '1.0625rem',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            ✨ Create Your First Look
          </Link>
        </div>
      </section>
    </div>
  );
}
