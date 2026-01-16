import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext.jsx';

export default function Cart() {
  const { items, setQty, removeFromCart, subtotal } = useCart();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="panel">
        <h2>Your Cart</h2>
        <p className="muted">Your cart is empty.</p>
        <Link to="/" className="btn">Go shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
      <div className="panel">
        <h2>Cart</h2>
        <table className="table">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th></th></tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it._id}>
                <td style={{ display:'flex', alignItems:'center', gap:12 }}>
                  {it.imageUrl && <img src={it.imageUrl} alt={it.name} style={{ width:52, height:52, objectFit:'cover', borderRadius:8, border:'1px solid #333' }} />}
                  <div>
                    <div style={{ fontWeight:700 }}>{it.name}</div>
                    <div className="muted">${Number(it.price ?? 0).toFixed(2)}</div>
                  </div>
                </td>
                <td>
                  <input className="input" style={{ width:90 }} type="number" min="1" value={it.qty} onChange={(e)=>setQty(it._id, Number(e.target.value || 1))}/>
                </td>
                <td>${Number((it.price ?? 0) * (it.qty ?? 1)).toFixed(2)}</td>
                <td><button className="btn" onClick={()=>removeFromCart(it._id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan="4" style={{ textAlign:'right' }}>Subtotal: <strong>${Number(subtotal ?? 0).toFixed(2)}</strong></td></tr>
          </tfoot>
        </table>
      </div>

      <div className="panel">
        <h3>Order Summary</h3>
        <p className="row"><span className="muted">Items</span> <span>{items.length}</span></p>
        <p className="row"><span className="muted">Subtotal</span> <span>${Number(subtotal ?? 0).toFixed(2)}</span></p>
        <div className="spacer"></div>
        <button className="btn btn-primary" onClick={()=>navigate('/checkout')}>Proceed to Checkout</button>
        <div className="spacer"></div>
        <Link to="/" className="btn">Continue Shopping</Link>
      </div>
    </div>
  );
}