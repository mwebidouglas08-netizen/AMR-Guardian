const { callGemini, fallback, cors } = require('./_data');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, conversationHistory = [] } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });

  const system = `You are AMR Guardian AI, expert on antimicrobial resistance. Provide accurate evidence-based answers about AMR statistics, pathogen resistance, antibiotic treatment, stewardship, outbreak surveillance and global health policy. Be concise and practical. Date: ${new Date().toISOString().split('T')[0]}`;

  const response = await callGemini(system, message, conversationHistory.slice(-10));
  res.status(200).json({ response: response || fallback(message) });
};
