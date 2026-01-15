import nodemailer from 'nodemailer';

const {
  SMTP_SERVICE,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS
} = process.env;

let transporter;

if (SMTP_SERVICE && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: SMTP_SERVICE,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
} else if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE || 'false') === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
} else {
  const account = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: account.user, pass: account.pass }
  });
  console.warn('No SMTP env provided. Using Ethereal test account:', {
    user: account.user,
    pass: account.pass
  });
}

export { transporter };

export async function verifyMailer() {
  try {
    console.log('Verifying SMTP transport with config:', {
      service: SMTP_SERVICE || null,
      host: SMTP_HOST || null,
      port: SMTP_PORT || null,
      secure: SMTP_SECURE || null,
      user: SMTP_USER ? `${SMTP_USER.slice(0, 2)}***` : null
    });
    await transporter.verify();
    console.log('SMTP transport verified and ready.');
  } catch (e) {
    console.error('SMTP verification failed:', {
      message: e.message,
      code: e.code,
      command: e.command,
      response: e.response
    });
  }
}

export function orderEmailHtml({ customer, address, items, totals }) {
  const itemsHtml = items
    .map(
      (it) =>
        `<tr><td>${it.name}</td><td style="text-align:center;">${it.qty}</td><td style="text-align:right;">$${Number(
          it.price
        ).toFixed(2)}</td></tr>`
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;">
      <h2>New Order</h2>
      <p><strong>Name:</strong> ${customer.name}</p>
      <p><strong>Email:</strong> ${customer.email}</p>
      <p><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
      <h3>Shipping Address</h3>
      <p>
        ${address.houseNo}, ${address.streetNo}<br/>
        ${address.area}, ${address.city}<br/>
        ${address.province}, ${address.country}
      </p>
      <h3>Items</h3>
      <table style="width:100%;border-collapse:collapse;" cellpadding="8" border="1">
        <thead><tr><th align="left">Product</th><th>Qty</th><th align="right">Price</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <h3>Total: $${Number(totals.subtotal).toFixed(2)}</h3>
    </div>
  `;
}