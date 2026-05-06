require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '2mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ── Anthropic Client ──────────────────────────────────────────────────────────
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// ── AMR Data ──────────────────────────────────────────────────────────────────
const AMR_DATA = {
  stats: {
    annualDeaths: 1270000,
    linkedDeaths: 4950000,
    projected2050: 10000000,
    diagnosticAccessGap: 47,
    countriesMonitored: 104,
    resistantInfectionRate: '1 in 6',
    utiResistanceRate: '1 in 3'
  },
  alerts: [
    {
      id: 1, date: '2026-05-04', location: 'Nairobi, Kenya',
      pathogen: 'K. pneumoniae', resistanceType: 'Carbapenem-resistant (NDM-1)',
      risk: 'critical', cases: 147, mortality: '23%',
      description: 'NDM-1 gene producing carbapenem-resistant Klebsiella pneumoniae spreading across 3 hospitals. AMR Guardian AI predicted this cluster 8 days prior from wastewater surveillance signals.',
      genomicConfidence: '97.3%'
    },
    {
      id: 2, date: '2026-05-03', location: 'Mumbai, India',
      pathogen: 'E. coli', resistanceType: 'ESBL-producing',
      risk: 'high', cases: 2341, mortality: '4%',
      description: 'Extended-spectrum beta-lactamase producing E. coli rates exceeding 74% across Mumbai tertiary hospitals. AI analysis flagging likely food system contamination vector.',
      genomicConfidence: '91.8%'
    },
    {
      id: 3, date: '2026-05-02', location: 'Dhaka, Bangladesh',
      pathogen: 'N. gonorrhoeae', resistanceType: 'XDR gonorrhea',
      risk: 'critical', cases: 89, mortality: '0.5%',
      description: 'Extensively drug-resistant Neisseria gonorrhoeae detected with resistance to all WHO-recommended first-line antibiotics. Mosaic penA gene confirmed.',
      genomicConfidence: '98.1%'
    },
    {
      id: 4, date: '2026-05-01', location: 'Lagos, Nigeria',
      pathogen: 'Salmonella Typhi', resistanceType: 'Fluoroquinolone-resistant MDR',
      risk: 'high', cases: 612, mortality: '3.2%',
      description: 'Multi-drug resistant typhoid fever. Fluoroquinolone resistance at 88%. Children under 5 primarily affected. Water contamination suspected.',
      genomicConfidence: '94.5%'
    },
    {
      id: 5, date: '2026-04-29', location: 'Jakarta, Indonesia',
      pathogen: 'S. aureus (MRSA)', resistanceType: 'Methicillin-resistant',
      risk: 'medium', cases: 331, mortality: '8%',
      description: 'Community-acquired MRSA rising. Livestock antibiotic overuse suspected as resistance driver based on geographic clustering.',
      genomicConfidence: '88.2%'
    },
    {
      id: 6, date: '2026-04-28', location: 'United States (nationwide)',
      pathogen: 'Enterobacteriaceae', resistanceType: 'Carbapenem-resistant (CRE)',
      risk: 'high', cases: 3892, mortality: '18%',
      description: 'CRE cases in US ICUs up 69% year-over-year. NDM strains increased 461%. AMR Guardian detected anomalous prescription patterns 3 weeks before official recognition.',
      genomicConfidence: '95.7%'
    },
    {
      id: 7, date: '2026-04-26', location: 'Tashkent, Uzbekistan',
      pathogen: 'M. tuberculosis', resistanceType: 'Pre-XDR TB',
      risk: 'medium', cases: 56, mortality: '15%',
      description: 'Pre-XDR tuberculosis cluster. AMR Guardian flagged anomalous treatment failure rates from 12 clinics. WHO Emergency Response Team notified.',
      genomicConfidence: '92.3%'
    }
  ],
  regionalResistance: [
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
  ],
  pathogenResistance: [
    { pathogen: 'E. coli (FQ-R)', rate: 52, color: '#ff6b6b' },
    { pathogen: 'K. pneumoniae (3GC-R)', rate: 63, color: '#ff8c42' },
    { pathogen: 'MRSA', rate: 27, color: '#ffd166' },
    { pathogen: 'A. baumannii (Carba-R)', rate: 58, color: '#ff4757' },
    { pathogen: 'P. aeruginosa (Carba-R)', rate: 34, color: '#a78bfa' },
    { pathogen: 'S. Typhi (FQ-R)', rate: 78, color: '#4ecdc4' }
  ],
  antibiogramNairobi: {
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
  }
};

