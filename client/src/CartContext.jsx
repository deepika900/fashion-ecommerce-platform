import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const found = state.find((i) => i._id === action.product._id);
      if (found) {
        return state.map((i) => (i._id === found._id ? { ...i, qty: Math.min(i.qty + 1, i.stock) } : i));
      }
      return [...state, { ...action.product, qty: 1 }];
    }
    case 'dec':
      return state.map((i) => (i._id === action.id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0);
    case 'remove':
      return state.filter((i) => i._id !== action.id);
    case 'clear':
      return [];
    default:
      return state;
  }
}

const load = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], load);
  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items]);

  const value = useMemo(
    () => ({
      items,
      dispatch,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((s, i) => s + i.price * i.qty, 0),
    }),
    [items]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
