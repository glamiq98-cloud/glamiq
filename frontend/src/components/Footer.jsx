import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#08040a', borderTop: '1px solid rgba(236, 72, 153, 0.15)', marginTop: '5rem', padding: '4rem 1.5rem 2rem' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
        
        {/* Col 1: Brand Info */}
        <div>
          <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
              Glam<span style={{ color: 'var(--color-primary-light)', fontStyle: 'italic' }}>IQ</span>
            </span>
          </Link>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Pakistan’s premier AI-powered fashion platform. Instantly coordinate designer bridal & festive dresses with authentic Kundan & Polki jewelry and signature glam makeup.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span className="badge-pill" style={{ textTransform: 'none', letterSpacing: 'normal' }}>
              🇵🇰 Free Delivery over Rs. 2,999
            </span>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Collections
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            <li><Link to="/dresses?collection=bridal" style={{ color: 'inherit' }}>Pakistani Bridal Lehengas</Link></li>
            <li><Link to="/dresses?collection=festive" style={{ color: 'inherit' }}>Festive & Velvet Formals</Link></li>
            <li><Link to="/jewellery?collection=kundan" style={{ color: 'inherit' }}>Heritage Kundan & Polki Sets</Link></li>
            <li><Link to="/jewellery?collection=chandbali" style={{ color: 'inherit' }}>Chandbalis & Matha Patti</Link></li>
            <li><Link to="/makeup?collection=lips" style={{ color: 'inherit' }}>Velvet Matte Lip Colors</Link></li>
            <li><Link to="/makeup?collection=eyes" style={{ color: 'inherit' }}>Golden Hour Eye Palettes</Link></li>
          </ul>
        </div>

        {/* Col 3: AI Fashion Tools */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            AI Styling Tools
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            <li><Link to="/analyzer" style={{ color: 'inherit' }}>✨ AI Dress & Color Analyzer</Link></li>
            <li><Link to="/stylist" style={{ color: 'inherit' }}>💬 24/7 Virtual Stylist Assistant</Link></li>
            <li><Link to="/profile" style={{ color: 'inherit' }}>🧬 Skin Tone & Undertone DNA</Link></li>
            <li><Link to="/outfits" style={{ color: 'inherit' }}>👗 Wardrobe & Lookbook</Link></li>
            <li><Link to="/admin/login" style={{ color: 'inherit' }}>🛡️ Admin Management Console</Link></li>
          </ul>
        </div>

        {/* Col 4: Express Shipping & Trust */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Customer Care
          </h4>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Delivering across Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Peshawar & worldwide.
          </p>
          <div style={{ background: 'rgba(36, 20, 42, 0.6)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.8125rem', color: '#fce7f3' }}>
            <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>📞 Stylist Hotline</p>
            <p style={{ color: 'var(--color-accent-light)' }}>support@glamiq.pk</p>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>100% Authentic Handcrafted Quality Guaranteed</p>
          </div>
        </div>

      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', paddingTop: '2rem', borderTop: '1px solid rgba(236, 72, 153, 0.1)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
        <p>© 2026 GlamIQ. All rights reserved. Built with AI Precision for Pakistani Fashion.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Shipping & Returns</span>
        </div>
      </div>
    </footer>
  );
}
