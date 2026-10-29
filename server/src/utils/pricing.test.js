import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderTotal } from './pricing.js';

test('sums price x qty across lines', () => {
  assert.equal(calculateOrderTotal([{ price: 499, qty: 2 }, { price: 1299.5, qty: 1 }]), 2297.5);
});

test('avoids floating point drift', () => {
  assert.equal(calculateOrderTotal([{ price: 0.1, qty: 3 }]), 0.3);
});

test('empty cart totals zero', () => {
  assert.equal(calculateOrderTotal([]), 0);
});

test('rejects invalid quantity', () => {
  assert.throws(() => calculateOrderTotal([{ price: 10, qty: 0 }]), RangeError);
  assert.throws(() => calculateOrderTotal([{ price: 10, qty: 1.5 }]), RangeError);
});

test('rejects negative price', () => {
  assert.throws(() => calculateOrderTotal([{ price: -5, qty: 1 }]), RangeError);
});
