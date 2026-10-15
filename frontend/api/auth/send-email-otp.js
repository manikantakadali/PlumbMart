const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { name, mobile, email, role } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  // 1. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. Synchronize OTP session with Render backend
  try {
    await fetch('https://plumbmart.onrender.com/api/auth/send-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mobile, email: cleanEmail, role })
    });
  } catch (backendErr) {
    console.warn('[Vercel Serverless] Backend sync warning:', backendErr.message);
  }

  // 3. Dispatch Live Email directly from Vercel via Gmail SMTP (port 465 is open on Vercel)
  let emailDispatched = false;
  try {
    const gmailUser = String(process.env.GMAIL_USER || 'manikantakadali99@gmail.com').trim();
    const gmailPass = String(process.env.GMAIL_APP_PASS || 'xgbh bagl wgyx bbzs').replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000
    });

    const mailOptions = {
      from: `"PlumbMart Security" <${gmailUser}>`,
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
              &bull; This verification code expires in <b>1 minute (60 seconds)</b>.<br/>
              &bull; Do not share this code with anyone. PlumbMart representatives will never ask for your verification code.
            </p>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            &copy; 2026 PlumbMart Technologies Pvt. Ltd. &bull; Secure Account Access
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    emailDispatched = true;
    console.log(`[Vercel Serverless] Live email successfully dispatched to ${cleanEmail}`);
  } catch (mailErr) {
    console.error('[Vercel Serverless] SMTP send error:', mailErr.message);
  }

  // Never expose OTP in response
  return res.status(200).json({
    success: true,
    message: `Verification code sent to ${cleanEmail}`,
    email: cleanEmail,
    emailSent: emailDispatched
  });
}