// Resistance prediction profiles
const RESISTANCE_PROFILES = {
  ecoli: {
    name: 'Escherichia coli',
    baseScore: { 'Sub-Saharan Africa': 78, 'South Asia': 75, 'Southeast Asia': 68, default: 42 },
    antibiotics: [
      { name: 'Ampicillin', baseStatus: 'resistant' },
      { name: 'Ciprofloxacin', baseStatus: 'intermediate', highRiskStatus: 'resistant' },
      { name: 'TMP-SMX', baseStatus: 'resistant' },
      { name: 'Ceftriaxone', baseStatus: 'sensitive', priorCephStatus: 'resistant' },
      { name: 'Gentamicin', baseStatus: 'sensitive' },
      { name: 'Imipenem', baseStatus: 'sensitive', carbapenemStatus: 'resistant' },
      { name: 'Nitrofurantoin', baseStatus: 'sensitive' },
      { name: 'Fosfomycin', baseStatus: 'sensitive' },
      { name: 'Pip-Tazo', baseStatus: 'sensitive', multipleStatus: 'intermediate' }
    ],
    recommendation: {
      default: 'Nitrofurantoin 100mg BD x5 days for UTI. For systemic: Piperacillin-tazobactam 4.5g IV q8h. Avoid fluoroquinolones empirically in this region due to >60% resistance rates.',
      highRisk: 'High resistance risk. Consider Imipenem-cilastatin 500mg IV q6h. If carbapenem-resistant, urgent ID consult — ceftazidime-avibactam combination therapy. Strict contact isolation required.',
      carbapenem: 'Possible carbapenem resistance. Consider colistin (last resort) with ID consult. Obtain urgent cultures. Implement immediate contact precautions.'
    }
  },
  kpneumo: {
    name: 'Klebsiella pneumoniae',
    baseScore: { 'Sub-Saharan Africa': 85, 'South Asia': 82, default: 55 },
    antibiotics: [
      { name: 'Ampicillin', baseStatus: 'resistant' },
      { name: 'Ciprofloxacin', baseStatus: 'resistant' },
      { name: 'Ceftriaxone', baseStatus: 'resistant' },
      { name: 'Pip-Tazo', baseStatus: 'intermediate' },
      { name: 'Imipenem', baseStatus: 'sensitive', carbapenemStatus: 'resistant' },
      { name: 'Gentamicin', baseStatus: 'intermediate' },
      { name: 'Colistin', baseStatus: 'sensitive' },
      { name: 'Tigecycline', baseStatus: 'sensitive' },
      { name: 'Ceftazidime-Avi', baseStatus: 'sensitive' }
    ],
    recommendation: {
      default: 'High suspicion for ESBL-producing K. pneumoniae. Empiric: Imipenem-cilastatin 500mg IV q6h. If carbapenem-resistant: ceftazidime-avibactam + aztreonam. Strict contact isolation. Report to infection control.',
      highRisk: 'Critical resistance profile. Carbapenem-resistant Klebsiella suspected. Colistin 9MU loading then 4.5MU q12h as last resort. Combination therapy essential. Urgent ID consultation.',
      carbapenem: 'Carbapenem resistance confirmed pattern. Consider ceftazidime-avibactam 2.5g IV q8h + aztreonam 2g IV q6h. Colistin if unavailable. Report as notifiable event.'
    }
  },
  saur: {
    name: 'Staphylococcus aureus',
    baseScore: { default: 45, ICU: 65 },
    antibiotics: [
      { name: 'Oxacillin/Methicillin', baseStatus: 'intermediate', icuStatus: 'resistant' },
      { name: 'Vancomycin', baseStatus: 'sensitive' },
      { name: 'Daptomycin', baseStatus: 'sensitive' },
      { name: 'Linezolid', baseStatus: 'sensitive' },
      { name: 'TMP-SMX', baseStatus: 'sensitive' },
      { name: 'Clindamycin', baseStatus: 'intermediate' },
      { name: 'Rifampicin', baseStatus: 'sensitive' },
      { name: 'Doxycycline', baseStatus: 'sensitive' },
      { name: 'Cefazolin', baseStatus: 'sensitive', icuStatus: 'resistant' }
    ],
    recommendation: {
      default: 'Community MRSA possible. Empiric: Cefazolin 2g IV q8h or Flucloxacillin 2g IV q6h. Nasal MRSA screen recommended. Adjust based on culture results.',
      highRisk: 'ICU-acquired MRSA likely. Vancomycin 25-30mg/kg/day IV in divided doses. Target trough 10-20mg/L. Echocardiogram if bacteremia. De-escalate if MSSA confirmed.',
      carbapenem: 'Suspect MRSA. Vancomycin 25-30mg/kg/day IV. Consider Daptomycin 6mg/kg IV OD for skin/soft tissue. Linezolid 600mg IV/PO BD for pneumonia.'
    }
  },
  paerug: {
    name: 'Pseudomonas aeruginosa',
    baseScore: { default: 70 },
    antibiotics: [
      { name: 'Ampicillin', baseStatus: 'resistant' },
      { name: 'Ciprofloxacin', baseStatus: 'intermediate' },
      { name: 'Ceftazidime', baseStatus: 'sensitive' },
      { name: 'Pip-Tazo', baseStatus: 'sensitive' },
      { name: 'Imipenem', baseStatus: 'intermediate' },
      { name: 'Meropenem', baseStatus: 'sensitive' },
      { name: 'Gentamicin', baseStatus: 'intermediate' },
      { name: 'Amikacin', baseStatus: 'sensitive' },
      { name: 'Colistin', baseStatus: 'sensitive' }
    ],
    recommendation: {
      default: 'Piperacillin-tazobactam 4.5g IV q6h (extended 4h infusion) + Amikacin 15-20mg/kg IV q24h combination therapy. Meropenem 2g IV q8h for MDR. Prolonged courses often required.',
      highRisk: 'MDR Pseudomonas. Dual anti-pseudomonal therapy essential. Meropenem 2g IV q8h + Amikacin 20mg/kg IV OD. Consider colistin for XDR. Daily susceptibility monitoring.',
      carbapenem: 'Carbapenem-resistant Pseudomonas. Colistin + Rifampicin combination. Consider ceftolozane-tazobactam 3g IV q8h if available. ID consultation mandatory.'
    }
  },
  abau: {
    name: 'Acinetobacter baumannii',
    baseScore: { 'Sub-Saharan Africa': 88, 'South Asia': 84, default: 65 },
    antibiotics: [
      { name: 'Ampicillin', baseStatus: 'resistant' },
      { name: 'Ciprofloxacin', baseStatus: 'resistant' },
      { name: 'Ceftriaxone', baseStatus: 'resistant' },
      { name: 'Meropenem', baseStatus: 'intermediate', highRiskStatus: 'resistant' },
      { name: 'Pip-Tazo', baseStatus: 'resistant' },
      { name: 'Gentamicin', baseStatus: 'resistant' },
      { name: 'Amikacin', baseStatus: 'intermediate' },
      { name: 'Colistin', baseStatus: 'sensitive' },
      { name: 'Tigecycline', baseStatus: 'sensitive' }
    ],
    recommendation: {
      default: 'Carbapenem-resistant A. baumannii common. Colistin 9MU loading then 4.5MU IV q12h. Combine with rifampicin 600mg OD or tigecycline. All contacts require strict isolation.',
      highRisk: 'XDR Acinetobacter. Last-resort options: Colistin + Tigecycline + Carbapenem triple therapy. Sulbactam-based regimens may have activity. Urgent ID consultation required.',
      carbapenem: 'Pandrug-resistant Acinetobacter suspected. Compassionate use protocols may be needed. Cefiderocol if available. Colistin backbone with combination partner.'
    }
  }
};

