const { STEWARDSHIP, cors } = require('./_data');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { infectionType, pregnancy = '', renal = '' } = req.body || {};
  if (!infectionType) return res.status(400).json({ error: 'Infection type required' });

  const d = STEWARDSHIP[infectionType];
  if (!d) return res.status(404).json({ error: 'Infection type not found' });

  const isPrg = pregnancy.includes('Pregnant') || pregnancy.includes('Breastfeeding');
  const isBR = renal.includes('Severe') || renal.includes('ESRD');

  let fl = d.firstLine;
  let note = d.notes;

  if (isPrg && d.pregnancyFirst) {
    fl = { drug: d.pregnancyFirst, dose: 'Pregnancy-safe option selected' };
    note += ' Avoid nitrofurantoin 1st trimester. Avoid fluoroquinolones throughout pregnancy.';
  }
  if (isBR) note += ' RENAL ADJUSTMENT: Nitrofurantoin contraindicated if eGFR less than 30.';

  res.status(200).json({
    infectionType,
    firstLine: fl,
    alternatives: d.alternatives,
    toAvoid: d.avoid,
    duration: d.duration,
    stewardshipNotes: note,
    localResistanceWarning: d.warning
  });
};
