import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../lib/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data || {};
      if (!token) throw new Error('No token received');
      setAuthToken(token);
      localStorage.setItem('user', JSON.stringify(user || null));
      navigate('/');
    } catch (e) {
      setErr(e?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="panel">
      <h2>Login</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={submit}>
        <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button className="btn btn-primary" type="submit">Login</button>
      </form>
    </div>
  );
}