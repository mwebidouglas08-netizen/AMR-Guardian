const { cors } = require('../_data');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const data = [];
  for (let i = 1; i <= 30; i++) {
    const base = 10 + i * 1.5;
    const spike = i > 20 ? Math.pow(i - 20, 1.8) * 3 : 0;
    data.push({
      day: i,
      wastewater: Math.round(base + spike + Math.random() * 15),
      hospitalAdmissions: Math.round(100 + i * 3 + (i > 20 ? (i - 20) * 12 : 0)),
      aiScore: Math.round(base * 0.8 + spike * 0.9 + Math.random() * 10),
      pharmacy: Math.round(50 + i * 1.2 + (i > 22 ? (i - 22) * 8 : 0))
    });
  }
  res.status(200).json(data);
};
