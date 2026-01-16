import nodemailer from 'nodemailer';

const {
  EMAIL_ENABLED,
  SMTP_SERVICE,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  ORDER_EMAIL_TO
} = process.env;

function buildTransporter() {
  if (String(EMAIL_ENABLED || 'true') === 'false') return null;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: String(SMTP_SECURE || 'false') === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 8000,
      socketTimeout: 8000
    });
  }
  if (SMTP_SERVICE && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      service: SMTP_SERVICE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 8000,
      socketTimeout: 8000
    });
  }
  return null;
}

const transporter = buildTransporter();

export async function sendOrderEmails({ order, user, items, subtotal, total }) {
  if (!transporter) {
    console.warn('Email disabled or not configured; skipping order emails.');
    return;
  }
  const summary = items.map(i => `${i.name} x${i.qty} @ ${i.price}`).join('\n');
  const text = `New order ${order._id}
Customer: ${user.name} <${user.email}>
Subtotal: ${subtotal}
Tax: ${order.tax}
Shipping: ${order.shipping}
Total: ${total}

Items:
${summary}`;

  const adminMsg = ORDER_EMAIL_TO ? {
    from: `Store <${SMTP_USER || 'no-reply@store.local'}>`,
    to: ORDER_EMAIL_TO,
    subject: `New order ${order._id}`,
    text
  } : null;

  const customerMsg = {
    from: `Store <${SMTP_USER || 'no-reply@store.local'}>`,
    to: user.email,
    subject: `Your order ${order._id}`,
    text: `Thanks for your order!\n\n${text}`
  };

  await Promise.allSettled([
    adminMsg && transporter.sendMail(adminMsg),
    transporter.sendMail(customerMsg)
  ].filter(Boolean));
}