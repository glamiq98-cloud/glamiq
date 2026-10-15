/**
 * Global Luxury Layout for GlamIQ.
 * Combines announcement ticker, luxury navbar, page content outlet,
 * slide-out cart drawer, persistent AI stylist widget, and luxury footer.
 */

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementTicker from './AnnouncementTicker';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import ChatWidget from './ChatWidget';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  // Hide the floating stylist widget on admin pages: its fixed position
  // overlapped the Add Item / Save Changes buttons in the admin forms.
  const isAdminPage = location.pathname.startsWith('/admin');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Top rolling announcement marquee */}
      <AnnouncementTicker />

      {/* Main Luxury Navigation Bar */}
      <Navbar />

      {/* Page Content */}
      <main style={{ flex: 1, minHeight: '80vh' }}>
        <Outlet />
      </main>

      {/* Slide-out Luxury Shopping Cart Drawer */}
      <CartDrawer />

      {/* AI Virtual Stylist Floating Assistant (hidden on admin pages) */}
      {!isAdminPage && <ChatWidget />}

      {/* Luxury Footer */}
      <Footer />
    </div>
  );
}
