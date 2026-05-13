// Shared AMR data for all serverless functions

const ALERTS = [
  { id: 1, date: '2026-05-04', location: 'Nairobi, Kenya', pathogen: 'K. pneumoniae', resistanceType: 'Carbapenem-resistant (NDM-1)', risk: 'critical', cases: 147, mortality: '23%', description: 'NDM-1 carbapenem-resistant Klebsiella pneumoniae spreading across 3 hospitals. AMR Guardian predicted this cluster 8 days prior.', genomicConfidence: '97.3%' },
  { id: 2, date: '2026-05-03', location: 'Mumbai, India', pathogen: 'E. coli', resistanceType: 'ESBL-producing', risk: 'high', cases: 2341, mortality: '4%', description: 'ESBL-producing E. coli rates exceeding 74% across Mumbai tertiary hospitals.', genomicConfidence: '91.8%' },
  { id: 3, date: '2026-05-02', location: 'Dhaka, Bangladesh', pathogen: 'N. gonorrhoeae', resistanceType: 'XDR gonorrhea', risk: 'critical', cases: 89, mortality: '0.5%', description: 'XDR Neisseria gonorrhoeae resistant to all WHO first-line antibiotics. Mosaic penA gene confirmed.', genomicConfidence: '98.1%' },
  { id: 4, date: '2026-05-01', location: 'Lagos, Nigeria', pathogen: 'Salmonella Typhi', resistanceType: 'Fluoroquinolone-resistant MDR', risk: 'high', cases: 612, mortality: '3.2%', description: 'MDR typhoid fever. Fluoroquinolone resistance at 88%. Children under 5 primarily affected.', genomicConfidence: '94.5%' },
  { id: 5, date: '2026-04-29', location: 'Jakarta, Indonesia', pathogen: 'S. aureus (MRSA)', resistanceType: 'Methicillin-resistant', risk: 'medium', cases: 331, mortality: '8%', description: 'Community-acquired MRSA rising. Livestock antibiotic overuse suspected.', genomicConfidence: '88.2%' },
  { id: 6, date: '2026-04-28', location: 'United States (nationwide)', pathogen: 'Enterobacteriaceae', resistanceType: 'Carbapenem-resistant (CRE)', risk: 'high', cases: 3892, mortality: '18%', description: 'CRE cases in US ICUs up 69% year-over-year. NDM strains increased 461%.', genomicConfidence: '95.7%' },
  { id: 7, date: '2026-04-26', location: 'Tashkent, Uzbekistan', pathogen: 'M. tuberculosis', resistanceType: 'Pre-XDR TB', risk: 'medium', cases: 56, mortality: '15%', description: 'Pre-XDR tuberculosis cluster flagged from anomalous treatment failure rates.', genomicConfidence: '92.3%' }
];

const REGIONAL = [
  { region: 'Sub-Saharan Africa', rate: 82, trend: 'rising' },
  { region: 'South Asia', rate: 76, trend: 'rising' },
  { region: 'Southeast Asia', rate: 68, trend: 'rising' },
  { region: 'Latin America', rate: 55, trend: 'stable' },
  { region: 'Eastern Europe', rate: 47, trend: 'stable' },
  { region: 'Middle East / N. Africa', rate: 58, trend: 'rising' },
  { region: 'Western Europe', rate: 23, trend: 'declining' },
  { region: 'North America', rate: 28, trend: 'stable' },
  { region: 'East Asia', rate: 45, trend: 'stable' },
  { region: 'Oceania', rate: 19, trend: 'declining' }
];

const PATHOGENS = [
  { pathogen: 'E. coli (FQ-R)', rate: 52, color: '#ff6b6b' },
  { pathogen: 'K. pneumoniae (3GC-R)', rate: 63, color: '#ff8c42' },
  { pathogen: 'MRSA', rate: 27, color: '#ffd166' },
  { pathogen: 'A. baumannii (Carba-R)', rate: 58, color: '#ff4757' },
  { pathogen: 'P. aeruginosa (Carba-R)', rate: 34, color: '#a78bfa' },
  { pathogen: 'S. Typhi (FQ-R)', rate: 78, color: '#4ecdc4' }
];

