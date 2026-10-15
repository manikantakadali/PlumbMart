export default async function handler(req, res) {
  // CORS Headers
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

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { email, password, pin, passkey } = body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();
  const cleanPin = String(pin || passkey || '').trim();

  // Super Admin direct verification (accepts 6-digit 507172, 5-digit 50717, or blank)
  if (
    cleanEmail === 'kadalimanikanta2003@gmail.com' &&
    cleanPassword === 'mani@2003' &&
    (cleanPin === '507172' || cleanPin === '50717' || !cleanPin)
  ) {
    const adminUser = {
      id: 'ADM-01',
      name: 'Super Administrator',
      email: 'kadalimanikanta2003@gmail.com',
      mobile: '9347486117',
      role: 'Admin',
      accessLevel: 'SuperAdmin'
    };

    return res.status(200).json({
      success: true,
      message: 'Admin authenticated successfully',
      user: adminUser,
      token: `plumbmart-admin-session-ADM-01-${Date.now()}`
    });
  }

  // Fallback: proxy to Render backend for any other registered admins
  try {
    const renderRes = await fetch('https://plumbmart.onrender.com/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await renderRes.json();
    return res.status(renderRes.status).json(data);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Administrator credentials. Please check your email and password.'
    });
  }
}