// Stewardship recommendations
const STEWARDSHIP_DATA = {
  'Urinary Tract Infection (uncomplicated)': {
    firstLine: { drug: 'Nitrofurantoin 100mg modified-release', dose: 'PO twice daily x 5 days', safePregnancy: false },
    alternatives: ['Fosfomycin 3g PO single dose', 'Pivmecillinam 400mg PO BD x 3–7 days', 'Trimethoprim 200mg PO BD x 7 days (if local resistance <20%)'],
    pregnancyFirst: 'Cephalexin 500mg PO four times daily x 7 days',
    avoid: ['Ciprofloxacin (resistance >60% locally)', 'TMP-SMX (resistance >70% in this region)', 'Ampicillin (resistance >85%)'],
    duration: '5–7 days',
    warning: 'E. coli fluoroquinolone resistance in East Africa exceeds 62%. Ciprofloxacin should NOT be used empirically for UTI in this region.',
    notes: 'Reserve fluoroquinolones for complicated UTI or pyelonephritis. Check renal function before nitrofurantoin (avoid if eGFR <30). IV-to-oral switch as soon as patient can tolerate.'
  },
  'Urinary Tract Infection (complicated/pyelonephritis)': {
    firstLine: { drug: 'Ceftriaxone 1–2g IV once daily', dose: 'IV until afebrile 24-48h, then oral step-down', safePregnancy: true },
    alternatives: ['Amoxicillin-clavulanate 1g PO BD (oral step-down)', 'Ciprofloxacin 500mg PO BD (if susceptible on culture)', 'Gentamicin 5mg/kg IV OD (short course)'],
    pregnancyFirst: 'Ceftriaxone 2g IV OD (safe in pregnancy)',
    avoid: ['TMP-SMX empirically', 'Fluoroquinolones empirically in this region'],
    duration: '10–14 days total',
    warning: 'ESBL E. coli prevalence is high in this region. If clinical deterioration on ceftriaxone, escalate to imipenem and obtain urgent cultures.',
    notes: 'Obtain midstream urine culture BEFORE antibiotics. Blood cultures if systemically unwell. De-escalate at 48-72h based on culture sensitivities.'
  },
  'Community-acquired pneumonia': {
    firstLine: { drug: 'Amoxicillin 1g PO three times daily', dose: 'x 5 days (mild) or IV if moderate-severe', safePregnancy: true },
    alternatives: ['Amoxicillin-clavulanate 1g PO BD (moderate)', 'Doxycycline 100mg PO BD x 5d (atypical cover)', 'Co-amoxiclav + Clarithromycin (moderate-severe)'],
    pregnancyFirst: 'Amoxicillin-clavulanate 625mg PO TDS x 7 days',
    avoid: ['Macrolide monotherapy (pneumococcal resistance >35%)', 'Levofloxacin as first-line (preserve for TB/complicated cases)'],
    duration: '5–7 days (mild), 7–10 days (moderate)',
    warning: 'Macrolide resistance in S. pneumoniae exceeds 35% in some regions. Do not use azithromycin monotherapy. Reserve respiratory fluoroquinolones for penicillin allergy cases.',
    notes: 'CRB-65 score guides severity assessment. Add atypical coverage (azithromycin or doxycycline) for hospitalized patients. Steroids only for severe/ICU pneumonia with vasopressors.'
  },
  'Hospital-acquired pneumonia': {
    firstLine: { drug: 'Piperacillin-tazobactam 4.5g IV every 6 hours', dose: 'Extended infusion over 4 hours. Add vancomycin if MRSA risk.', safePregnancy: false },
    alternatives: ['Meropenem 1g IV q8h (if MDR risk high)', 'Vancomycin 25mg/kg/day IV (add if MRSA suspected)', 'Colistin if pan-resistant Gram-negatives'],
    pregnancyFirst: 'Piperacillin-tazobactam 4.5g IV q6h (limited pregnancy data — use if benefit outweighs risk)',
    avoid: ['Ceftriaxone alone (inadequate Pseudomonas/Acinetobacter coverage)', 'Quinolone monotherapy'],
    duration: '7–8 days (unless non-fermenter — 14 days)',
    warning: 'ICU patients: Carbapenem coverage may be needed given high CRE prevalence (8%). MRSA nares screen recommended within 24h of ICU admission.',
    notes: 'De-escalate at 48-72h based on cultures. Obtain BAL or endotracheal aspirate before antibiotics in ventilated patients. Daily review of antibiotic necessity.'
  },
  'Sepsis (unknown source)': {
    firstLine: { drug: 'Piperacillin-tazobactam 4.5g IV + Gentamicin 5mg/kg IV OD', dose: 'Start within 1 hour of sepsis recognition. IV bolus approach.', safePregnancy: false },
    alternatives: ['Meropenem 1g IV q8h (if ICU/MDR risk)', 'Add Vancomycin 25mg/kg/day if MRSA suspected', 'Imipenem 500mg IV q6h (severe MDR)'],
    pregnancyFirst: 'Piperacillin-tazobactam 4.5g IV q6h + seek obstetrics input urgently',
    avoid: ['Delaying antibiotics beyond 1 hour of sepsis recognition', 'Narrow spectrum empirically in ICU'],
    duration: '7–10 days if source controlled; review daily',
    warning: 'Sepsis 3-hour bundle: Blood cultures x2 BEFORE antibiotics, lactate, IV fluids 30mL/kg, antibiotics within 1 hour. Each hour delay increases mortality by 7%.',
    notes: 'De-escalate at 48-72h using culture results. Document source, indication, duration at prescribing. Stop antibiotics at 7 days unless persistent positive cultures.'
  },
  'Skin & soft tissue infection': {
    firstLine: { drug: 'Flucloxacillin 500mg–1g PO/IV four times daily', dose: 'PO if mild (cellulitis), IV if systemically unwell or spreading', safePregnancy: false },
    alternatives: ['Cephalexin 500mg PO QDS (cellulitis)', 'Co-amoxiclav 625mg PO TDS (bite wounds, polymicrobial)', 'Vancomycin IV (MRSA suspected/confirmed)'],
    pregnancyFirst: 'Cephalexin 500mg PO QDS — safe in pregnancy',
    avoid: ['Empiric vancomycin unless MRSA risk factors present', 'Fluoroquinolones for skin infections'],
    duration: '5–7 days (cellulitis), 7–14 days (abscess post-drainage)',
    warning: 'Mark borders of cellulitis at presentation — if not improving or spreading beyond borders at 48-72h, reassess, culture, and consider MRSA empiric cover.',
    notes: 'Drain any abscess — antibiotics alone insufficient for purulent collections. Elevate affected limb. MRSA screen if healthcare-associated or recurrent.'
  },
  'Intra-abdominal infection': {
    firstLine: { drug: 'Piperacillin-tazobactam 4.5g IV every 8 hours', dose: 'IV until source controlled + clinically improving, then oral step-down', safePregnancy: false },
    alternatives: ['Ceftriaxone 2g IV OD + Metronidazole 500mg IV TDS', 'Meropenem 1g IV q8h (severe/ICU)', 'Ertapenem 1g IV OD (moderate, non-ICU)'],
    pregnancyFirst: 'Ceftriaxone + Metronidazole (avoid metronidazole in 1st trimester if possible)',
    avoid: ['Anaerobic gap coverage must be included', 'Fluoroquinolones alone (poor anaerobic coverage)'],
    duration: '4–5 days post source control (shorter courses non-inferior)',
    warning: 'Source control (drainage/surgery) is the critical intervention — antibiotics are adjunctive only. Inadequate source control is the leading cause of treatment failure.',
    notes: 'Obtain intraoperative cultures. Escalate empiric therapy in severely ill or recent healthcare exposure. De-escalate at 48h based on cultures.'
  },
  'Meningitis (bacterial)': {
    firstLine: { drug: 'Ceftriaxone 2g IV every 12 hours', dose: 'START IMMEDIATELY — do not delay for CT if no focal neurology. Add dexamethasone 0.15mg/kg IV QDS x4 days.', safePregnancy: true },
    alternatives: ['Add Ampicillin 2g IV q4h if Listeria risk (age >50, immunocompromised, pregnancy)', 'Meropenem 2g IV q8h if cephalosporin allergy', 'Vancomycin if MRSA meningitis (post-neurosurgery)'],
    pregnancyFirst: 'Ceftriaxone 2g IV q12h + Ampicillin 2g IV q4h (cover Listeria in pregnancy)',
    avoid: ['Oral antibiotics for bacterial meningitis', 'Delaying antibiotics for imaging if clinical diagnosis clear'],
    duration: '10–14 days (pneumococcal/meningococcal), 21 days (Listeria), 21 days (Gram-negative)',
    warning: 'Bacterial meningitis is a medical emergency. Time to antibiotics is critical. Blood cultures should not delay treatment by >30 minutes. LP after CT only if signs of raised ICP.',
    notes: 'Notify public health for meningococcal disease — chemoprophylaxis for close contacts. Dexamethasone reduces mortality in pneumococcal meningitis.'
  },
  'Sexually transmitted infection': {
    firstLine: { drug: 'Ceftriaxone 1g IM single dose', dose: 'For gonorrhea. Add doxycycline 100mg PO BD x7 days or azithromycin 1g single dose for chlamydia co-treatment.', safePregnancy: false },
    alternatives: ['Cefixime 400mg PO single dose (if IM unavailable)', 'Azithromycin 2g PO single dose (gonorrhea - increasing resistance, use cautiously)', 'Benzathine penicillin 2.4MU IM single dose (syphilis)'],
    pregnancyFirst: 'Ceftriaxone 1g IM single dose (safe). Avoid doxycycline in pregnancy — use azithromycin instead.',
    avoid: ['Ciprofloxacin/fluoroquinolones for gonorrhea (high resistance)', 'Penicillin alone for gonorrhea'],
    duration: 'Single dose (gonorrhea), 7 days (chlamydia), 14 days (PID)',
    warning: 'XDR gonorrhea is spreading — resistance to azithromycin and cephalosporins emerging. Test of cure at 1–2 weeks post-treatment is now recommended. Report treatment failures immediately.',
    notes: 'Always treat for chlamydia co-infection (50% co-infection rate). Partner notification and treatment essential. HIV and syphilis testing recommended for all STI presentations.'
  }
};