const ANTIBIOGRAM = {
  region: 'Nairobi / East Africa',
  updated: 'May 2026',
  pathogens: ['E. coli', 'K. pneumoniae', 'S. aureus'],
  antibiotics: [
    { name: 'Ampicillin', rates: [88, 95, 71] },
    { name: 'Ciprofloxacin', rates: [62, 58, 25] },
    { name: 'Cotrimoxazole', rates: [74, 80, 45] },
    { name: 'Ceftriaxone', rates: [48, 62, 38] },
    { name: 'Gentamicin', rates: [35, 42, 22] },
    { name: 'Imipenem', rates: [4, 8, 0] },
    { name: 'Pip-Tazo', rates: [18, 24, 15] }
  ]
};

const PROFILES = {
  ecoli: { name: 'Escherichia coli', scores: { 'Sub-Saharan Africa': 78, 'South Asia': 75, 'Southeast Asia': 68, def: 42 }, antibiotics: [{ name: 'Ampicillin', s: 'resistant' }, { name: 'Ciprofloxacin', s: 'intermediate', hr: 'resistant' }, { name: 'TMP-SMX', s: 'resistant' }, { name: 'Ceftriaxone', s: 'sensitive' }, { name: 'Gentamicin', s: 'sensitive' }, { name: 'Imipenem', s: 'sensitive', cb: 'resistant' }, { name: 'Nitrofurantoin', s: 'sensitive' }, { name: 'Fosfomycin', s: 'sensitive' }, { name: 'Pip-Tazo', s: 'sensitive', ml: 'intermediate' }], rec: { def: 'Nitrofurantoin 100mg BD x5 days for UTI. Systemic: Piperacillin-tazobactam 4.5g IV q8h. Avoid fluoroquinolones empirically.', hr: 'High resistance risk. Imipenem-cilastatin 500mg IV q6h. Urgent ID consult if carbapenem-resistant. Strict contact isolation.', cb: 'Carbapenem resistance suspected. Colistin last resort with ID consult. Urgent cultures. Contact precautions.' } },
  kpneumo: { name: 'Klebsiella pneumoniae', scores: { 'Sub-Saharan Africa': 85, 'South Asia': 82, def: 55 }, antibiotics: [{ name: 'Ampicillin', s: 'resistant' }, { name: 'Ciprofloxacin', s: 'resistant' }, { name: 'Ceftriaxone', s: 'resistant' }, { name: 'Pip-Tazo', s: 'intermediate' }, { name: 'Imipenem', s: 'sensitive', cb: 'resistant' }, { name: 'Gentamicin', s: 'intermediate' }, { name: 'Colistin', s: 'sensitive' }, { name: 'Tigecycline', s: 'sensitive' }, { name: 'Ceftazidime-Avi', s: 'sensitive' }], rec: { def: 'ESBL K. pneumoniae suspected. Imipenem-cilastatin 500mg IV q6h. Strict contact isolation.', hr: 'Carbapenem-resistant Klebsiella. Colistin 9MU loading then 4.5MU q12h. Urgent ID consultation.', cb: 'Carbapenem resistance confirmed. Ceftazidime-avibactam 2.5g IV q8h + aztreonam. Report as notifiable event.' } },
  saur: { name: 'Staphylococcus aureus', scores: { def: 45 }, antibiotics: [{ name: 'Oxacillin', s: 'intermediate', icu: 'resistant' }, { name: 'Vancomycin', s: 'sensitive' }, { name: 'Daptomycin', s: 'sensitive' }, { name: 'Linezolid', s: 'sensitive' }, { name: 'TMP-SMX', s: 'sensitive' }, { name: 'Clindamycin', s: 'intermediate' }, { name: 'Rifampicin', s: 'sensitive' }, { name: 'Doxycycline', s: 'sensitive' }, { name: 'Cefazolin', s: 'sensitive', icu: 'resistant' }], rec: { def: 'Community MRSA possible. Cefazolin 2g IV q8h or Flucloxacillin 2g IV q6h. Nasal MRSA screen.', hr: 'ICU MRSA likely. Vancomycin 25-30mg/kg/day IV. Trough 10-20mg/L.', cb: 'MRSA. Vancomycin 25-30mg/kg/day IV or Daptomycin 6mg/kg IV OD.' } },
  paerug: { name: 'Pseudomonas aeruginosa', scores: { def: 70 }, antibiotics: [{ name: 'Ampicillin', s: 'resistant' }, { name: 'Ciprofloxacin', s: 'intermediate' }, { name: 'Ceftazidime', s: 'sensitive' }, { name: 'Pip-Tazo', s: 'sensitive' }, { name: 'Imipenem', s: 'intermediate' }, { name: 'Meropenem', s: 'sensitive' }, { name: 'Gentamicin', s: 'intermediate' }, { name: 'Amikacin', s: 'sensitive' }, { name: 'Colistin', s: 'sensitive' }], rec: { def: 'Pip-Tazo 4.5g IV q6h extended infusion + Amikacin 15-20mg/kg IV q24h.', hr: 'MDR Pseudomonas. Meropenem 2g IV q8h + Amikacin 20mg/kg IV OD.', cb: 'Carbapenem-resistant Pseudomonas. Colistin + Rifampicin.' } },
  abau: { name: 'Acinetobacter baumannii', scores: { 'Sub-Saharan Africa': 88, 'South Asia': 84, def: 65 }, antibiotics: [{ name: 'Ampicillin', s: 'resistant' }, { name: 'Ciprofloxacin', s: 'resistant' }, { name: 'Ceftriaxone', s: 'resistant' }, { name: 'Meropenem', s: 'intermediate', hr: 'resistant' }, { name: 'Pip-Tazo', s: 'resistant' }, { name: 'Gentamicin', s: 'resistant' }, { name: 'Amikacin', s: 'intermediate' }, { name: 'Colistin', s: 'sensitive' }, { name: 'Tigecycline', s: 'sensitive' }], rec: { def: 'Colistin 9MU loading then 4.5MU IV q12h + rifampicin or tigecycline.', hr: 'XDR Acinetobacter. Colistin + Tigecycline + Carbapenem triple therapy.', cb: 'Pandrug-resistant. Cefiderocol if available. Colistin backbone.' } }
};

