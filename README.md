# Fashion E-Commerce Platform

A full-stack fashion store built with the MERN stack: product browsing with search and category filters, a persistent cart, JWT authentication, and order placement with stock checks.

## Tech stack
- **Frontend:** React 18, Vite, Context API + `useReducer` for cart state
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Auth:** JWT + bcrypt password hashing

## Features
- Product listing with debounced search, category filters and pagination
- Cart that persists in `localStorage` (add, remove, change quantity)
- Register / login with JWT-protected routes and role-based admin access
- Orders are priced on the server from database prices (the client never sets prices)
- Stock is reserved when an order is placed; the order fails if stock is short
- Unit tests for order-total calculation (`node --test`)

## REST API
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | - | Create an account |
| POST | `/api/auth/login` | - | Log in, returns JWT |
| GET | `/api/auth/me` | User | Current user |
| GET | `/api/products` | - | List/search/filter (`q`, `category`, `minPrice`, `maxPrice`, `page`, `limit`) |
| GET | `/api/products/categories` | - | Distinct categories |
| GET | `/api/products/:id` | - | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/orders` | User | Place an order |
| GET | `/api/orders/mine` | User | Your orders |

## Getting started
Requires Node 18+ and a running MongoDB (local or Atlas).

```bash
# 1. API
cd server
npm install
cp .env.example .env      # then edit JWT_SECRET and MONGO_URI
npm run seed              # sample products + an admin user
npm run dev               # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

## Tests
```bash
cd server && npm test
```

## Project structure
```
server/src
  models/       User, Product, Order
  routes/       auth, products, orders
  middleware/   JWT auth + admin guard
  utils/        pricing (with tests), async handler
client/src
  App.jsx, Cart.jsx, AuthForm.jsx, CartContext.jsx, api.js
```

## Ideas to extend
Payment integration (Razorpay/Stripe), product detail pages, order history UI, image uploads, admin dashboard.
