import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../lib/api.js';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { name, email, password });
      // After registration, go to login instead of auto-login
      // Clear any prior token
      setAuthToken(null);
      localStorage.removeItem('user');
      navigate('/login');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={onSubmit} className="form" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Register</h2>
      {err && <p className="error">{err}</p>}
      <div className="field">
        <label>Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="field">
        <label>Email</label>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </div>
      <div className="field">
        <label>Password</label>
        <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      </div>
      <button type="submit" className="btn btn-primary">Create account</button>
    </form>
  );
}