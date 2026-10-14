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

module.exports = {
  sendEmailOtp,
  verifyEmailOtp,
  generateOtp
};
