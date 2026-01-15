import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const load = async (query = '') => {
    try {
      setLoading(true);
      const res = await api.get('/products', { params: query ? { q: query } : {} });
      setProducts(res.data);
      setErr('');
    } catch {
      setErr('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSearch = (e) => { e.preventDefault(); load(q); };
  const handleAdd = (p) => {
    if (!isAuthenticated) return navigate('/login');
    addToCart(p, 1);
  };

  return (
    <div>
      <form onSubmit={onSearch} className="row" style={{ gap: 8, marginBottom: 16 }}>
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." />
        <button className="btn" type="submit">Search</button>
      </form>

      {loading && <p className="muted">Loading...</p>}
      {err && <p className="error">{err}</p>}

      <div className="grid">
        {products.map((p) => (
          <div key={p._id} className="card">
            <div className="media">
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <span className="muted">No image</span>}
            </div>
            <div className="body">
              <h3 style={{ margin: '0 0 6px' }}>{p.name}</h3>
              <div className="row">
                <span className="price">${p.price}</span>
                <span className="muted">{p.countInStock > 0 ? 'In stock' : 'Out of stock'}</span>
              </div>
              <div className="row" style={{ marginTop: 12, gap: 12 }}>
                <Link to={`/product/${p._id}`} className="btn">Details</Link>
                <button
                  className="btn btn-primary"
                  disabled={p.countInStock === 0}
                  onClick={() => handleAdd(p)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}