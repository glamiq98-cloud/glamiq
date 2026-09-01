/**
 * Global Luxury Layout for GlamIQ.
 * Combines announcement ticker, luxury navbar, page content outlet,
 * slide-out cart drawer, persistent AI stylist widget, and luxury footer.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementTicker from './AnnouncementTicker';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import ChatWidget from './ChatWidget';
import Footer from './Footer';

export default function Layout() {
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

      {/* AI Virtual Stylist Floating Assistant */}
      <ChatWidget />

      {/* Luxury Footer */}
      <Footer />
    </div>
  );
}
