const { ALERTS, cors } = require('./_data');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  let list = ALERTS.slice();
  if (req.query && req.query.risk) {
    list = list.filter(a => a.risk === req.query.risk);
  }
  const limit = parseInt((req.query && req.query.limit) || 20);
  res.status(200).json(list.slice(0, limit));
};
