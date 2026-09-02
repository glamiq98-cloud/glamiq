import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice, isDrawerOpen, setIsDrawerOpen } = useCart();
  
  // Steps: 'cart' | 'checkout' | 'success'
  const [step, setStep] = useState('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);

  // Checkout Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: 'Lahore',
    address: '',
    paymentMethod: 'cod', // 'cod' | 'jazzcash' | 'card' | 'bank'
    mobileAccount: '',
    cardHolder: '',
    cardNumber: '',
    cardExpiry: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState({});

  if (!isDrawerOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateCheckout = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.phone.trim()) errors.phone = 'Contact number is required';
    if (!formData.address.trim()) errors.address = 'Delivery address is required';

    if (formData.paymentMethod === 'jazzcash' && !formData.mobileAccount.trim()) {
      errors.mobileAccount = 'Account phone number is required';
    }
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) errors.cardNumber = 'Card number is required';
      if (!formData.cardExpiry.trim()) errors.cardExpiry = 'Expiry date required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validateCheckout()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const orderRef = `GLAM-PK-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderSummary({
        orderRef,
        itemsCount: cartItems.length,
        total: totalPrice,
        deliveryMethod: totalPrice >= 2999 ? 'Free Express Delivery (2-3 Days)' : 'Standard TCS / Leopard Delivery (Rs. 250)',
        paymentMethodName:
          formData.paymentMethod === 'cod'
            ? 'Cash on Delivery (COD)'
            : formData.paymentMethod === 'jazzcash'
            ? 'JazzCash / EasyPaisa Mobile Wallet'
            : formData.paymentMethod === 'card'
            ? 'Credit / Debit Card'
            : 'Online Bank Transfer (IBFT)',
        customer: { ...formData },
      });
      clearCart();
      setIsProcessing(false);
      setStep('success');
    }, 1200);
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    // Reset state after drawer closes
    setTimeout(() => {
      setStep('cart');
      setOrderSummary(null);
    }, 300);
  };

  const shippingFee = totalPrice >= 2999 || totalPrice === 0 ? 0 : 250;
  const grandTotal = totalPrice + shippingFee;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={handleClose}
    >
      <div
        className="animate-slide-left"
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          background: '#130917',
          borderLeft: '1px solid rgba(236, 72, 153, 0.3)',
          padding: '1.75rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 45px rgba(0, 0, 0, 0.85)',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(236, 72, 153, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {step === 'checkout' && (
              <button
                onClick={() => setStep('cart')}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-primary-light)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem 0.4rem' }}
                title="Back to cart"
              >
                ←
              </button>
            )}
            <span style={{ fontSize: '1.4rem' }}>
              {step === 'cart' ? '🛍️' : step === 'checkout' ? '💳' : '🎉'}
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#ffffff' }}>
              {step === 'cart' ? 'My Fashion Cart' : step === 'checkout' ? 'Checkout & Payment' : 'Order Confirmed!'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(236, 72, 153, 0.12)',
              border: '1px solid rgba(236, 72, 153, 0.25)',
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

        {/* ── STEP 1: CART VIEW ── */}
        {step === 'cart' && (
          <>
            {/* Free Shipping Banner */}
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.18), rgba(212, 175, 55, 0.18))',
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
                  <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>🛍️</span>
                  <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                    Your cart is empty
                  </p>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>
                    Discover matching Kundan jewellery, designer dresses & bridal glam makeup.
                  </p>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.875rem' }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const id = item.item_id || item.id;
                  return (
                    <div
                      key={id}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(236, 72, 153, 0.15)',
                        alignItems: 'center',
                      }}
                    >
                      <img
                        src={item.image_url}
                        alt={item.item_name}
                        style={{ width: '68px', height: '68px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.2rem' }}>
                          {item.item_name}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                          {item.color} • {item.category}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-accent-light)' }}>
                          Rs. {item.price?.toLocaleString()}
                        </div>
                      </div>

                      {/* Controls */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <button
                            onClick={() => updateQuantity(id, item.quantity - 1)}
                            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(id, item.quantity + 1)}
                            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.85rem', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(id)}
                          style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.75rem', padding: '0.2rem' }}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Footer */}
            {cartItems.length > 0 && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(236, 72, 153, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  <span>Subtotal</span>
                  <span>Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  <span>Shipping (Pakistan)</span>
                  <span style={{ color: shippingFee === 0 ? '#4ade80' : 'inherit' }}>
                    {shippingFee === 0 ? 'FREE' : `Rs. ${shippingFee}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--color-accent-light)' }}>Rs. {grandTotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', fontWeight: 700 }}
                >
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── STEP 2: CHECKOUT & PAYMENT METHOD FORM ── */}
        {step === 'checkout' && (
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Order Mini-Recap */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: 'var(--radius-md)', padding: '0.9rem 1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Items in Cart ({cartItems.length}):</span>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#ffffff' }}>
                  Rs. {grandTotal.toLocaleString()}{' '}
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#4ade80' }}>
                    ({shippingFee === 0 ? 'Free Delivery' : '+Rs. 250 Delivery'})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('cart')}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary-light)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Edit Cart
              </button>
            </div>

            {/* Section 1: Customer & Delivery Address */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📍 Shipping Details (Pakistan)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Ayesha Khan"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: formErrors.fullName ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  />
                  {formErrors.fullName && <span style={{ color: '#f43f5e', fontSize: '0.75rem' }}>{formErrors.fullName}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0300 1234567"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: formErrors.phone ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                      }}
                    />
                    {formErrors.phone && <span style={{ color: '#f43f5e', fontSize: '0.75rem' }}>{formErrors.phone}</span>}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      City *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        background: '#1f1324',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#ffffff',
                        fontSize: '0.9rem',
                      }}
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="Gujranwala">Gujranwala</option>
                      <option value="Other">Other City</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Complete Street Address *
                  </label>
                  <textarea
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House / Apartment #, Street, Phase, Area"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: formErrors.address ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      resize: 'none',
                    }}
                  />
                  {formErrors.address && <span style={{ color: '#f43f5e', fontSize: '0.75rem' }}>{formErrors.address}</span>}
                </div>
              </div>
            </div>

            {/* Section 2: Payment Methods */}
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                💳 Select Payment Method
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                
                {/* Method 1: COD */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: formData.paymentMethod === 'cod' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: formData.paymentMethod === 'cod' ? '1px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    style={{ marginTop: '0.2rem', accentColor: '#ec4899' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>💵 Cash on Delivery (COD)</span>
                      <span className="badge-pill" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>Most Popular</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                      Pay in cash when your designer parcel is delivered directly to your doorstep.
                    </p>
                  </div>
                </label>

                {/* Method 2: JazzCash / EasyPaisa */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: formData.paymentMethod === 'jazzcash' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: formData.paymentMethod === 'jazzcash' ? '1px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="jazzcash"
                    checked={formData.paymentMethod === 'jazzcash'}
                    onChange={handleInputChange}
                    style={{ marginTop: '0.2rem', accentColor: '#ec4899' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>📱 JazzCash / EasyPaisa Wallet</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                      Instant mobile transfer via JazzCash or EasyPaisa account.
                    </p>

                    {formData.paymentMethod === 'jazzcash' && (
                      <div style={{ marginTop: '0.65rem' }}>
                        <input
                          type="text"
                          name="mobileAccount"
                          value={formData.mobileAccount}
                          onChange={handleInputChange}
                          placeholder="Your Mobile Wallet Number (03XX-XXXXXXX)"
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: formErrors.mobileAccount ? '1px solid #f43f5e' : '1px solid rgba(236, 72, 153, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                        {formErrors.mobileAccount && <span style={{ color: '#f43f5e', fontSize: '0.75rem' }}>{formErrors.mobileAccount}</span>}
                      </div>
                    )}
                  </div>
                </label>

                {/* Method 3: Credit / Debit Card */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: formData.paymentMethod === 'card' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: formData.paymentMethod === 'card' ? '1px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    style={{ marginTop: '0.2rem', accentColor: '#ec4899' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>💳 Visa / MasterCard / PayPak</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                      Encrypted card checkout with 3D-Secure bank OTP verification.
                    </p>

                    {formData.paymentMethod === 'card' && (
                      <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="Card Number (16 Digits)"
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: formErrors.cardNumber ? '1px solid #f43f5e' : '1px solid rgba(236, 72, 153, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <input
                            type="text"
                            name="cardExpiry"
                            value={formData.cardExpiry}
                            onChange={handleInputChange}
                            placeholder="MM / YY"
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: formErrors.cardExpiry ? '1px solid #f43f5e' : '1px solid rgba(236, 72, 153, 0.3)',
                              borderRadius: 'var(--radius-sm)',
                              color: '#ffffff',
                              fontSize: '0.85rem',
                            }}
                          />
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="CVV / CVC"
                            style={{
                              width: '100%',
                              padding: '0.5rem 0.75rem',
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: '1px solid rgba(236, 72, 153, 0.3)',
                              borderRadius: 'var(--radius-sm)',
                              color: '#ffffff',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* Method 4: Bank Transfer */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: formData.paymentMethod === 'bank' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: formData.paymentMethod === 'bank' ? '1px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={formData.paymentMethod === 'bank'}
                    onChange={handleInputChange}
                    style={{ marginTop: '0.2rem', accentColor: '#ec4899' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
                      🏦 Direct Online Bank Transfer (IBFT / Raast)
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                      Transfer directly to Meezan Bank / HBL official account.
                    </p>

                    {formData.paymentMethod === 'bank' && (
                      <div style={{ marginTop: '0.65rem', padding: '0.65rem', background: 'rgba(0, 0, 0, 0.5)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#fce7f3' }}>
                        <div><strong>Bank:</strong> Meezan Bank Limited</div>
                        <div><strong>Title:</strong> GlamIQ Haute Couture Ltd</div>
                        <div><strong>IBAN:</strong> PK82MEZN00010982348501</div>
                        <div><strong>Raast ID:</strong> 03008492019</div>
                        <div style={{ marginTop: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                          * Reference order number on transfer receipt.
                        </div>
                      </div>
                    )}
                  </div>
                </label>

              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <button
                type="submit"
                disabled={isProcessing}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', fontWeight: 800 }}
              >
                {isProcessing ? 'Confirming Your Order...' : `Confirm Purchase (Rs. ${grandTotal.toLocaleString()})`}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: ORDER CONFIRMED / SUCCESS RECEIPT ── */}
        {step === 'success' && orderSummary && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(16, 185, 129, 0.4))', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '2rem' }}>
              ✓
            </div>

            <span className="badge-pill" style={{ marginBottom: '0.5rem' }}>
              Order Confirmed
            </span>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
              Shukriya, {orderSummary.customer.fullName}!
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
              Your order has been placed with GlamIQ. Our fashion concierge will verify details via WhatsApp before dispatch.
            </p>

            {/* Receipt Card */}
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(236, 72, 153, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Order Reference:</span>
                <strong style={{ color: 'var(--color-primary-light)' }}>{orderSummary.orderRef}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Payment Method:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{orderSummary.paymentMethodName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Delivery City:</span>
                <span style={{ color: '#ffffff' }}>{orderSummary.customer.city}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Estimated Delivery:</span>
                <span style={{ color: '#4ade80', fontWeight: 600 }}>2 - 3 Business Days</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800 }}>
                <span>Total Paid / Due:</span>
                <span style={{ color: 'var(--color-accent-light)' }}>Rs. {orderSummary.total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
