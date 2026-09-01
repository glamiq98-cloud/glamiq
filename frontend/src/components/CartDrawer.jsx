import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice, isDrawerOpen, setIsDrawerOpen } = useCart();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!isDrawerOpen) return null;

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      clearCart();
      setCheckoutSuccess(false);
      setIsDrawerOpen(false);
    }, 2500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={() => setIsDrawerOpen(false)}
    >
      <div
        className="animate-slide-left"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: '#130a16',
          borderLeft: '1px solid rgba(236, 72, 153, 0.25)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(236, 72, 153, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🛍️</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              My Fashion Cart
            </h2>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            style={{
              background: 'rgba(236, 72, 153, 0.1)',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Free Shipping Banner */}
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.15), rgba(212, 175, 55, 0.15))',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            fontSize: '0.8125rem',
            color: '#fce7f3',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>🌸</span>
          <span>
            {totalPrice >= 2999
              ? 'Congratulations! You qualify for Free Express Shipping in Pakistan.'
              : `Add Rs. ${(2999 - totalPrice).toLocaleString()} more for Free Express Shipping!`}
          </span>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.25rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto 0', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛍️</span>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
                Your cart is empty
              </p>
              <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Discover matching Kundan jewellery, designer dresses & bridal glam makeup.
              </p>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem' }}
              >
                Explore Collection
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => {
              const unitPrice = (parseFloat(item.price) || 0) > 500 ? parseFloat(item.price) : (parseFloat(item.price) || 0) * 280;
              return (
                <div
                  key={idx}
                  className="glass-card"
                  style={{
                    padding: '0.85rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    background: 'rgba(36, 20, 42, 0.6)',
                  }}
                >
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200'}
                    alt={item.item_name || item.name}
                    style={{
                      width: '65px',
                      height: '65px',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      border: '1px solid rgba(236, 72, 153, 0.2)',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: '#ffffff',
                        marginBottom: '0.2rem',
                      }}
                    >
                      {item.item_name || item.name}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)', textTransform: 'capitalize', marginBottom: '0.35rem' }}>
                      {item.category} {item.color ? `• ${item.color}` : ''}
                    </p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-accent-light)' }}>
                      Rs. {unitPrice.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Controller */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'rgba(236, 72, 153, 0.1)',
                        border: '1px solid rgba(236, 72, 153, 0.2)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '0.15rem 0.4rem',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.item_id || item.id, (item.quantity || 1) - 1)}
                        style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem', padding: '0 0.25rem' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '14px', textAlign: 'center' }}>
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.item_id || item.id, (item.quantity || 1) + 1)}
                        style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem', padding: '0 0.25rem' }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.item_id || item.id)}
                      style={{ background: 'none', border: 'none', color: '#95819a', cursor: 'pointer', fontSize: '0.75rem' }}
                      title="Remove item"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Checkout */}
        {cartItems.length > 0 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(236, 72, 153, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              <span>Subtotal</span>
              <span>Rs. {totalPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-accent-light)' }}>Rs. {totalPrice.toLocaleString()}</span>
            </div>

            {checkoutSuccess ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.85rem',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                ✨ Order Placed Successfully!
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700 }}
              >
                Proceed to Checkout (Rs. {totalPrice.toLocaleString()})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
