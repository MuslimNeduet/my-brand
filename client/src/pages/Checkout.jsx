import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useCart } from '../state/CartContext.jsx';

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [address, setAddress] = useState({ houseNo:'', streetNo:'', area:'', city:'', province:'', country:'' });

  const update = (obj, set) => (e) => set({ ...obj, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!items.length) { setErr('Cart is empty.'); return; }
    setLoading(true);
    try {
      await api.post('/orders', { customer, address, items });
      clear();
      navigate('/thank-you');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="grid" style={{ gridTemplateColumns: '2fr 1fr' }} onSubmit={onSubmit}>
      <div className="panel">
        <h2>Checkout</h2>
        {err && <p className="error">{err}</p>}

        <div className="field">
          <label className="label">Full Name</label>
          <input className="input" required name="name" value={customer.name} onChange={update(customer, setCustomer)} />
        </div>
        <div className="field">
          <label className="label">Email</label>
          <input className="input" required type="email" name="email" value={customer.email} onChange={update(customer, setCustomer)} />
        </div>
        <div className="field">
          <label className="label">Contact Number</label>
          <input className="input" required type="tel" name="phone" value={customer.phone} onChange={update(customer, setCustomer)} placeholder="+92XXXXXXXXXX" />
        </div>

        <h3>Shipping Address</h3>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="field">
            <label className="label">House No</label>
            <input className="input" required name="houseNo" value={address.houseNo} onChange={update(address, setAddress)} />
          </div>
          <div className="field">
            <label className="label">Street No</label>
            <input className="input" required name="streetNo" value={address.streetNo} onChange={update(address, setAddress)} />
          </div>
          <div className="field">
            <label className="label">Area</label>
            <input className="input" required name="area" value={address.area} onChange={update(address, setAddress)} />
          </div>
          <div className="field">
            <label className="label">City</label>
            <input className="input" required name="city" value={address.city} onChange={update(address, setAddress)} />
          </div>
          <div className="field">
            <label className="label">Province</label>
            <input className="input" required name="province" value={address.province} onChange={update(address, setAddress)} />
          </div>
          <div className="field">
            <label className="label">Country</label>
            <input className="input" required name="country" value={address.country} onChange={update(address, setAddress)} />
          </div>
        </div>
        <div className="spacer"></div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>

      <div className="panel">
        <h3>Summary</h3>
        <p className="row"><span className="muted">Items</span><span>{items.length}</span></p>
        <p className="row"><span className="muted">Subtotal</span><span>${subtotal.toFixed(2)}</span></p>
        <div className="spacer"></div>
        <ul style={{ paddingLeft: 18 }}>
          {items.map(it => <li key={it._id}>{it.name} × {it.qty}</li>)}
        </ul>
      </div>
    </form>
  );
}