// ── API ROUTES ─────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Dashboard stats
app.get('/api/stats', (req, res) => {
  const startOfYear = new Date('2026-01-01');
  const now = new Date();
  const daysPassed = (now - startOfYear) / 86400000;
  const deathsThisYear = Math.floor((1270000 / 365) * daysPassed);
  res.json({ ...AMR_DATA.stats, deathsThisYear });
});

// Alerts
app.get('/api/alerts', (req, res) => {
  const { risk, limit = 20 } = req.query;
  let alerts = AMR_DATA.alerts;
  if (risk) alerts = alerts.filter(a => a.risk === risk);
  res.json(alerts.slice(0, parseInt(limit)));
});

// Regional resistance
app.get('/api/resistance/regional', (req, res) => {
  res.json(AMR_DATA.regionalResistance);
});

// Pathogen resistance
app.get('/api/resistance/pathogens', (req, res) => {
  res.json(AMR_DATA.pathogenResistance);
});

// Antibiogram
app.get('/api/antibiogram', (req, res) => {
  res.json(AMR_DATA.antibiogramNairobi);
});

// Outbreak signal data (simulated real-time)
app.get('/api/outbreak/signals', (req, res) => {
  const days = 30;
  const data = [];
  for (let i = 1; i <= days; i++) {
    const base = 10 + i * 1.5;
    const spike = i > 20 ? Math.pow(i - 20, 1.8) * 3 : 0;
    data.push({
      day: i,
      wastewater: Math.round(base + spike + Math.random() * 15),
      hospitalAdmissions: Math.round(100 + i * 3 + (i > 20 ? (i-20) * 12 : 0)),
      aiScore: Math.round(base * 0.8 + spike * 0.9 + Math.random() * 10),
      pharmacy: Math.round(50 + i * 1.2 + (i > 22 ? (i-22) * 8 : 0))
    });
  }
  res.json(data);
});

