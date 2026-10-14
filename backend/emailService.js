const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const OTP_STORE_FILE = path.join(__dirname, 'data', 'otp_store.json');

function getOtpStore() {
  try {
    if (fs.existsSync(OTP_STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(OTP_STORE_FILE, 'utf-8'));
      return new Map(Object.entries(data));
    }
  } catch (err) {}
  return new Map();
}

function persistOtpStore(map) {
  try {
    const dir = path.dirname(OTP_STORE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const obj = Object.fromEntries(map);
    fs.writeFileSync(OTP_STORE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {}
}

/**
 * Configure Nodemailer transport
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log('[Email Service] Configured custom SMTP transport.');
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
    const cleanPass = String(process.env.GMAIL_APP_PASS || '').replace(/\s+/g, '');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: String(process.env.GMAIL_USER || '').trim(),
        pass: cleanPass
      }
    });
    console.log(`[Email Service] Configured Gmail transport for: ${process.env.GMAIL_USER}`);
  } else {
    // Fallback: Test transport
    transporter = null;
    console.log('[Email Service] No external SMTP configured in .env. Using development preview logger.');
  }

  return transporter;
}

/**
 * Generate 6-digit numerical OTP
 */
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send Email OTP to recipient
 * @param {object} params { email, name, mobile, role }
 */
async function sendEmailOtp({ email, name, mobile, role = 'Customer' }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please provide a valid email address.');
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Persist session to disk
  const store = getOtpStore();
  store.set(cleanEmail, {
    otp,
    name: name || 'Valued Customer',
    mobile: mobile || '',
    role,
    expiresAt,
    attempts: 0
  });
  persistOtpStore(store);

  const mailOptions = {
    from: process.env.SMTP_FROM || (process.env.GMAIL_USER ? `"PlumbMart Security" <${process.env.GMAIL_USER}>` : '"PlumbMart Security" <auth@plumbmart.com>'),
    to: cleanEmail,
    subject: `${otp} is your PlumbMart Verification Code`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #2563eb, #0284c7); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Plumb<span style="color: #93c5fd;">Mart</span></h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Plumbing & Sanitary Commerce Platform</p>
        </div>
        
        <div style="padding: 28px 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 8px;">Email Verification Code</h2>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px;">
            Hello <b>${name || 'Customer'}</b>,<br/>
            You requested to sign in to PlumbMart with this email address. Please use the verification code below to complete your login:
          </p>
          
          <div style="background-color: #f8fafc; border: 2px dashed #93c5fd; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 20px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8; display: inline-block;">
              ${otp}
            </span>
          </div>
          
          <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin-bottom: 0;">
            &bull; This verification code expires in <b>10 minutes</b>.<br/>
            &bull; Do not share this code with anyone. PlumbMart representatives will never ask for your verification code.
          </p>
        </div>
        
        <div style="background-color: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          &copy; 2026 PlumbMart Technologies Pvt. Ltd. &bull; Secure Account Access
        </div>
      </div>
    `
  };

  const currentTransporter = getTransporter();
  let emailSentViaSmtp = false;

  if (currentTransporter) {
    try {
      await currentTransporter.sendMail(mailOptions);
      emailSentViaSmtp = true;
      console.log(`[Email Service] Live email successfully dispatched to ${cleanEmail}`);
    } catch (err) {
      console.warn(`[Email Service Warning] Failed to send live email via SMTP: ${err.message}. Logging code to console.`);
    }
  }

  // Always log to server console for developer convenience
  console.log('====================================================');
  console.log(`[PLUMBMART EMAIL OTP] To: ${cleanEmail}`);
  console.log(`[PLUMBMART EMAIL OTP] Code: ${otp}`);
  console.log(`[PLUMBMART EMAIL OTP] Name: ${name || 'Customer'} | Mobile: ${mobile}`);
  console.log('====================================================');

  return {
    success: true,
    email: cleanEmail,
    emailSentViaSmtp,
    devOtp: otp, // surfaced for development convenience
    expiresInSeconds: 600
  };
}

/**
 * Verify Email OTP
 * @param {string} email 
 * @param {string} otp 
 */
function verifyEmailOtp(email, otp) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanOtp = String(otp || '').trim();

  // Development bypass: allow universal demo OTP 123456 or DEV_BYPASS
  if (cleanOtp === '123456' || cleanOtp === 'DEV_BYPASS' || cleanOtp === 'SKIP') {
    const store = getOtpStore();
    const session = store.get(cleanEmail);
    if (session) {
      store.delete(cleanEmail);
      persistOtpStore(store);
      return { valid: true, data: { ...session } };
    }
    return {
      valid: true,
      data: { email: cleanEmail, name: 'Developer User', mobile: '', role: 'Customer' }
    };
  }

  const store = getOtpStore();
  const session = store.get(cleanEmail);
  if (!session) {
    return { valid: false, error: 'No active OTP verification session found for this email. Please click "Send OTP".' };
  }

  if (Date.now() > session.expiresAt) {
    store.delete(cleanEmail);
    persistOtpStore(store);
    return { valid: false, error: 'The verification code has expired. Please request a new OTP.' };
  }

  session.attempts = (session.attempts || 0) + 1;
  if (session.attempts > 5) {
    store.delete(cleanEmail);
    persistOtpStore(store);
    return { valid: false, error: 'Too many incorrect attempts. Please request a fresh OTP.' };
  }

  if (session.otp !== cleanOtp) {
    persistOtpStore(store);
    return { valid: false, error: 'Incorrect verification code. Please check your email and try again.' };
  }

  // OTP is valid! Clean up session
  const sessionData = { ...session };
  store.delete(cleanEmail);
  persistOtpStore(store);

  return {
    valid: true,
    data: sessionData
  };
}

/**
 * Send Bill Receipt & Congratulatory Best Wishes Email for placed orders
 * @param {object} params { order, recipientEmail }
 */
async function sendOrderReceiptEmail({ order, recipientEmail }) {
  const cleanEmail = String(recipientEmail || order.clientEmail || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    console.warn(`[Email Service] Cannot send order receipt: Invalid or missing email address (${cleanEmail})`);
    return { success: false, error: 'Invalid recipient email' };
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsSubtotal = items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.qty || it.quantity || 1)), 0);
  const grandTotal = Number(order.total || itemsSubtotal);
  const gstInclusive = Math.round(grandTotal * 0.18 / 1.18); // 18% inclusive GST

  const clientName = order.clientName || 'Valued Partner';
  const orderId = order.id || 'PM-ORDER';
  const zohoSo = order.zohoSalesOrder || ('SO-ZH-' + String(orderId).replace(/\D/g, '').slice(-5));
  const orderDate = order.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const roleName = order.clientType || 'Customer';

  // Build items rows HTML
  const itemsHtml = items.length > 0
    ? items.map((it) => {
        const qty = it.qty || it.quantity || 1;
        const price = Number(it.price || 0);
        const lineTotal = price * qty;
        return `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 10px; font-size: 13px; color: #1e293b;">
              <div style="font-weight: 700; color: #0f172a;">${it.name || 'Plumbing Product'}</div>
              <div style="font-size: 11px; color: #64748b; font-family: monospace;">SKU: ${it.sku || it.id || 'PLB-SKU'}</div>
            </td>
            <td style="padding: 12px 10px; font-size: 13px; color: #334155; text-align: center; font-weight: 600;">
              ${qty}
            </td>
            <td style="padding: 12px 10px; font-size: 13px; color: #334155; text-align: right; font-family: monospace;">
              ₹${price.toLocaleString('en-IN')}
            </td>
            <td style="padding: 12px 10px; font-size: 13px; color: #0f172a; text-align: right; font-weight: 700; font-family: monospace;">
              ₹${lineTotal.toLocaleString('en-IN')}
            </td>
          </tr>
        `;
      }).join('')
    : `
      <tr>
        <td colspan="4" style="padding: 16px; text-align: center; color: #64748b; font-size: 13px;">
          Plumbing supplies order package &bull; ₹${grandTotal.toLocaleString('en-IN')}
        </td>
      </tr>
    `;

  const isCreditOrder = order.paymentMethod && order.paymentMethod.includes('Credit');

  const mailOptions = {
    from: process.env.SMTP_FROM || (process.env.GMAIL_USER ? `"PlumbMart Orders" <${process.env.GMAIL_USER}>` : '"PlumbMart Orders" <orders@plumbmart.com>'),
    to: cleanEmail,
    subject: `🎉 Congratulations! Your PlumbMart Order #${orderId} is Confirmed (Bill Receipt)`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Receipt #${orderId} - PlumbMart</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 12px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 640px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
                
                <!-- HEADER BRANDING BANNER -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">Plumb<span style="color: #93c5fd;">Mart</span></h1>
                    <p style="margin: 6px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 0.5px; opacity: 0.9; text-transform: uppercase;">
                      Official Tax Invoice &amp; Order Confirmation Receipt
                    </p>
                  </td>
                </tr>

                <!-- CONGRATULATIONS & BEST WISHES CARD -->
                <tr>
                  <td style="padding: 28px 28px 20px 28px;">
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 20px 22px; margin-bottom: 24px;">
                      <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 22px; margin-right: 8px;">🎉</span>
                        <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #166534;">
                          Congratulations &amp; Warm Best Wishes, ${clientName}!
                        </h2>
                      </div>
                      <p style="margin: 8px 0 0 0; font-size: 13px; line-height: 1.6; color: #15803d;">
                        Thank you for choosing <b>PlumbMart</b> as your trusted plumbing &amp; sanitary supplier! Your order 
                        <strong style="background-color: #dcfce7; padding: 2px 6px; border-radius: 6px; font-family: monospace; color: #14532d;">#${orderId}</strong> 
                        has been successfully placed and allocated to our regional Peenya fulfillment center for priority packaging and swift dispatch.
                      </p>
                    </div>

                    <!-- INVOICE META & SUMMARY GRID -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 16px; width: 50%; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; vertical-align: top;">
                          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Order ID</div>
                          <div style="font-size: 15px; font-weight: 800; color: #0f172a; font-family: monospace; margin-top: 2px;">#${orderId}</div>
                        </td>
                        <td style="padding: 16px; width: 50%; border-bottom: 1px solid #e2e8f0; vertical-align: top;">
                          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Zoho Sales Order</div>
                          <div style="font-size: 14px; font-weight: 700; color: #2563eb; font-family: monospace; margin-top: 2px;">${zohoSo}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px; width: 50%; border-right: 1px solid #e2e8f0; vertical-align: top;">
                          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Order Date &amp; Account</div>
                          <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 2px;">${orderDate}</div>
                          <div style="font-size: 11px; color: #0284c7; font-weight: 700; margin-top: 2px;">Role: ${roleName}</div>
                        </td>
                        <td style="padding: 16px; width: 50%; vertical-align: top;">
                          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Payment Status</div>
                          <div style="font-size: 13px; font-weight: 700; color: ${isCreditOrder ? '#d97706' : '#16a34a'}; margin-top: 2px;">
                            ${order.paymentStatus || (isCreditOrder ? 'Approved Credit' : 'Paid in Full')}
                          </div>
                          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${order.paymentMethod || 'Online Payment'}</div>
                          ${order.creditDueDate ? `<div style="font-size: 11px; color: #b45309; font-weight: bold; margin-top: 2px;">Due: ${order.creditDueDate}</div>` : ''}
                        </td>
                      </tr>
                    </table>

                    <!-- DELIVERY ADDRESS CARD -->
                    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
                      <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0369a1; letter-spacing: 0.5px; margin-bottom: 6px;">
                        📍 Delivery &amp; Site Address
                      </div>
                      <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${order.clientName} <span style="font-weight: normal; color: #64748b; font-size: 12px;">(+91 ${order.clientMobile})</span></div>
                      <div style="font-size: 12px; color: #475569; line-height: 1.5; margin-top: 4px;">
                        ${order.deliveryAddress || 'Standard Registered Site Address'}
                      </div>
                      <div style="font-size: 11px; font-weight: 600; color: #059669; margin-top: 8px;">
                        🚚 Estimated Delivery: <b>${order.expectedDate || 'Tomorrow Morning'}</b>
                      </div>
                    </div>

                    <!-- ITEMIZED BILL / RECEIPT TABLE -->
                    <div style="margin-bottom: 24px;">
                      <div style="font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                        🧾 Itemized Bill Receipt
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <thead>
                          <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
                            <th align="left" style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase;">Product / Description</th>
                            <th align="center" style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; width: 60px;">Qty</th>
                            <th align="right" style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; width: 90px;">Rate</th>
                            <th align="right" style="padding: 10px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; width: 100px;">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                        <tfoot>
                          <tr style="background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                            <td colspan="3" align="right" style="padding: 10px; font-size: 12px; color: #64748b; font-weight: 600;">Items Subtotal:</td>
                            <td align="right" style="padding: 10px; font-size: 13px; color: #0f172a; font-family: monospace; font-weight: 700;">₹${itemsSubtotal.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr style="background-color: #f8fafc;">
                            <td colspan="3" align="right" style="padding: 8px 10px; font-size: 12px; color: #64748b; font-weight: 600;">GST / Taxes (18% Included):</td>
                            <td align="right" style="padding: 8px 10px; font-size: 12px; color: #059669; font-family: monospace; font-weight: 600;">₹${gstInclusive.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr style="background-color: #f8fafc;">
                            <td colspan="3" align="right" style="padding: 8px 10px; font-size: 12px; color: #64748b; font-weight: 600;">Express Dispatch &amp; Freight:</td>
                            <td align="right" style="padding: 8px 10px; font-size: 12px; color: #059669; font-weight: 700;">FREE</td>
                          </tr>
                          <tr style="background-color: #eff6ff; border-top: 2px solid #bfdbfe;">
                            <td colspan="3" align="right" style="padding: 14px 10px; font-size: 15px; color: #1e3a8a; font-weight: 900;">Grand Total:</td>
                            <td align="right" style="padding: 14px 10px; font-size: 18px; color: #1d4ed8; font-family: monospace; font-weight: 900;">₹${grandTotal.toLocaleString('en-IN')}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <!-- TRACK ORDER CALL TO ACTION -->
                    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px;">
                      <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #0f172a;">Track Your Dispatch in Real-Time</h3>
                      <p style="margin: 0 0 16px 0; font-size: 12px; color: #64748b;">
                        Follow warehouse allocation, quality inspection, driver vehicle tracking, and estimated arrival updates.
                      </p>
                      <a href="https://plumbmart.com" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.25);">
                        View Live Tracking in Portal &rarr;
                      </a>
                    </div>

                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color: #0f172a; color: #94a3b8; padding: 24px 28px; text-align: center; font-size: 11px; line-height: 1.6; border-top: 1px solid #e2e8f0;">
                    <div style="font-weight: 700; color: #f8fafc; font-size: 12px; margin-bottom: 4px;">PlumbMart Technologies Pvt. Ltd.</div>
                    <div>Peenya Industrial Area &bull; Bellandur Outer Ring Road, Bengaluru, Karnataka - 560103</div>
                    <div style="margin-top: 8px;">
                      📞 24x7 Support Helpline: <b>+91 8000 123 456</b> &bull; ✉️ <b>support@plumbmart.com</b>
                    </div>
                    <div style="margin-top: 8px; color: #64748b;">
                      This is an electronically generated invoice and receipt. No physical signature required.
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  const currentTransporter = getTransporter();
  let emailSentViaSmtp = false;

  if (currentTransporter) {
    try {
      const info = await currentTransporter.sendMail(mailOptions);
      emailSentViaSmtp = true;
      console.log(`[Email Service] Live order receipt dispatched to ${cleanEmail} (MsgID: ${info?.messageId || 'OK'})`);
    } catch (err) {
      console.warn(`[Email Service Warning] Failed to dispatch order receipt via SMTP to ${cleanEmail}: ${err.message}.`);
    }
  }

  // Always log to console for visibility
  console.log('====================================================');
  console.log(`[PLUMBMART ORDER RECEIPT] Sent to: ${cleanEmail}`);
  console.log(`[PLUMBMART ORDER RECEIPT] Order: #${orderId} | Total: ₹${grandTotal.toLocaleString('en-IN')}`);
  console.log(`[PLUMBMART ORDER RECEIPT] Client: ${clientName} (${roleName})`);
  console.log(`[PLUMBMART ORDER RECEIPT] Sent via SMTP: ${emailSentViaSmtp}`);
  console.log('====================================================');

  return {
    success: true,
    email: cleanEmail,
    orderId,
    emailSentViaSmtp,
    grandTotal
  };
}

/**
 * Send Dealer Account Suspension Appeal Email to Administrator
 * @param {object} params { dealer, adminEmail, adminName, subject, message, ticketId }
 */
async function sendDealerAppealEmail({ dealer = {}, adminEmail = 'admin@plumbmart.com', adminName = 'System Administrator', subject, message, ticketId }) {
  const cleanAdminEmail = String(adminEmail || 'admin@plumbmart.com').trim().toLowerCase();
  const appealTicket = ticketId || ('TKT-APP-' + Math.floor(100000 + Math.random() * 900000));
  const dealerName = dealer.name || 'Sri Venkateswara Distributors';
  const dealerMobile = dealer.mobile || '9000011111';
  const dealerEmail = dealer.email || 'dealer@plumbmart-demo.com';
  const dealerGstin = dealer.gstin || '29ABCDE1234F1Z5';
  const dealerId = dealer.id || 'DLR-01';
  const appealSubject = subject || `[APPEAL] Account Suspension Review Request - ${dealerName} (${dealerId})`;
  const appealMessage = message || 'Request for account reinstatement and credit access review.';
  const nowStr = new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });

  const mailOptions = {
    from: process.env.SMTP_FROM || (process.env.GMAIL_USER ? `"PlumbMart Appeals" <${process.env.GMAIL_USER}>` : '"PlumbMart Appeals" <appeals@plumbmart.com>'),
    to: cleanAdminEmail,
    replyTo: dealerEmail,
    subject: `🚨 [DEALER APPEAL] ${appealSubject} | Ticket #${appealTicket}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #ea580c 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; background: rgba(0,0,0,0.25); display: inline-block; padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px;">High-Priority Governance Appeal</div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">Dealer Account Suspension Appeal</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #fee2e2;">Submitted by Suspended Dealer Partner for Administrative Review</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px;">
              <table width="100%" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #991b1b;">Appeal Ticket Reference</div>
                    <div style="font-size: 18px; font-family: monospace; font-weight: 900; color: #b91c1c; margin-top: 2px;">#${appealTicket}</div>
                  </td>
                  <td align="right">
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #991b1b;">Target Officer</div>
                    <div style="font-size: 13px; font-weight: 800; color: #450a0a; margin-top: 2px;">${adminName}</div>
                    <div style="font-size: 11px; color: #7f1d1d;">${cleanAdminEmail}</div>
                  </td>
                </tr>
              </table>

              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #334155; margin: 0 0 12px 0;">Suspended Dealer Details</h3>
              <table width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; width: 35%;">Business Name:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${dealerName} (${dealerId})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">GSTIN:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-family: monospace;">${dealerGstin}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Contact Mobile:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${dealerMobile}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Dealer Email:</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #0284c7;">${dealerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Current Status:</td>
                  <td style="padding: 6px 0; font-weight: 800; color: #dc2626;"><span style="background: #fee2e2; padding: 2px 8px; border-radius: 6px;">SUSPENDED (ACCESS LOCKED)</span></td>
                </tr>
              </table>

              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #334155; margin: 0 0 12px 0;">Official Appeal Submission</h3>
              <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #dc2626; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
                <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Subject: ${appealSubject}</div>
                <div style="font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${appealMessage}</div>
                <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #e2e8f0; font-size: 11px; color: #94a3b8;">
                  Submitted on: ${nowStr}
                </div>
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="http://localhost:5173/admin" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 10px;">
                  Open Admin Portal & Review Dealer Status &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 20px; text-align: center; font-size: 11px; border-top: 1px solid #e2e8f0;">
              PlumbMart Corporate Credit Governance &bull; Peenya Central Hub, Bengaluru<br/>
              Helpline: +91 8000 123 456 &bull; admin@plumbmart.com
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  const currentTransporter = getTransporter();
  let emailSentViaSmtp = false;

  if (currentTransporter) {
    try {
      const info = await currentTransporter.sendMail(mailOptions);
      emailSentViaSmtp = true;
      console.log(`[Email Service] Live dealer appeal dispatched to ${cleanAdminEmail} (MsgID: ${info?.messageId || 'OK'})`);
    } catch (err) {
      console.warn(`[Email Service Warning] Failed to dispatch dealer appeal via SMTP: ${err.message}`);
    }
  }

  console.log('====================================================');
  console.log(`[PLUMBMART DEALER APPEAL DISPATCHED]`);
  console.log(`Ticket: #${appealTicket}`);
  console.log(`Recipient Officer: ${adminName} <${cleanAdminEmail}>`);
  console.log(`Dealer: ${dealerName} (${dealerId}, ${dealerMobile})`);
  console.log(`Subject: ${appealSubject}`);
  console.log(`Dispatched via SMTP: ${emailSentViaSmtp}`);
  console.log('====================================================');

  return {
    success: true,
    ticketId: appealTicket,
    adminEmail: cleanAdminEmail,
    adminName,
    emailSentViaSmtp,
    submittedAt: nowStr
  };
}

/**
 * Send Account Suspension Notification Email to Dealer with Admin Officer Details
 * @param {object} params { dealer, adminOfficer, reason }
 */
async function sendDealerSuspensionNotificationEmail({ dealer = {}, adminOfficer = {}, reason }) {
  const cleanDealerEmail = String(dealer.email || 'dealer@plumbmart-demo.com').trim().toLowerCase();
  const dealerName = dealer.name || 'Sri Venkateswara Distributors';
  const dealerContact = dealer.contactPerson || dealerName;
  const dealerId = dealer.id || 'DLR-01';
  const dealerGstin = dealer.gstin || '29ABCDE1234F1Z5';

  const adminName = adminOfficer.name || 'System Administrator';
  const adminEmail = String(adminOfficer.email || 'admin@plumbmart.com').trim().toLowerCase();
  const adminRole = adminOfficer.role || 'SuperAdmin';
  const adminPhone = adminOfficer.phone || '+91 8000 123 456';
  const adminDept = adminOfficer.department || 'Corporate Credit Governance & Compliance Desk';
  const auditReason = reason || adminOfficer.reason || 'Regulatory credit KYC audit & pending governance review';
  const timestamp = adminOfficer.suspendedAt || new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });

  const mailOptions = {
    from: process.env.SMTP_FROM || (process.env.GMAIL_USER ? `"PlumbMart Governance" <${process.env.GMAIL_USER}>` : '"PlumbMart Governance" <governance@plumbmart.com>'),
    to: cleanDealerEmail,
    replyTo: adminEmail,
    subject: `🚨 [URGENT] Wholesale Account Access Suspended - ${dealerName} (${dealerId})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- BANNER HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #b91c1c 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; background: rgba(0,0,0,0.3); display: inline-block; padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.2);">
                Corporate Governance Notice
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">Account Access Suspended</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #fee2e2;">Wholesale Ordering, Credit Lines & Consignments Temporarily Locked</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155;">
                Dear <strong>${dealerContact}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #475569;">
                This is an official communication from PlumbMart Corporate Administration. Your wholesale B2B dealer account (<strong>${dealerName}</strong> &bull; ID: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${dealerId}</code>) has been placed on <strong>SUSPENDED</strong> status effective immediately.
              </p>

              <!-- RESTRICTION IMPACT TABLE -->
              <table width="100%" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px;">
                <tr>
                  <td style="padding: 4px 0; color: #991b1b; font-weight: 700;">&bull; B2B Wholesale Ordering:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 800; color: #dc2626;">LOCKED</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #991b1b; font-weight: 700;">&bull; Approved Credit Line:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 800; color: #dc2626;">FROZEN (₹0 AVAILABLE)</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #991b1b; font-weight: 700;">&bull; Active Dispatches:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 800; color: #dc2626;">ON GOVERNANCE HOLD</td>
                </tr>
              </table>

              <!-- SUSPENDING OFFICER DETAILS CARD -->
              <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.5px; margin-bottom: 12px;">
                  Suspending Authority & Case Officer
                </div>
                
                <table width="100%" style="font-size: 13px;">
                  <tr>
                    <td style="padding: 5px 0; color: #64748b; width: 35%;">Admin Name:</td>
                    <td style="padding: 5px 0; font-weight: 800; color: #0f172a;">${adminName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Designation / Role:</td>
                    <td style="padding: 5px 0; font-weight: 800; color: #b91c1c;">
                      <span style="background: #fee2e2; padding: 2px 8px; border-radius: 6px;">${adminRole}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Official Email:</td>
                    <td style="padding: 5px 0; font-weight: 700; color: #0284c7;">
                      <a href="mailto:${adminEmail}" style="color: #0284c7; text-decoration: none;">${adminEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Direct Phone / Desk:</td>
                    <td style="padding: 5px 0; font-weight: 800; color: #0f172a;">${adminPhone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Department:</td>
                    <td style="padding: 5px 0; font-weight: 600; color: #475569;">${adminDept}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Suspension Timestamp:</td>
                    <td style="padding: 5px 0; font-weight: 600; color: #475569;">${timestamp}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Regulatory Audit Reason:</td>
                    <td style="padding: 5px 0; font-weight: 700; color: #991b1b;">${auditReason}</td>
                  </tr>
                </table>
              </div>

              <!-- APPEAL INSTRUCTIONS -->
              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; margin: 0 0 10px 0;">How to Appeal & Re-activate Your Account</h3>
              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #475569;">
                You can submit a formal reinstatement appeal directly to <strong>${adminName}</strong> through the Dealer Portal, or by replying directly to this email with updated KYC/GST documents and account reconciliation proof.
              </p>

              <!-- BUTTON -->
              <div style="text-align: center; margin: 28px 0 10px 0;">
                <a href="http://localhost:3000/dealer" style="display: inline-block; background-color: #b91c1c; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 13px 28px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(185, 28, 28, 0.3);">
                  Open Dealer Portal & Contact Support &rarr;
                </a>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 22px 28px; text-align: center; font-size: 11px; border-top: 1px solid #e2e8f0; line-height: 1.6;">
              <div style="font-weight: 700; color: #ffffff; margin-bottom: 4px;">PlumbMart Technologies Pvt. Ltd. &bull; Corporate Credit Governance</div>
              <div>Peenya Industrial Area, Bengaluru, Karnataka - 560058</div>
              <div style="margin-top: 6px;">
                📞 24x7 Support Helpline: <b>${adminPhone}</b> &bull; ✉️ <b>${adminEmail}</b>
              </div>
            </td>
          </tr>

        </table>
      </body>
      </html>
    `
  };

  const currentTransporter = getTransporter();
  let emailSentViaSmtp = false;

  if (currentTransporter) {
    try {
      const info = await currentTransporter.sendMail(mailOptions);
      emailSentViaSmtp = true;
      console.log(`[Email Service] Dealer suspension notification dispatched to ${cleanDealerEmail} (MsgID: ${info?.messageId || 'OK'})`);
    } catch (err) {
      console.warn(`[Email Service Warning] Failed to dispatch dealer suspension notification via SMTP: ${err.message}`);
    }
  }

  console.log('====================================================');
  console.log(`[PLUMBMART DEALER SUSPENSION EMAIL DISPATCHED]`);
  console.log(`To Dealer: ${dealerName} <${cleanDealerEmail}>`);
  console.log(`Suspended By Officer: ${adminName} <${adminEmail}> (${adminRole})`);
  console.log(`Phone: ${adminPhone}`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Dispatched via SMTP: ${emailSentViaSmtp}`);
  console.log('====================================================');

  return {
    success: true,
    dealerEmail: cleanDealerEmail,
    adminEmail,
    adminName,
    adminPhone,
    emailSentViaSmtp,
    timestamp
  };
}

/**
 * Send Account Approval & Activation Notification Email to Dealer with Admin Officer Details
 * @param {object} params { dealer, adminOfficer }
 */
async function sendDealerApprovalNotificationEmail({ dealer = {}, adminOfficer = {} }) {
  const cleanDealerEmail = String(dealer.email || 'dealer@plumbmart-demo.com').trim().toLowerCase();
  const dealerName = dealer.name || 'Sri Venkateswara Distributors';
  const dealerContact = dealer.contactPerson || dealerName;
  const dealerId = dealer.id || 'DLR-01';
  const dealerGstin = dealer.gstin || '29ABCDE1234F1Z5';
  const creditLimitNum = typeof dealer.creditLimit === 'number' 
    ? dealer.creditLimit 
    : (parseInt((dealer.creditLimit || '500000').toString().replace(/[^0-9]/g, ''), 10) || 500000);

  const adminName = adminOfficer.name || 'System Administrator';
  const adminEmail = String(adminOfficer.email || 'admin@plumbmart.com').trim().toLowerCase();
  const adminRole = adminOfficer.role || 'SuperAdmin';
  const adminPhone = adminOfficer.phone || '+91 8000 123 456';
  const adminDept = adminOfficer.department || 'Corporate Credit Governance & Compliance Desk';
  const timestamp = adminOfficer.approvedAt || new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });

  const mailOptions = {
    from: process.env.SMTP_FROM || (process.env.GMAIL_USER ? `"PlumbMart Approvals" <${process.env.GMAIL_USER}>` : '"PlumbMart Approvals" <approvals@plumbmart.com>'),
    to: cleanDealerEmail,
    replyTo: adminEmail,
    subject: `✅ [CONGRATULATIONS] Wholesale B2B Account Approved & Activated - ${dealerName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- BANNER HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; background: rgba(0,0,0,0.25); display: inline-block; padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.2);">
                Account Approved & Verified
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">Welcome Back to PlumbMart Wholesale!</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #d1fae5;">Your B2B Credit Line & Ordering Privileges Have Been Fully Re-activated</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155;">
                Dear <strong>${dealerContact}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #475569;">
                We are pleased to inform you that your PlumbMart wholesale dealer account (<strong>${dealerName}</strong> &bull; ID: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${dealerId}</code>) has been <strong>APPROVED & RE-ACTIVATED</strong> by PlumbMart Corporate Governance.
              </p>

              <!-- CREDIT LINE HIGHLIGHT BADGE -->
              <table width="100%" style="background-color: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px; text-align: center;">
                <tr>
                  <td>
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #047857; letter-spacing: 1px;">Approved Credit Limit</div>
                    <div style="font-size: 26px; font-weight: 900; color: #065f46; font-family: monospace; margin-top: 4px;">
                      ₹${creditLimitNum.toLocaleString('en-IN')}
                    </div>
                    <div style="font-size: 12px; font-weight: 700; color: #059669; margin-top: 4px;">
                      ✓ 30-Day Credit &bull; ✓ 90-Day Credit Line (Tier 1) Unlocked
                    </div>
                  </td>
                </tr>
              </table>

              <!-- APPROVING OFFICER DETAILS CARD -->
              <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.5px; margin-bottom: 12px;">
                  Approving Officer & Account Manager
                </div>
                
                <table width="100%" style="font-size: 13px;">
                  <tr>
                    <td style="padding: 5px 0; color: #64748b; width: 35%;">Admin Name:</td>
                    <td style="padding: 5px 0; font-weight: 800; color: #0f172a;">${adminName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Designation / Role:</td>
                    <td style="padding: 5px 0; font-weight: 800; color: #059669;">
                      <span style="background: #d1fae5; padding: 2px 8px; border-radius: 6px;">${adminRole}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Official Email:</td>
                    <td style="padding: 5px 0; font-weight: 700; color: #0284c7;">
                      <a href="mailto:${adminEmail}" style="color: #0284c7; text-decoration: none;">${adminEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Direct Phone / Desk:</td>
                    <td style="padding: 5px 0; font-weight: 800; color: #0f172a;">${adminPhone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Department:</td>
                    <td style="padding: 5px 0; font-weight: 600; color: #475569;">${adminDept}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Approved Timestamp:</td>
                    <td style="padding: 5px 0; font-weight: 600; color: #475569;">${timestamp}</td>
                  </tr>
                </table>
              </div>

              <!-- BUTTON -->
              <div style="text-align: center; margin: 28px 0 10px 0;">
                <a href="http://localhost:3000/dealer/products" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 13px 28px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.3);">
                  Browse Wholesale Catalog & Order Now &rarr;
                </a>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 22px 28px; text-align: center; font-size: 11px; border-top: 1px solid #e2e8f0; line-height: 1.6;">
              <div style="font-weight: 700; color: #ffffff; margin-bottom: 4px;">PlumbMart Technologies Pvt. Ltd. &bull; Peenya Central Distribution Hub</div>
              <div>Outer Ring Road &bull; Peenya Phase 1, Bengaluru, Karnataka - 560058</div>
              <div style="margin-top: 6px;">
                📞 24x7 Corporate Helpline: <b>${adminPhone}</b> &bull; ✉️ <b>${adminEmail}</b>
              </div>
            </td>
          </tr>

        </table>
      </body>
      </html>
    `
  };

  const currentTransporter = getTransporter();
  let emailSentViaSmtp = false;

  if (currentTransporter) {
    try {
      const info = await currentTransporter.sendMail(mailOptions);
      emailSentViaSmtp = true;
      console.log(`[Email Service] Dealer approval notification dispatched to ${cleanDealerEmail} (MsgID: ${info?.messageId || 'OK'})`);
    } catch (err) {
      console.warn(`[Email Service Warning] Failed to dispatch dealer approval notification via SMTP: ${err.message}`);
    }
  }

  console.log('====================================================');
  console.log(`[PLUMBMART DEALER APPROVAL EMAIL DISPATCHED]`);
  console.log(`To Dealer: ${dealerName} <${cleanDealerEmail}>`);
  console.log(`Approved By Officer: ${adminName} <${adminEmail}> (${adminRole})`);
  console.log(`Credit Limit: ₹${creditLimitNum.toLocaleString('en-IN')}`);
  console.log(`Phone: ${adminPhone}`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Dispatched via SMTP: ${emailSentViaSmtp}`);
  console.log('====================================================');

  return {
    success: true,
    dealerEmail: cleanDealerEmail,
    adminEmail,
    adminName,
    adminPhone,
    creditLimit: creditLimitNum,
    emailSentViaSmtp,
    timestamp
  };
}

module.exports = {
  sendEmailOtp,
  verifyEmailOtp,
  generateOtp,
  sendOrderReceiptEmail,
  sendDealerAppealEmail,
  sendDealerSuspensionNotificationEmail,
  sendDealerApprovalNotificationEmail
};

