const { PATHOGENS, cors } = require('../_data');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.status(200).json(PATHOGENS);
};
