/**
 * Shopping Cart Context for GlamIQ luxury fashion platform.
 * Supports adding jewelry, makeup, and dresses with item counts, subtotal, and drawer controls.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const local = localStorage.getItem('glamiq_cart');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('glamiq_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.item_id === item.item_id || (i.name === item.item_name && i.category === item.category));
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsDrawerOpen(true);
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => prev.filter((i) => i.item_id !== itemId && i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.item_id === itemId || i.id === itemId ? { ...i, quantity: newQty } : i
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const totalCount = cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0);
  
  // Calculate total price in PKR (or convert if stored in USD)
  const totalPrice = cartItems.reduce((acc, i) => {
    const p = parseFloat(i.price) || 0;
    // If price is under 500, treat as USD and display converted to PKR (e.g. 1 USD = 280 PKR) or direct
    const pricePkr = p > 500 ? p : p * 280;
    return acc + pricePkr * (i.quantity || 1);
  }, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalCount,
    totalPrice,
    isDrawerOpen,
    setIsDrawerOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
