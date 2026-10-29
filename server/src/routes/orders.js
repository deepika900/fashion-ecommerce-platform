import { Router } from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';
import asyncHandler, { httpError } from '../utils/asyncHandler.js';
import { calculateOrderTotal } from '../utils/pricing.js';

const router = Router();

// POST /api/orders   body: { items: [{ productId, qty }] }
// Prices always come from the database, never from the client.
router.post('/', protect, asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) throw httpError(400, 'items must be a non-empty array');

  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines = items.map(({ productId, qty }) => {
    const p = byId.get(String(productId));
    if (!p) throw httpError(400, `Product ${productId} not found`);
    return { product: p._id, name: p.name, price: p.price, qty };
  });

  let total;
  try {
    total = calculateOrderTotal(lines);
  } catch (e) {
    throw httpError(400, e.message);
  }

  // Reserve stock with a conditional update; roll back earlier lines if one fails.
  // (MongoDB transactions need a replica set, so this keeps local setup simple.)
  const reserved = [];
  try {
    for (const l of lines) {
      const r = await Product.updateOne({ _id: l.product, stock: { $gte: l.qty } }, { $inc: { stock: -l.qty } });
      if (r.modifiedCount === 0) throw httpError(409, `Not enough stock for ${l.name}`);
      reserved.push(l);
    }
  } catch (e) {
    await Promise.all(reserved.map((l) => Product.updateOne({ _id: l.product }, { $inc: { stock: l.qty } })));
    throw e;
  }

  const order = await Order.create({ user: req.user._id, items: lines, total });
  res.status(201).json({ order });
}));

// GET /api/orders/mine
router.get('/mine', protect, asyncHandler(async (req, res) => {
  res.json({ orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }) });
}));

export default router;