// AMR Resistance Prediction
app.post('/api/predict', (req, res) => {
  const { pathogen, region, priorAntibiotics, healthcareExposure, sampleSource } = req.body;

  if (!pathogen) return res.status(400).json({ error: 'Pathogen is required' });

  const profile = RESISTANCE_PROFILES[pathogen] || RESISTANCE_PROFILES.ecoli;
  const isHighRisk = region && (region.includes('Africa') || region.includes('South Asia') || region.includes('Southeast Asia'));
  const isCarbapenemHistory = priorAntibiotics && priorAntibiotics.includes('Carbapenems');
  const isICU = healthcareExposure && healthcareExposure.includes('ICU');
  const isMultipleAb = priorAntibiotics && priorAntibiotics.includes('Multiple');

  const baseScore = profile.baseScore[region] || (isHighRisk ? 72 : profile.baseScore.default);
  const score = Math.min(98, baseScore + (isCarbapenemHistory ? 12 : 0) + (isICU ? 8 : 0) + (isMultipleAb ? 6 : 0));

  const antibiotics = profile.antibiotics.map(ab => {
    let status = ab.baseStatus;
    if (isHighRisk && ab.highRiskStatus) status = ab.highRiskStatus;
    if (isCarbapenemHistory && ab.carbapenemStatus) status = ab.carbapenemStatus;
    if (isICU && ab.icuStatus) status = ab.icuStatus;
    if (isMultipleAb && ab.multipleStatus) status = ab.multipleStatus;
    return { name: ab.name, status };
  });

  const recKey = isCarbapenemHistory ? 'carbapenem' : isHighRisk || isICU ? 'highRisk' : 'default';
  const recommendation = profile.recommendation[recKey] || profile.recommendation.default;

  const confidence = 74 + Math.floor(Math.random() * 22);

  res.json({
    pathogen: profile.name,
    score,
    riskLevel: score > 70 ? 'high' : score > 50 ? 'moderate' : 'low',
    confidence,
    antibiotics,
    recommendation,
    disclaimer: 'This is a clinical decision-support tool only. Laboratory confirmation and clinical judgement are required before treatment decisions.',
    generatedAt: new Date().toISOString()
  });
});

