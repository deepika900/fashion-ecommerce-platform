/**
 * Calculates an order total from { price, qty } lines.
 * Works in paise/cents to avoid floating point drift.
 */
export function calculateOrderTotal(lines) {
  if (!Array.isArray(lines)) throw new TypeError('lines must be an array');
  const minor = lines.reduce((sum, { price, qty }) => {
    if (!Number.isInteger(qty) || qty < 1) throw new RangeError('qty must be a positive integer');
    if (typeof price !== 'number' || !(price >= 0)) throw new RangeError('price must be a non-negative number');
    return sum + Math.round(price * 100) * qty;
  }, 0);
  return minor / 100;
}
