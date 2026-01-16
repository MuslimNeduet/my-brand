import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useCart } from '../state/CartContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    setLoading(true);
    setErr('');
    try {
      const payload = {
        items: items.map(i => ({ product: i._id, qty: Number(i.qty || 1) })),
        tax: 0,
        shipping: 0
      };
      const res = await api.post('/orders', payload);
      if (res?.data?.ok) {
        clearCart();
        navigate('/thank-you');
      } else {
        throw new Error(res?.data?.message || 'Unknown error');
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="panel">
        <h2>Checkout</h2>
        <p className="muted">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>Checkout</h2>
      {err && <p className="error">{err}</p>}
      <p className="row"><span className="muted">Items</span> <span>{items.length}</span></p>
      <p className="row"><span className="muted">Subtotal</span> <span>${Number(subtotal ?? 0).toFixed(2)}</span></p>
      <div className="spacer"></div>
      <button className="btn btn-primary" disabled={loading} onClick={placeOrder}>
        {loading ? 'Placing order...' : 'Place Order'}
      </button>
    </div>
  );
}