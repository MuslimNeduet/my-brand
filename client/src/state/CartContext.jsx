import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(p => p._id === product._id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { _id: product._id, name: product.name, price: product.price, imageUrl: product.imageUrl, qty }];
    });
  };
  const removeFromCart = (id) => setItems(prev => prev.filter(p => p._id !== id));
  const setQty = (id, qty) => setItems(prev => prev.map(p => p._id === id ? { ...p, qty: Math.max(1, qty) } : p));
  const clear = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((a, p) => a + p.price * p.qty, 0), [items]);
  const count = useMemo(() => items.reduce((a, p) => a + p.qty, 0), [items]);

  const value = { items, addToCart, removeFromCart, setQty, clear, subtotal, count };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}