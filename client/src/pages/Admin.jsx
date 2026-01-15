import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    price: '',
    countInStock: '',
    category: '',
    brand: '',
    description: '',
    imageUrl: ''
  });
  const [file, setFile] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (e) {
      setErr('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const uploadImage = async () => {
    if (!file) return null;
    const fd = new FormData();
    fd.append('image', file);
    const res = await api.post('/products/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.url;
  };

  const createProduct = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const url = await uploadImage();
      const payload = { ...form, price: Number(form.price || 0), countInStock: Number(form.countInStock || 0), imageUrl: url || form.imageUrl };
      await api.post('/products', payload);
      setForm({ name: '', price: '', countInStock: '', category: '', brand: '', description: '', imageUrl: '' });
      setFile(null);
      await fetchProducts();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Failed to create product');
    }
  };

  const updateProduct = async (id, data) => {
    try {
      await api.put(`/products/${id}`, data);
      await fetchProducts();
    } catch (e) {
      setErr('Update failed');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      await fetchProducts();
    } catch (e) {
      setErr('Delete failed');
    }
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
      <div className="panel">
        <h2>Create Product</h2>
        {err && <p className="error">{err}</p>}
        <form onSubmit={createProduct}>
          <div className="field"><label className="label">Name</label><input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /></div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field"><label className="label">Price</label><input className="input" type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} required /></div>
            <div className="field"><label className="label">Stock</label><input className="input" type="number" value={form.countInStock} onChange={e=>setForm({...form, countInStock:e.target.value})} required /></div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field"><label className="label">Category</label><input className="input" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} /></div>
            <div className="field"><label className="label">Brand</label><input className="input" value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} /></div>
          </div>
          <div className="field"><label className="label">Description</label><textarea className="textarea" rows="4" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} /></div>
          <div className="field">
            <label className="label">Image File</label>
            <input className="input" type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
          </div>
          <button className="btn btn-primary" type="submit">Create</button>
        </form>
      </div>

      <div className="panel">
        <h2>Products</h2>
        {loading && <p className="muted">Loading...</p>}
        <table className="table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>{p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width:52, height:52, objectFit:'cover', borderRadius:8 }} />}</td>
                <td>
                  <input className="input" defaultValue={p.name} onBlur={(e)=>updateProduct(p._id, { name: e.target.value })} />
                </td>
                <td>
                  <input className="input" type="number" step="0.01" defaultValue={p.price} onBlur={(e)=>updateProduct(p._id, { price: Number(e.target.value || 0) })} />
                </td>
                <td>
                  <input className="input" type="number" defaultValue={p.countInStock} onBlur={(e)=>updateProduct(p._id, { countInStock: Number(e.target.value || 0) })} />
                </td>
                <td>
                  <button className="btn" onClick={()=>deleteProduct(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}