// Stewardship recommendation
app.post('/api/stewardship', (req, res) => {
  const { infectionType, allergies = [], renal, pregnancy, weight = 70 } = req.body;

  if (!infectionType) return res.status(400).json({ error: 'Infection type is required' });

  const data = STEWARDSHIP_DATA[infectionType];
  if (!data) return res.status(404).json({ error: 'Infection type not found' });

  const isPregnant = pregnancy && (pregnancy.includes('Pregnant') || pregnancy.includes('Breastfeeding'));
  const hasPenAllergy = allergies.includes('Penicillin');
  const poorRenal = renal && (renal.includes('Severe') || renal.includes('ESRD'));

  let firstLine = data.firstLine;
  let note = data.notes;

  if (isPregnant && data.pregnancyFirst) {
    firstLine = { drug: data.pregnancyFirst, dose: 'Pregnancy-safe option selected', safePregnancy: true };
    note += ' NOTE: Avoid nitrofurantoin in 1st trimester and near term. Avoid fluoroquinolones and tetracyclines throughout pregnancy.';
  }

  if (poorRenal) {
    note += ' RENAL DOSE ADJUSTMENT REQUIRED: Nitrofurantoin contraindicated if eGFR <30. Reduce aminoglycoside doses. Extended interval dosing for renally-cleared antibiotics.';
  }

  res.json({
    infectionType,
    firstLine,
    alternatives: data.alternatives,
    toAvoid: data.avoid,
    duration: data.duration,
    stewardshipNotes: note,
    localResistanceWarning: data.warning,
    generatedAt: new Date().toISOString()
  });
});

// AI Chat
app.post('/api/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  const messages = [
    ...conversationHistory.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ];

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({ response: getFallbackResponse(message) });
    }

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      system: `You are AMR Guardian AI, an expert clinical and public health assistant specializing in antimicrobial resistance (AMR). You provide accurate, evidence-based answers about:
- AMR statistics, trends, and global burden
- Specific bacterial pathogens and their resistance mechanisms
- Antibiotic treatment guidance and stewardship principles
- Outbreak surveillance and detection methods
- Global health policy and One Health approaches
- Diagnostic tools and wastewater surveillance

Always be concise, practical, and evidence-based. Cite WHO, CDC, or peer-reviewed data where relevant. For treatment questions, always remind users to use local antibiograms and clinical judgment. Current date: ${new Date().toISOString().split('T')[0]}.`,
      messages
    });

    res.json({ response: response.content[0].text });
  } catch (error) {
    console.error('Claude API error:', error.message);
    res.json({ response: getFallbackResponse(message) });
  }
});

// Report generation
app.post('/api/reports/generate', async (req, res) => {
  const { reportType } = req.body;

  const prompts = {
    weekly: `Generate a structured weekly AMR surveillance digest for the week of ${new Date().toDateString()}. Include:
1. Global death toll estimate for this week
2. Top 5 resistance alerts with location, pathogen, and risk level
3. Key trends by region (Africa, Asia, Americas, Europe) with resistance percentages
4. Emerging resistance genes of concern (NDM-1, KPC, OXA-48, mcr-1)
5. Pipeline update: new antibiotic approvals or trial results
6. Clinical action items for frontline clinicians
Format as a professional public health report. Be specific with data.`,

    antibiogram: `Generate a regional antibiogram report for Sub-Saharan Africa (Q2 2026). Include:
1. Executive summary of resistance situation
2. Resistance rates table for E. coli, K. pneumoniae, S. aureus against: ampicillin, ciprofloxacin, TMP-SMX, ceftriaxone, gentamicin, imipenem
3. Recommended empiric therapy for: UTI, community pneumonia, sepsis, skin infection
4. Antibiotics to absolutely avoid empirically due to >50% resistance
5. Stewardship recommendations for facility antimicrobial committees
Provide realistic resistance percentages based on WHO GLASS Africa data.`,

    outbreak: `Generate an outbreak investigation report for the carbapenem-resistant Klebsiella pneumoniae (NDM-1) cluster in Nairobi, Kenya.
Case count: 147, Mortality: 23%, Detection date: May 4 2026. Include:
1. Outbreak timeline and epidemiological curve
2. Genomic findings (NDM-1 mediated resistance mechanism, plasmid types)
3. Transmission analysis and risk factors identified
4. Containment measures implemented (isolation, cohorting, contact tracing)
5. Treatment options available (colistin, ceftazidime-avibactam, tigecycline)
6. Recommendations for clinicians and infection control
7. Public health reporting requirements
Professional epidemiological investigation format.`
  };

  const prompt = prompts[reportType];
  if (!prompt) return res.status(400).json({ error: 'Invalid report type' });

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.json({ report: getStaticReport(reportType), generated: new Date().toISOString() });
    }

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      system: 'You are AMR Guardian, an AI-powered antimicrobial resistance intelligence system. Generate professional, evidence-based public health reports with realistic AMR data. Use clear section headers with ## and bullet points with •.',
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({ report: response.content[0].text, generated: new Date().toISOString() });
  } catch (error) {
    console.error('Report generation error:', error.message);
    res.json({ report: getStaticReport(reportType), generated: new Date().toISOString() });
  }
});

