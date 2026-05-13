const { cors } = require('./_data');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const days = (Date.now() - new Date('2026-01-01').getTime()) / 86400000;
  res.status(200).json({
    annualDeaths: 1270000,
    linkedDeaths: 4950000,
    projected2050: 10000000,
    diagnosticAccessGap: 47,
    countriesMonitored: 104,
    resistantInfectionRate: '1 in 6',
    utiResistanceRate: '1 in 3',
    deathsThisYear: Math.floor((1270000 / 365) * days)
  });
};
