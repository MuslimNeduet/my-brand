import express from 'express';
import nodemailer from 'nodemailer';
import { transporter, orderEmailHtml } from '../utils/mailer.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { customer, address, items } = req.body || {};
  const required =
    customer?.name &&
    customer?.email &&
    address?.houseNo &&
    address?.streetNo &&
    address?.area &&
    address?.city &&
    address?.province &&
    address?.country &&
    Array.isArray(items) &&
    items.length > 0;

  if (!required) return res.status(400).json({ message: 'Missing required fields' });

  const subtotal = items.reduce((acc, it) => acc + Number(it.price) * Number(it.qty || 1), 0);
  const html = orderEmailHtml({ customer, address, items, totals: { subtotal } });

  try {
    const info = await transporter.sendMail({
      from: `"Ecommercestore" <${process.env.SMTP_USER || 'orders@example.com'}>`,
      to: process.env.ORDER_EMAIL_TO || process.env.SMTP_USER,
      subject: `New Order from ${customer.name}`,
      html,
      text: `Order total: $${subtotal.toFixed(2)}`
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('Preview email at:', previewUrl);

    res.json({ ok: true, messageId: info.messageId });
  } catch (e) {
    console.error('Email send error:', {
      message: e.message,
      code: e.code,
      command: e.command,
      response: e.response
    });
    res.status(500).json({ message: 'Failed to send email' });
  }
});

export default router;