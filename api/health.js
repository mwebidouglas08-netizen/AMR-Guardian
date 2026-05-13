const { cors } = require('./_data');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.status(200).json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    ai: process.env.GEMINI_API_KEY ? 'gemini' : 'fallback'
  });
};