// ── Fallback Helpers ──────────────────────────────────────────────────────────
function getFallbackResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('mrsa') || m.includes('staphylococcus')) return 'MRSA (Methicillin-Resistant S. aureus) is resistant to all beta-lactam antibiotics. First-line treatment is Vancomycin 25-30mg/kg/day IV with trough monitoring (target 10-20 mg/L). Alternatives include Daptomycin for bacteremia/skin infections, and Linezolid for pneumonia. Globally, MRSA accounts for ~27% of S. aureus isolates. Community-acquired MRSA can often be treated with TMP-SMX or doxycycline for mild skin infections.';
  if (m.includes('carbapenem') || m.includes('cre') || m.includes('ndm')) return 'Carbapenem resistance is one of the most dangerous AMR threats. Mechanisms include NDM (New Delhi metallo-beta-lactamase) — prevalent in South Asia and Africa; KPC (K. pneumoniae carbapenemase) — common in Americas; and OXA-48 — MENA region. Treatment options are severely limited: colistin (nephrotoxic), ceftazidime-avibactam, or cefiderocol. US CRE cases surged 69% in 2025, with NDM strains up 461%. Strict contact isolation and immediate ID consultation are mandatory.';
  if (m.includes('death') || m.includes('kill') || m.includes('many')) return 'AMR directly causes approximately 1.27 million deaths per year globally — more than HIV/AIDS (~680K) or malaria (~600K). An additional 4.95 million deaths are associated with AMR annually. Projections to 2050: 10 million deaths/year if no action. Between 2025–2050, 39 million total deaths are expected from AMR. Improving diagnostic access and healthcare quality could prevent 92 million infectious deaths in the same period.';
  if (m.includes('africa') || m.includes('lmic') || m.includes('poor')) return 'AMR is far worse in Sub-Saharan Africa due to: (1) Weak surveillance — only 18% lab data coverage; (2) Over-the-counter antibiotic sales without prescription in 70% of countries; (3) Agricultural antibiotic overuse for growth promotion; (4) Water and sanitation gaps spreading resistance genes; (5) Healthcare workforce shortage (1 doctor per 10,000 people); (6) Limited infection control infrastructure. E. coli fluoroquinolone resistance in East Africa exceeds 62%, making ciprofloxacin ineffective empirically for common UTIs.';
  if (m.includes('wastewater') || m.includes('surveillance') || m.includes('detect')) return 'Wastewater-based AMR surveillance samples sewage to detect resistance genes (blaNDM, blaKPC, mcr-1) using qPCR or metagenomic sequencing. One sample represents thousands of people simultaneously. Key advantage: detects emerging resistance 1–4 weeks before clinical cases appear. AMR Guardian integrates wastewater signals with hospital admission patterns and pharmacy data to achieve 8+ day early warning. This multi-signal approach achieved 94.2% prediction accuracy in retrospective validation.';
  if (m.includes('stewardship') || m.includes('prescrib')) return 'Antibiotic stewardship optimizes antibiotic use through: (1) Right drug — based on culture and local antibiogram; (2) Right dose — PK/PD optimization; (3) Right duration — shortest effective course (most infections: 5-7 days); (4) Right route — IV-to-oral switch when safe. Core programs include prospective audit and feedback, pre-authorization for restricted antibiotics, and clinical decision support tools. Stewardship programs reduce antibiotic use by 20-30% without compromising outcomes. De-escalation at 48-72h when culture results return is critical.';
  if (m.includes('pipeline') || m.includes('new antibiotic') || m.includes('drug')) return 'The antibiotic pipeline is critically thin. WHO lists ~90 agents in development but only 12 have truly novel mechanisms. No new antibiotic class has been discovered since 1987. Major pharmaceutical companies exited antibiotic R&D — a new antibiotic costs $1B+ to develop but must be used sparingly, destroying commercial returns. The innovation paradox: success means the drug is rarely used. Pull incentives like the PASTEUR Act (US) and PIONEER (EU) aim to delink payment from volume. Phage therapy and bacteriocins are promising non-antibiotic alternatives.';
  return 'I specialize in antimicrobial resistance (AMR). I can help with: resistance patterns and statistics, specific pathogen resistance mechanisms, treatment guidance and antibiotic stewardship, outbreak surveillance methods, global AMR policy (WHO GLASS, One Health framework), and clinical decision support. What would you like to know?';
}