const STEWARDSHIP = {
  'Urinary Tract Infection (uncomplicated)': { firstLine: { drug: 'Nitrofurantoin 100mg modified-release', dose: 'PO twice daily x 5 days' }, alternatives: ['Fosfomycin 3g PO single dose', 'Trimethoprim 200mg PO BD x 7 days if local resistance less than 20%'], pregnancyFirst: 'Cephalexin 500mg PO QDS x 7 days', avoid: ['Ciprofloxacin resistance greater than 60%', 'TMP-SMX resistance greater than 70%', 'Ampicillin resistance greater than 85%'], duration: '5-7 days', warning: 'E. coli fluoroquinolone resistance in East Africa exceeds 62%. Do NOT use ciprofloxacin empirically for UTI.', notes: 'Check eGFR before nitrofurantoin. Avoid if eGFR less than 30.' },
  'Urinary Tract Infection (complicated/pyelonephritis)': { firstLine: { drug: 'Ceftriaxone 1-2g IV once daily', dose: 'IV until afebrile 24-48h then oral step-down' }, alternatives: ['Amoxicillin-clavulanate 1g PO BD step-down', 'Ciprofloxacin 500mg PO BD if susceptible', 'Gentamicin 5mg/kg IV OD'], pregnancyFirst: 'Ceftriaxone 2g IV OD safe in pregnancy', avoid: ['TMP-SMX empirically', 'Fluoroquinolones empirically'], duration: '10-14 days total', warning: 'ESBL E. coli common. If no improvement at 48h escalate to imipenem.', notes: 'Culture before antibiotics. Blood cultures if systemically unwell.' },
  'Community-acquired pneumonia': { firstLine: { drug: 'Amoxicillin 1g PO three times daily', dose: 'x 5 days mild or IV if moderate-severe' }, alternatives: ['Amoxicillin-clavulanate 1g PO BD', 'Doxycycline 100mg PO BD x 5d', 'Co-amoxiclav + Clarithromycin moderate-severe'], pregnancyFirst: 'Amoxicillin-clavulanate 625mg PO TDS x 7 days', avoid: ['Macrolide monotherapy resistance greater than 35%', 'Levofloxacin first-line'], duration: '5-7 days mild 7-10 days moderate', warning: 'Macrolide resistance exceeds 35%. Do not use azithromycin monotherapy.', notes: 'CRB-65 guides severity. Add atypical coverage for hospitalized patients.' },
  'Hospital-acquired pneumonia': { firstLine: { drug: 'Piperacillin-tazobactam 4.5g IV every 6 hours', dose: 'Extended 4h infusion. Add vancomycin if MRSA risk.' }, alternatives: ['Meropenem 1g IV q8h MDR risk', 'Vancomycin 25mg/kg/day IV MRSA', 'Colistin pan-resistant Gram-negatives'], pregnancyFirst: 'Piperacillin-tazobactam 4.5g IV q6h', avoid: ['Ceftriaxone alone', 'Quinolone monotherapy'], duration: '7-8 days', warning: 'Carbapenem coverage may be needed given high CRE prevalence in ICU.', notes: 'De-escalate at 48-72h based on cultures.' },
  'Sepsis (unknown source)': { firstLine: { drug: 'Piperacillin-tazobactam 4.5g IV + Gentamicin 5mg/kg IV OD', dose: 'Within 1 hour of sepsis recognition.' }, alternatives: ['Meropenem 1g IV q8h', 'Add Vancomycin if MRSA suspected', 'Imipenem 500mg IV q6h severe MDR'], pregnancyFirst: 'Piperacillin-tazobactam 4.5g IV q6h plus seek obstetrics input', avoid: ['Delay beyond 1 hour', 'Narrow spectrum in ICU'], duration: '7-10 days if source controlled', warning: 'Sepsis bundle: Blood cultures BEFORE antibiotics, lactate, fluids 30mL/kg, antibiotics within 1 hour.', notes: 'De-escalate at 48-72h using culture results.' },
  'Skin & soft tissue infection': { firstLine: { drug: 'Flucloxacillin 500mg-1g PO/IV four times daily', dose: 'PO if mild IV if unwell or spreading' }, alternatives: ['Cephalexin 500mg PO QDS', 'Co-amoxiclav 625mg PO TDS bite wounds', 'Vancomycin IV MRSA'], pregnancyFirst: 'Cephalexin 500mg PO QDS safe in pregnancy', avoid: ['Empiric vancomycin unless MRSA risk', 'Fluoroquinolones for skin'], duration: '5-7 days cellulitis 7-14 days abscess', warning: 'Mark cellulitis borders. If not improving at 48-72h consider MRSA cover.', notes: 'Drain abscesses. Antibiotics alone insufficient for purulent collections.' },
  'Intra-abdominal infection': { firstLine: { drug: 'Piperacillin-tazobactam 4.5g IV every 8 hours', dose: 'IV until source controlled then step-down' }, alternatives: ['Ceftriaxone 2g IV OD + Metronidazole 500mg IV TDS', 'Meropenem 1g IV q8h severe ICU', 'Ertapenem 1g IV OD moderate'], pregnancyFirst: 'Ceftriaxone + Metronidazole avoid Metro 1st trimester', avoid: ['Missing anaerobic coverage', 'Fluoroquinolones alone'], duration: '4-5 days post source control', warning: 'Source control is critical. Antibiotics are adjunctive only.', notes: 'Obtain intraoperative cultures.' },
  'Meningitis (bacterial)': { firstLine: { drug: 'Ceftriaxone 2g IV every 12 hours', dose: 'START IMMEDIATELY. Dexamethasone 0.15mg/kg IV QDS x4 days.' }, alternatives: ['Ampicillin 2g IV q4h Listeria risk', 'Meropenem 2g IV q8h cephalosporin allergy', 'Vancomycin post-neurosurgery'], pregnancyFirst: 'Ceftriaxone 2g IV q12h + Ampicillin 2g IV q4h', avoid: ['Oral antibiotics', 'Delaying for imaging if diagnosis clear'], duration: '10-14 days pneumococcal 21 days Listeria', warning: 'Medical emergency. Time to antibiotics is critical.', notes: 'Notify public health for meningococcal disease.' },
  'Sexually transmitted infection': { firstLine: { drug: 'Ceftriaxone 1g IM single dose', dose: 'Gonorrhea. Add doxycycline 100mg PO BD x7 days for chlamydia.' }, alternatives: ['Cefixime 400mg PO single dose', 'Benzathine penicillin 2.4MU IM syphilis', 'Azithromycin 1g chlamydia only'], pregnancyFirst: 'Ceftriaxone 1g IM. Replace doxycycline with azithromycin.', avoid: ['Ciprofloxacin for gonorrhea high resistance', 'Penicillin alone for gonorrhea'], duration: 'Single dose gonorrhea 7 days chlamydia 14 days PID', warning: 'XDR gonorrhea spreading. Test of cure at 1-2 weeks recommended.', notes: 'Always treat chlamydia co-infection. Partner notification essential.' }
};

