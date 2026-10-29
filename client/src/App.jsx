import { useEffect, useState } from 'react';
import { api, getToken } from './api.js';
import { useCart } from './CartContext.jsx';
import AuthForm from './AuthForm.jsx';
import Cart from './Cart.jsx';

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [user, setUser] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [error, setError] = useState('');
  const { dispatch, count } = useCart();

  useEffect(() => {
    api('/products/categories').then((d) => setCategories(d.categories)).catch(() => {});
    if (getToken()) {
      api('/auth/me').then((d) => setUser(d.user)).catch(() => localStorage.removeItem('token'));
    }
  }, []);

  // Debounced search + category filter
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (category) params.set('category', category);
      api(`/products?${params}`)
        .then((d) => { setProducts(d.products); setError(''); })
        .catch((e) => setError(e.message));
    }, 300);
    return () => clearTimeout(t);
  }, [q, category]);

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <>
      <header className="nav">
        <h1>Fashion Store</h1>
        <input className="search" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="nav-right">
          {user ? (
            <>
              <span>Hi, {user.name}</span>
              <button className="link" onClick={logout}>Log out</button>
            </>
          ) : (
            <button className="link" onClick={() => setShowAuth(true)}>Log in</button>
          )}
          <button className="primary" onClick={() => setShowCart(true)}>Cart ({count})</button>
        </div>
      </header>

      <main>
        <div className="chips">
          <button className={!category ? 'chip active' : 'chip'} onClick={() => setCategory('')}>All</button>
          {categories.map((c) => (
            <button key={c} className={category === c ? 'chip active' : 'chip'} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}
        <div className="grid">
          {products.map((p) => (
            <article className="card" key={p._id}>
              <img src={p.image} alt={p.name} loading="lazy" />
              <h3>{p.name}</h3>
              <small>{p.brand}</small>
              <div className="price">₹{p.price}</div>
              <button className="primary" disabled={p.stock < 1} onClick={() => dispatch({ type: 'add', product: p })}>
                {p.stock < 1 ? 'Out of stock' : 'Add to cart'}
              </button>
            </article>
          ))}
          {products.length === 0 && !error && <p>No products found.</p>}
        </div>
      </main>

      {showCart && (
        <Cart user={user} onClose={() => setShowCart(false)} onNeedLogin={() => { setShowCart(false); setShowAuth(true); }} />
      )}
      {showAuth && <AuthForm onAuth={(u) => { setUser(u); setShowAuth(false); }} onClose={() => setShowAuth(false)} />}
    </>
  );
}
