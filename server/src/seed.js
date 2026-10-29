import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Product from './models/Product.js';
import User from './models/User.js';

const img = (seed) => `https://picsum.photos/seed/${seed}/400/500`;
const products = [
  { name: 'Classic White Shirt', brand: 'Urban Thread', category: 'Shirts', price: 1299, stock: 25, image: img('shirt1'), description: 'Cotton regular-fit shirt.' },
  { name: 'Slim Fit Denim Jeans', brand: 'Indigo Co', category: 'Jeans', price: 1899, stock: 18, image: img('jeans1'), description: 'Stretch denim, mid rise.' },
  { name: 'Floral Summer Dress', brand: 'Bloom', category: 'Dresses', price: 2199, stock: 12, image: img('dress1'), description: 'Lightweight knee-length dress.' },
  { name: 'Oversized Graphic Tee', brand: 'Street Lab', category: 'T-Shirts', price: 799, stock: 40, image: img('tee1'), description: 'Relaxed fit cotton tee.' },
  { name: 'Black Hoodie', brand: 'Street Lab', category: 'Hoodies', price: 1599, stock: 20, image: img('hoodie1'), description: 'Fleece-lined pullover hoodie.' },
  { name: 'Chino Trousers', brand: 'Urban Thread', category: 'Trousers', price: 1499, stock: 22, image: img('chino1'), description: 'Tapered fit chinos.' },
  { name: 'Striped Kurti', brand: 'Desi Loom', category: 'Kurtis', price: 999, stock: 30, image: img('kurti1'), description: 'Straight-cut cotton kurti.' },
  { name: 'Denim Jacket', brand: 'Indigo Co', category: 'Jackets', price: 2799, stock: 10, image: img('jacket1'), description: 'Classic washed denim jacket.' },
];

await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fashion_store');
await Product.deleteMany({});
await Product.insertMany(products);

const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
if (!(await User.exists({ email }))) {
  await User.create({
    name: 'Admin',
    email,
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'change-me-now', 10),
    role: 'admin',
  });
  console.log(`Created admin user ${email}`);
}
console.log(`Seeded ${products.length} products`);
await mongoose.disconnect();
