import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { sendOrderEmails } from '../utils/mailer.js';

const router = express.Router();

// List current user's orders
router.get('/', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .select('_id total status createdAt');
  res.json(orders);
});

// Create order (respond first, email later)
router.post('/', protect, async (req, res) => {
  try {
    const { items = [], tax = 0, shipping = 0 } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const user = await User.findById(req.user.id).select('name email');
    if (!user) return res.status(401).json({ message: 'User not found' });

    const ids = items.map(i => i.product);
    const dbProducts = await Product.find({ _id: { $in: ids } }).select('_id name price countInStock imageUrl');
    const map = new Map(dbProducts.map(p => [String(p._id), p]));

    const normalized = [];
    const stockOps = [];

    for (const i of items) {
      const p = map.get(String(i.product));
      if (!p) return res.status(400).json({ message: `Product not found: ${i.product}` });
      const qty = Number(i.qty || 1);
      if (qty < 1) return res.status(400).json({ message: `Invalid qty for ${p.name}` });
      if (p.countInStock < qty) return res.status(400).json({ message: `Not enough stock for ${p.name}` });

      normalized.push({ product: p._id, name: p.name, price: Number(p.price || 0), qty, imageUrl: p.imageUrl || null });
      stockOps.push({ updateOne: { filter: { _id: p._id }, update: { $inc: { countInStock: -qty } } } });
    }

    const subtotal = normalized.reduce((sum, i) => sum + i.price * i.qty, 0);
    const total = subtotal + Number(tax || 0) + Number(shipping || 0);

    const order = await Order.create({
      user: user._id,
      items: normalized,
      subtotal,
      tax: Number(tax || 0),
      shipping: Number(shipping || 0),
      total,
      status: 'created',
      email: user.email,
      name: user.name
    });

    if (stockOps.length) await Product.bulkWrite(stockOps);

    // Respond immediately
    res.status(201).json({ ok: true, orderId: order._id, total });

    // Non-blocking emails
    setImmediate(() => {
      sendOrderEmails({ order, user, items: normalized, subtotal, total })
        .catch(e => console.error('Order email failed (non-blocking):', e.message));
    });
  } catch (e) {
    console.error('Create order error:', e);
    res.status(500).json({ message: 'Failed to place order' });
  }
});

// Get one order
router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name price');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (String(order.user) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });
  res.json(order);
});

export default router;