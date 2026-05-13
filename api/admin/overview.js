const { ALERTS, REGIONAL, cors } = require('../_data');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!req.headers.authorization) return res.status(401).json({ error: 'Unauthorized' });

  res.status(200).json({
    summary: {
      totalAlerts: ALERTS.length,
      criticalAlerts: ALERTS.filter(a => a.risk === 'critical').length,
      highAlerts: ALERTS.filter(a => a.risk === 'high').length,
      countriesMonitored: 104,
      apiStatus: process.env.GEMINI_API_KEY ? 'Gemini Connected' : 'Fallback Mode',
      lastUpdated: new Date().toISOString()
    },
    alerts: ALERTS,
    regionalResistance: REGIONAL,
    systemHealth: {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'production',
      platform: 'Vercel Serverless'
    }
  });
};
