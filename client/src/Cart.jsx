import { useState } from 'react';
import { api } from './api.js';
import { useCart } from './CartContext.jsx';

export default function Cart({ user, onClose, onNeedLogin }) {
  const { items, dispatch, total } = useCart();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function checkout() {
    if (!user) return onNeedLogin();
    setBusy(true);
    setMsg('');
    try {
      const { order } = await api('/orders', {
        method: 'POST',
        body: { items: items.map((i) => ({ productId: i._id, qty: i.qty })) },
      });
      dispatch({ type: 'clear' });
      setMsg(`Order placed! Total ₹${order.total}`);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="drawer">
      <div className="drawer-head">
        <h2>Your cart</h2>
        <button className="link" onClick={onClose}>Close</button>
      </div>
      {items.length === 0 && <p>{msg || 'Your cart is empty.'}</p>}
      {items.map((i) => (
        <div className="cart-row" key={i._id}>
          <img src={i.image} alt="" />
          <div>
            <strong>{i.name}</strong>
            <div>₹{i.price}</div>
            <div className="qty">
              <button onClick={() => dispatch({ type: 'dec', id: i._id })}>−</button>
              <span>{i.qty}</span>
              <button onClick={() => dispatch({ type: 'add', product: i })}>+</button>
              <button className="link" onClick={() => dispatch({ type: 'remove', id: i._id })}>Remove</button>
            </div>
          </div>
        </div>
      ))}
      {items.length > 0 && (
        <>
          <h3>Total: ₹{total}</h3>
          {msg && <p className="error">{msg}</p>}
          <button className="primary" disabled={busy} onClick={checkout}>
            {user ? 'Place order' : 'Log in to checkout'}
          </button>
        </>
      )}
    </aside>
  );
}
