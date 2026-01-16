import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { transporter } from '../utils/mailer.js';

const router = express.Router();

// Create order
router.post('/', protect, async (req, res) => {
  try {
    const { items = [], tax = 0, shipping = 0 } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Load user snapshot
    const user = await User.findById(req.user.id).select('name email');
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Validate items against DB, compute totals, collect stock updates
    const productIds = items.map(i => i.product);
    const dbProducts = await Product.find({ _id: { $in: productIds } }).select('_id name price countInStock imageUrl');

    const productMap = new Map(dbProducts.map(p => [String(p._id), p]));
    const normalized = [];
    const stockOps = [];

    for (const i of items) {
      const p = productMap.get(String(i.product));
      if (!p) return res.status(400).json({ message: `Product not found: ${i.product}` });

      const qty = Number(i.qty || 1);
      if (qty < 1) return res.status(400).json({ message: `Invalid qty for ${p.name}` });
      if (p.countInStock < qty) return res.status(400).json({ message: `Not enough stock for ${p.name}` });

      normalized.push({
        product: p._id,
        name: p.name,
        price: Number(p.price || 0),
        qty,
        imageUrl: p.imageUrl || null
      });

      stockOps.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $inc: { countInStock: -qty } }
        }
      });
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

    // Update stock in bulk
    if (stockOps.length) await Product.bulkWrite(stockOps);

    // Respond immediately so the client doesn’t hang
    res.status(201).json({ ok: true, orderId: order._id, total });

    // Fire-and-forget: send emails without blocking response
    setImmediate(async () => {
      try {
        if (transporter) {
          const toAdmin = process.env.ORDER_EMAIL_TO;
          const summary = normalized.map(i => `${i.name} x${i.qty} @ ${i.price}`).join('\n');
          const text = `New order ${order._id}\nCustomer: ${user.name} <${user.email}>\nSubtotal: ${subtotal}\nTax: ${order.tax}\nShipping: ${order.shipping}\nTotal: ${total}\n\nItems:\n${summary}`;
          if (toAdmin) {
            await transporter.sendMail({
              from: `Store <${process.env.SMTP_USER || 'no-reply@store.local'}>`,
              to: toAdmin,
              subject: `New order ${order._id}`,
              text
            });
          }
          await transporter.sendMail({
            from: `Store <${process.env.SMTP_USER || 'no-reply@store.local'}>`,
            to: user.email,
            subject: `Your order ${order._id}`,
            text: `Thanks for your order!\n\n${text}`
          });
        }
      } catch (e) {
        console.error('Order email failed:', e.message);
      }
    });
  } catch (e) {
    console.error('Create order error:', e);
    res.status(500).json({ message: 'Failed to place order' });
  }
});

// Get order by id
router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name price');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (String(order.user) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });
  res.json(order);
});

export default router;