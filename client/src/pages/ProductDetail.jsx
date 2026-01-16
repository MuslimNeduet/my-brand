import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState('');
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setP(res.data))
      .catch(() => setErr('Failed to load product'));
  }, [id]);

  const handleAdd = () => {
    if (!isAuthenticated) return navigate('/login');
    addToCart(p, qty);
  };

  if (err) return <p className="error">{err}</p>;
  if (!p) return <p className="muted">Loading...</p>;

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <div className="card">
        <div className="media" style={{ height: 380 }}>
          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <span className="muted">No image</span>}
        </div>
      </div>
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>{p.name}</h2>
        <p className="price" style={{ fontSize: 22 }}>${Number(p.price ?? 0).toFixed(2)}</p>
        <p className="muted">{p.description}</p>
        <div className="spacer"></div>
        <div className="field" style={{ maxWidth: 160 }}>
          <label className="label">Quantity</label>
          <input className="input" type="number" min="1" value={qty} onChange={(e)=>setQty(Number(e.target.value || 1))} />
        </div>
        <button className="btn btn-primary" disabled={p.countInStock === 0} onClick={handleAdd}>
          {p.countInStock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}