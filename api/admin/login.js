const { cors } = require('../_data');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const validUser = (process.env.ADMIN_USERNAME || 'amrguardian_admin').trim();
  const validPass = (process.env.ADMIN_PASSWORD || 'AMR@Guard2026!').trim();

  const { username = '', password = '' } = req.body || {};
  const inputUser = String(username).trim();
  const inputPass = String(password).trim();

  console.log('Admin login attempt:', inputUser);

  if (inputUser === validUser && inputPass === validPass) {
    const token = Buffer.from(`${inputUser}:${Date.now()}`).toString('base64');
    return res.status(200).json({ success: true, token, message: 'Login successful' });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
};
