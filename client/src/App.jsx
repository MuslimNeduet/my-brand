import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setAuthToken } from './lib/api.js';
import { useCart } from './state/CartContext.jsx';
import { useAuth } from './state/AuthContext.jsx';

export default function App({ children }) {
  const navigate = useNavigate();
  const { count } = useCart();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    setAuthToken(null);
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="header-bar">
        <div className="container header">
          <Link to="/" className="brand">Ecommercestore</Link>
          <nav className="nav" style={{ marginLeft: 'auto' }}>
            <Link to="/">Home</Link>
            <Link to="/cart" className="row" style={{ gap: 8 }}>
              <span>Cart</span>
              <span className="badge">{count}</span>
            </Link>
            {isAdmin && <Link to="/admin">Admin</Link>}
            {!user ? (
              <Link to="/login" className="btn btn-primary">Login</Link>
            ) : (
              <>
                <span className="muted">Hi, {user.name}</span>
                <button className="btn" onClick={handleLogout}>Logout</button>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 18 }}>
        {children}
      </div>

      <footer className="footer">
        <div className="container footer-inner">
          <div>© {new Date().getFullYear()} Ecommercestore</div>
          <div className="row" style={{ gap: 12 }}>
            <a href="https://github.com/MuslimNeduet" target="_blank" rel="noreferrer">GitHub</a>
            <a href="#" onClick={(e)=>e.preventDefault()}>Privacy</a>
            <a href="#" onClick={(e)=>e.preventDefault()}>Terms</a>
          </div>
        </div>
      </footer>
    </>
  );
}