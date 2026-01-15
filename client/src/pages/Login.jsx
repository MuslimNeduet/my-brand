import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api, { setAuthToken } from '../lib/api.js';
import { useAuth } from '../state/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuthToken(res.data.token);
      setUser(res.data.user);
      const to = location.state?.from?.pathname || '/';
      navigate(to);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="panel" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={onSubmit}>
        <div className="field">
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div className="field">
          <label className="label">Password</label>
          <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      <div className="spacer"></div>
      <p className="muted">
        Not registered? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}