async function callGemini(system, user, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const contents = history.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  contents.push({ role: 'user', parts: [{ text: user }] });
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents, generationConfig: { maxOutputTokens: 1000, temperature: 0.7 } }) });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (e) { return null; }
}

function fallback(msg) {
  const m = msg.toLowerCase();
  if (m.includes('mrsa') || m.includes('staphylococcus')) return 'MRSA is resistant to all beta-lactam antibiotics. First-line: Vancomycin 25-30mg/kg/day IV. Alternatives: Daptomycin bacteremia/skin, Linezolid pneumonia.';
  if (m.includes('carbapenem') || m.includes('cre') || m.includes('ndm')) return 'Carbapenem resistance mechanisms: NDM (South Asia/Africa), KPC (Americas), OXA-48 (MENA). Treatment: colistin, ceftazidime-avibactam, or cefiderocol. US CRE surged 69% in 2025.';
  if (m.includes('death') || m.includes('kill') || m.includes('many')) return 'AMR causes 1.27 million direct deaths per year globally. Associated deaths: 4.95 million/year. UN projects 10 million deaths/year by 2050.';
  if (m.includes('africa') || m.includes('lmic')) return 'AMR worst in Sub-Saharan Africa: 18% lab coverage, OTC antibiotics in 70% of countries, 1 doctor per 10,000 people. E. coli fluoroquinolone resistance exceeds 62%.';
  if (m.includes('wastewater') || m.includes('surveillance')) return 'Wastewater surveillance detects AMR genes via qPCR, covering thousands of people per sample. Detects resistance 1-4 weeks before clinical cases. AMR Guardian uses these signals for 8+ day early warning.';
  if (m.includes('stewardship') || m.includes('prescrib')) return 'Antibiotic stewardship: right drug, right dose, right duration (5-7 days most infections), right route (IV-to-oral when safe). Reduces antibiotic use 20-30% without compromising outcomes.';
  return 'I specialize in antimicrobial resistance. Ask me about resistance patterns, treatment guidance, stewardship, outbreak surveillance, or global AMR policy.';
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = { ALERTS, REGIONAL, PATHOGENS, ANTIBIOGRAM, PROFILES, STEWARDSHIP, callGemini, fallback, cors };
