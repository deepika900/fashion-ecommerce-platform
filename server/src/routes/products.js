import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';
import asyncHandler, { httpError } from '../utils/asyncHandler.js';

const router = Router();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FIELDS = ['name', 'description', 'brand', 'category', 'price', 'image', 'stock'];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

// GET /api/products?q=&category=&minPrice=&maxPrice=&page=&limit=
router.get('/', asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 12, 50);

  const filter = {};
  if (q) filter.name = { $regex: escapeRegex(String(q)), $options: 'i' };
  if (category) filter.category = String(category);
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  res.json({ products, page, pages: Math.ceil(total / limit), total });
}));

// GET /api/products/categories  (must be declared before /:id)
router.get('/categories', asyncHandler(async (_req, res) => {
  res.json({ categories: (await Product.distinct('category')).sort() });
}));

// GET /api/products/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).catch(() => null);
  if (!product) throw httpError(404, 'Product not found');
  res.json({ product });
}));

// POST /api/products  (admin)
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const product = await Product.create(pick(req.body));
  res.status(201).json({ product });
}));

// PUT /api/products/:id  (admin)
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!product) throw httpError(404, 'Product not found');
  res.json({ product });
}));

// DELETE /api/products/:id  (admin)
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw httpError(404, 'Product not found');
  res.json({ message: 'Product deleted' });
}));

export default router;
