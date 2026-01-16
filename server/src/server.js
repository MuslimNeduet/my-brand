import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import health from './routes/health.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// CORS: allow production origin (CLIENT_URL) and local dev
const allowedOrigins = [
  process.env.CLIENT_URL,          // e.g., https://your-frontend.vercel.app
  'http://localhost:5173',         // Vite dev
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser requests (no origin) and known origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

// Static: serve uploaded files (server/uploads)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/health', health);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Base
app.get('/', (_req, res) => res.json({ status: 'ok' }));

// Start server
const port = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
})();