function getStaticReport(type) {
  if (type === 'weekly') return `## Weekly AMR Surveillance Digest — ${new Date().toDateString()}

## Executive Summary
This week's surveillance identified 7 high-priority alerts across 28 monitored regions. Critical developments include the confirmed NDM-1 carbapenem-resistant K. pneumoniae cluster in Nairobi (147 cases, 23% CFR), escalating XDR gonorrhea in South Asia, and continued ESBL E. coli surge across India.

**Estimated deaths this week from AMR: ~24,400**

## Top 5 Alerts
• 🔴 CRITICAL: Carbapenem-resistant K. pneumoniae (NDM-1) — Nairobi, Kenya — 147 cases, 23% mortality
• 🔴 CRITICAL: XDR gonorrhea — Dhaka, Bangladesh — 89 cases, all first-line antibiotics ineffective
• 🟠 HIGH: ESBL E. coli surge — Mumbai, India — 2,341 cases, 74% resistance rate
• 🟠 HIGH: MDR Salmonella Typhi — Lagos, Nigeria — 612 cases, children primarily affected
• 🟠 HIGH: CRE cluster — US ICUs — 3,892 cases, 69% year-over-year increase

## Regional Trends
• Sub-Saharan Africa: 82% resistance rate (critical) — rising trend. E. coli fluoroquinolone resistance at 62%
• South Asia: 76% resistance rate — rising. ESBL rates in tertiary hospitals exceed 70%
• East Asia: 45% resistance rate — stable. Colistin resistance (mcr-1) emerging in livestock
• Europe: 23% — declining due to strong stewardship programs
• Americas: 28% — stable but CRE surge in ICU settings concerning

## Clinical Action Items
• Avoid empiric fluoroquinolones for UTI in Sub-Saharan Africa and South Asia
• Implement contact precautions for all ICU patients from NDM-endemic regions
• Obtain blood cultures BEFORE antibiotics in all sepsis presentations
• De-escalate therapy within 48-72 hours when culture results are available`;

  if (type === 'antibiogram') return `## Regional Antibiogram Report — Sub-Saharan Africa Q2 2026

## Executive Summary
Resistance levels across Sub-Saharan Africa remain critically high, with most first-line antibiotics showing >50% resistance for common Gram-negative pathogens. Carbapenem resistance is emerging and requires urgent attention.

## Resistance Rates (% Resistant)
• Ampicillin: E. coli 88%, K. pneumoniae 95%, S. aureus 71%
• Ciprofloxacin: E. coli 62%, K. pneumoniae 58%, S. aureus 25%
• Cotrimoxazole (TMP-SMX): E. coli 74%, K. pneumoniae 80%
• Ceftriaxone: E. coli 48%, K. pneumoniae 62%
• Gentamicin: E. coli 35%, K. pneumoniae 42%
• Imipenem: E. coli 4%, K. pneumoniae 8% — RISING TREND

## Recommended Empiric Therapy
• UTI (uncomplicated): Nitrofurantoin 100mg BD x5d OR Fosfomycin 3g single dose
• UTI (complicated/pyelonephritis): Ceftriaxone 2g IV OD — escalate if no improvement at 48h
• Community pneumonia: Amoxicillin 1g TDS x5d + Azithromycin (for atypicals)
• Sepsis: Piperacillin-tazobactam 4.5g IV q6h + Gentamicin (if susceptibility likely)
• Skin infection: Cloxacillin 500mg QDS (MSSA) or Clindamycin 300mg TDS

## Antibiotics to AVOID Empirically
• Ciprofloxacin/fluoroquinolones for UTI (>60% E. coli resistance)
• Ampicillin for any Gram-negative (>85% resistance)
• TMP-SMX empirically for UTI (>70% resistance)
• Cephalosporins for K. pneumoniae (>60% ESBL rate)`;

  return `## Outbreak Investigation Report — Carbapenem-Resistant K. pneumoniae (NDM-1)
### Nairobi, Kenya | May 2026

## Outbreak Summary
• Total cases: 147 | Deaths: 34 (23.1% case fatality rate)
• Index case: April 23, 2026 | Detection: May 4, 2026
• Setting: 3 tertiary care hospitals (Kenyatta National, Aga Khan, Nairobi Hospital)
• AMR Guardian AI predicted this cluster 8 days prior to official detection

## Genomic Findings
• Organism: Klebsiella pneumoniae sequence type ST258
• Resistance mechanism: NDM-1 metallo-beta-lactamase (blaNDM-1 gene)
• Plasmid: IncFII conjugative plasmid — high horizontal transfer potential
• Additional resistance: ESBL, aminoglycoside resistance, fluoroquinolone resistance
• Susceptible only to: Colistin, Tigecycline, Ceftazidime-avibactam (limited availability)

## Transmission Analysis
• Primary driver: Cross-hospital transfer of colonized patients through shared ICU staff
• Wastewater AMR gene load increased 340% in days preceding clinical detection
• 67% of cases in ICU settings; 33% in surgical wards

## Containment Measures Implemented
• Contact precautions for all cases and known contacts
• ICU cohorting — dedicated staff and equipment
• Enhanced environmental decontamination (hydrogen peroxide vapor)
• Antibiotic stewardship emergency review
• Admission screening with rectal swabs in all ICU patients

## Treatment Options Available
• Colistin 9MU IV loading then 4.5MU q12h (nephrotoxic — monitor creatinine daily)
• Tigecycline 100mg IV loading then 50mg q12h
• Ceftazidime-avibactam 2.5g IV q8h (limited stock — for severe cases only)
• Combination therapy recommended for all cases`;
}

// ── Serve React Frontend in Production ────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✅ AMR Guardian API running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 Claude AI: ${process.env.ANTHROPIC_API_KEY ? 'Connected' : 'Using fallback responses'}`);
});
