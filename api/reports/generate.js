const { callGemini, cors } = require('../_data');

const staticReport = (type) => {
  if (type === 'weekly') return '## Weekly AMR Digest\n\n## Summary\n7 high-priority alerts this week. Critical: NDM-1 CRKp Nairobi 147 cases 23% CFR.\n\nEstimated deaths this week: 24,400\n\n## Top Alerts\n- CRITICAL: CRKp NDM-1 Nairobi Kenya 147 cases\n- CRITICAL: XDR gonorrhea Dhaka Bangladesh 89 cases\n- HIGH: ESBL E. coli Mumbai India 2341 cases\n- HIGH: MDR Salmonella Typhi Lagos Nigeria 612 cases\n- HIGH: CRE US ICUs 3892 cases\n\n## Clinical Actions\n- No empiric fluoroquinolones for UTI in Africa and South Asia\n- Contact precautions for ICU patients from NDM-endemic regions\n- Blood cultures before antibiotics in all sepsis cases';
  if (type === 'antibiogram') return '## Antibiogram Sub-Saharan Africa Q2 2026\n\n## Resistance Rates\n- Ampicillin: E. coli 88% K. pneumoniae 95% S. aureus 71%\n- Ciprofloxacin: E. coli 62% K. pneumoniae 58%\n- Ceftriaxone: E. coli 48% K. pneumoniae 62%\n- Imipenem: E. coli 4% K. pneumoniae 8%\n\n## Empiric Therapy\n- UTI: Nitrofurantoin 100mg BD x5d\n- Pyelonephritis: Ceftriaxone 2g IV OD\n- Pneumonia: Amoxicillin 1g TDS x5d\n- Sepsis: Pip-Tazo 4.5g IV q6h + Gentamicin';
  return '## Outbreak Report CRKp NDM-1 Nairobi Kenya May 2026\n\n## Summary\nCases: 147 Deaths: 34 CFR: 23%\nAMR Guardian predicted 8 days prior\n\n## Genomics\nOrganism: K. pneumoniae ST258 NDM-1\nSusceptible: Colistin Tigecycline Ceftazidime-avibactam\n\n## Treatment\n- Colistin 9MU loading then 4.5MU IV q12h\n- Tigecycline 100mg loading then 50mg q12h\n- Ceftazidime-avibactam 2.5g IV q8h';
};

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { reportType } = req.body || {};
  const prompts = {
    weekly: 'Generate a weekly AMR surveillance digest. Include global death toll estimate, top 5 resistance alerts with location and pathogen, regional resistance trends, emerging resistance genes NDM-1 KPC OXA-48, and clinical action items. Use ## for section headers.',
    antibiogram: 'Generate a regional antibiogram for Sub-Saharan Africa Q2 2026. Include resistance rates for E. coli K. pneumoniae S. aureus, recommended empiric therapy for UTI pneumonia sepsis, antibiotics to avoid. Use ## for section headers.',
    outbreak: 'Generate an outbreak investigation report for carbapenem-resistant K. pneumoniae NDM-1 in Nairobi Kenya. Cases 147 mortality 23% May 4 2026. Include timeline genomic findings containment measures treatment options. Use ## for section headers.'
  };

  if (!prompts[reportType]) return res.status(400).json({ error: 'Invalid report type' });

  const response = await callGemini('You are AMR Guardian AI generating professional AMR public health reports. Use ## for section headers.', prompts[reportType]);
  res.status(200).json({ report: response || staticReport(reportType), generated: new Date().toISOString() });
};
