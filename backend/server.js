require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

async function callGemini(systemPrompt, userMessage, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const contents = [];
  for (const msg of history) {
    contents.push({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] });
  }
  contents.push({ role: 'user', parts: [{ text: userMessage }] });
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
  };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('Gemini API error: ' + res.status);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

const ADMIN_USER = process.env.ADMIN_USERNAME || 'amrguardian_admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'AMR@Guard2026!';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.static(path.join(__dirname, '../frontend/build')));

const AMR_DATA = {
  stats: { annualDeaths: 1270000, linkedDeaths: 4950000, projected2050: 10000000, diagnosticAccessGap: 47, countriesMonitored: 104, resistantInfectionRate: '1 in 6', utiResistanceRate: '1 in 3' },
  alerts: [
    { id: 1, date: '2026-05-04', location: 'Nairobi, Kenya', pathogen: 'K. pneumoniae', resistanceType: 'Carbapenem-resistant (NDM-1)', risk: 'critical', cases: 147, mortality: '23%', description: 'NDM-1 gene producing carbapenem-resistant Klebsiella pneumoniae spreading across 3 hospitals. AMR Guardian AI predicted this cluster 8 days prior from wastewater surveillance signals.', genomicConfidence: '97.3%' },
    { id: 2, date: '2026-05-03', location: 'Mumbai, India', pathogen: 'E. coli', resistanceType: 'ESBL-producing', risk: 'high', cases: 2341, mortality: '4%', description: 'Extended-spectrum beta-lactamase producing E. coli rates exceeding 74% across Mumbai tertiary hospitals. AI analysis flagging likely food system contamination vector.', genomicConfidence: '91.8%' },
    { id: 3, date: '2026-05-02', location: 'Dhaka, Bangladesh', pathogen: 'N. gonorrhoeae', resistanceType: 'XDR gonorrhea', risk: 'critical', cases: 89, mortality: '0.5%', description: 'Extensively drug-resistant Neisseria gonorrhoeae detected with resistance to all WHO-recommended first-line antibiotics. Mosaic penA gene confirmed.', genomicConfidence: '98.1%' },
    { id: 4, date: '2026-05-01', location: 'Lagos, Nigeria', pathogen: 'Salmonella Typhi', resistanceType: 'Fluoroquinolone-resistant MDR', risk: 'high', cases: 612, mortality: '3.2%', description: 'Multi-drug resistant typhoid fever. Fluoroquinolone resistance at 88%. Children under 5 primarily affected. Water contamination suspected.', genomicConfidence: '94.5%' },
    { id: 5, date: '2026-04-29', location: 'Jakarta, Indonesia', pathogen: 'S. aureus (MRSA)', resistanceType: 'Methicillin-resistant', risk: 'medium', cases: 331, mortality: '8%', description: 'Community-acquired MRSA rising. Livestock antibiotic overuse suspected as resistance driver based on geographic clustering.', genomicConfidence: '88.2%' },
    { id: 6, date: '2026-04-28', location: 'United States (nationwide)', pathogen: 'Enterobacteriaceae', resistanceType: 'Carbapenem-resistant (CRE)', risk: 'high', cases: 3892, mortality: '18%', description: 'CRE cases in US ICUs up 69% year-over-year. NDM strains increased 461%. AMR Guardian detected anomalous prescription patterns 3 weeks before official recognition.', genomicConfidence: '95.7%' },
    { id: 7, date: '2026-04-26', location: 'Tashkent, Uzbekistan', pathogen: 'M. tuberculosis', resistanceType: 'Pre-XDR TB', risk: 'medium', cases: 56, mortality: '15%', description: 'Pre-XDR tuberculosis cluster. AMR Guardian flagged anomalous treatment failure rates from 12 clinics. WHO Emergency Response Team notified.', genomicConfidence: '92.3%' }
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
    region: 'Nairobi / East Africa', updated: 'May 2026',
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

const RESISTANCE_PROFILES = {
  ecoli: { name: 'Escherichia coli', baseScore: { 'Sub-Saharan Africa': 78, 'South Asia': 75, 'Southeast Asia': 68, default: 42 }, antibiotics: [ { name: 'Ampicillin', baseStatus: 'resistant' }, { name: 'Ciprofloxacin', baseStatus: 'intermediate', highRiskStatus: 'resistant' }, { name: 'TMP-SMX', baseStatus: 'resistant' }, { name: 'Ceftriaxone', baseStatus: 'sensitive', priorCephStatus: 'resistant' }, { name: 'Gentamicin', baseStatus: 'sensitive' }, { name: 'Imipenem', baseStatus: 'sensitive', carbapenemStatus: 'resistant' }, { name: 'Nitrofurantoin', baseStatus: 'sensitive' }, { name: 'Fosfomycin', baseStatus: 'sensitive' }, { name: 'Pip-Tazo', baseStatus: 'sensitive', multipleStatus: 'intermediate' } ], recommendation: { default: 'Nitrofurantoin 100mg BD x5 days for UTI. For systemic: Piperacillin-tazobactam 4.5g IV q8h. Avoid fluoroquinolones empirically in this region due to >60% resistance rates.', highRisk: 'High resistance risk. Consider Imipenem-cilastatin 500mg IV q6h. If carbapenem-resistant, urgent ID consult — ceftazidime-avibactam combination therapy. Strict contact isolation required.', carbapenem: 'Possible carbapenem resistance. Consider colistin (last resort) with ID consult. Obtain urgent cultures. Implement immediate contact precautions.' } },
  kpneumo: { name: 'Klebsiella pneumoniae', baseScore: { 'Sub-Saharan Africa': 85, 'South Asia': 82, default: 55 }, antibiotics: [ { name: 'Ampicillin', baseStatus: 'resistant' }, { name: 'Ciprofloxacin', baseStatus: 'resistant' }, { name: 'Ceftriaxone', baseStatus: 'resistant' }, { name: 'Pip-Tazo', baseStatus: 'intermediate' }, { name: 'Imipenem', baseStatus: 'sensitive', carbapenemStatus: 'resistant' }, { name: 'Gentamicin', baseStatus: 'intermediate' }, { name: 'Colistin', baseStatus: 'sensitive' }, { name: 'Tigecycline', baseStatus: 'sensitive' }, { name: 'Ceftazidime-Avi', baseStatus: 'sensitive' } ], recommendation: { default: 'High suspicion for ESBL-producing K. pneumoniae. Empiric: Imipenem-cilastatin 500mg IV q6h. If carbapenem-resistant: ceftazidime-avibactam + aztreonam. Strict contact isolation.', highRisk: 'Critical resistance profile. Carbapenem-resistant Klebsiella suspected. Colistin 9MU loading then 4.5MU q12h. Combination therapy essential. Urgent ID consultation.', carbapenem: 'Carbapenem resistance confirmed. Ceftazidime-avibactam 2.5g IV q8h + aztreonam 2g IV q6h. Colistin if unavailable. Report as notifiable event.' } },
  saur: { name: 'Staphylococcus aureus', baseScore: { default: 45 }, antibiotics: [ { name: 'Oxacillin/Methicillin', baseStatus: 'intermediate', icuStatus: 'resistant' }, { name: 'Vancomycin', baseStatus: 'sensitive' }, { name: 'Daptomycin', baseStatus: 'sensitive' }, { name: 'Linezolid', baseStatus: 'sensitive' }, { name: 'TMP-SMX', baseStatus: 'sensitive' }, { name: 'Clindamycin', baseStatus: 'intermediate' }, { name: 'Rifampicin', baseStatus: 'sensitive' }, { name: 'Doxycycline', baseStatus: 'sensitive' }, { name: 'Cefazolin', baseStatus: 'sensitive', icuStatus: 'resistant' } ], recommendation: { default: 'Community MRSA possible. Empiric: Cefazolin 2g IV q8h or Flucloxacillin 2g IV q6h. Nasal MRSA screen recommended. Adjust based on culture results.', highRisk: 'ICU-acquired MRSA likely. Vancomycin 25-30mg/kg/day IV. Target trough 10-20mg/L. Echocardiogram if bacteremia. De-escalate if MSSA confirmed.', carbapenem: 'Suspect MRSA. Vancomycin 25-30mg/kg/day IV. Consider Daptomycin 6mg/kg IV OD for skin/soft tissue.' } },
  paerug: { name: 'Pseudomonas aeruginosa', baseScore: { default: 70 }, antibiotics: [ { name: 'Ampicillin', baseStatus: 'resistant' }, { name: 'Ciprofloxacin', baseStatus: 'intermediate' }, { name: 'Ceftazidime', baseStatus: 'sensitive' }, { name: 'Pip-Tazo', baseStatus: 'sensitive' }, { name: 'Imipenem', baseStatus: 'intermediate' }, { name: 'Meropenem', baseStatus: 'sensitive' }, { name: 'Gentamicin', baseStatus: 'intermediate' }, { name: 'Amikacin', baseStatus: 'sensitive' }, { name: 'Colistin', baseStatus: 'sensitive' } ], recommendation: { default: 'Piperacillin-tazobactam 4.5g IV q6h (extended 4h infusion) + Amikacin 15-20mg/kg IV q24h. Meropenem 2g IV q8h for MDR. Prolonged courses often required.', highRisk: 'MDR Pseudomonas. Dual anti-pseudomonal therapy essential. Meropenem 2g IV q8h + Amikacin 20mg/kg IV OD. Consider colistin for XDR.', carbapenem: 'Carbapenem-resistant Pseudomonas. Colistin + Rifampicin combination. Ceftolozane-tazobactam 3g IV q8h if available.' } },
  abau: { name: 'Acinetobacter baumannii', baseScore: { 'Sub-Saharan Africa': 88, 'South Asia': 84, default: 65 }, antibiotics: [ { name: 'Ampicillin', baseStatus: 'resistant' }, { name: 'Ciprofloxacin', baseStatus: 'resistant' }, { name: 'Ceftriaxone', baseStatus: 'resistant' }, { name: 'Meropenem', baseStatus: 'intermediate', highRiskStatus: 'resistant' }, { name: 'Pip-Tazo', baseStatus: 'resistant' }, { name: 'Gentamicin', baseStatus: 'resistant' }, { name: 'Amikacin', baseStatus: 'intermediate' }, { name: 'Colistin', baseStatus: 'sensitive' }, { name: 'Tigecycline', baseStatus: 'sensitive' } ], recommendation: { default: 'Carbapenem-resistant A. baumannii common. Colistin 9MU loading then 4.5MU IV q12h. Combine with rifampicin 600mg OD or tigecycline. All contacts require strict isolation.', highRisk: 'XDR Acinetobacter. Colistin + Tigecycline + Carbapenem triple therapy. Urgent ID consultation required.', carbapenem: 'Pandrug-resistant Acinetobacter suspected. Cefiderocol if available. Colistin backbone with combination partner.' } }
};

const STEWARDSHIP_DATA = {
  'Urinary Tract Infection (uncomplicated)': { firstLine: { drug: 'Nitrofurantoin 100mg modified-release', dose: 'PO twice daily x 5 days', safePregnancy: false }, alternatives: ['Fosfomycin 3g PO single dose', 'Pivmecillinam 400mg PO BD x 3-7 days', 'Trimethoprim 200mg PO BD x 7 days (if local resistance <20%)'], pregnancyFirst: 'Cephalexin 500mg PO four times daily x 7 days', avoid: ['Ciprofloxacin (resistance >60% locally)', 'TMP-SMX (resistance >70% in this region)', 'Ampicillin (resistance >85%)'], duration: '5-7 days', warning: 'E. coli fluoroquinolone resistance in East Africa exceeds 62%. Ciprofloxacin should NOT be used empirically for UTI in this region.', notes: 'Reserve fluoroquinolones for complicated UTI. Check eGFR before nitrofurantoin (avoid if eGFR <30).' },
  'Urinary Tract Infection (complicated/pyelonephritis)': { firstLine: { drug: 'Ceftriaxone 1-2g IV once daily', dose: 'IV until afebrile 24-48h, then oral step-down', safePregnancy: true }, alternatives: ['Amoxicillin-clavulanate 1g PO BD (oral step-down)', 'Ciprofloxacin 500mg PO BD (if susceptible on culture)', 'Gentamicin 5mg/kg IV OD (short course)'], pregnancyFirst: 'Ceftriaxone 2g IV OD (safe in pregnancy)', avoid: ['TMP-SMX empirically', 'Fluoroquinolones empirically in this region'], duration: '10-14 days total', warning: 'ESBL E. coli prevalence is high in this region. If clinical deterioration on ceftriaxone, escalate to imipenem and obtain urgent cultures.', notes: 'Obtain midstream urine culture BEFORE antibiotics. Blood cultures if systemically unwell.' },
  'Community-acquired pneumonia': { firstLine: { drug: 'Amoxicillin 1g PO three times daily', dose: 'x 5 days (mild) or IV if moderate-severe', safePregnancy: true }, alternatives: ['Amoxicillin-clavulanate 1g PO BD (moderate)', 'Doxycycline 100mg PO BD x 5d (atypical cover)', 'Co-amoxiclav + Clarithromycin (moderate-severe)'], pregnancyFirst: 'Amoxicillin-clavulanate 625mg PO TDS x 7 days', avoid: ['Macrolide monotherapy (pneumococcal resistance >35%)', 'Levofloxacin as first-line (preserve for TB/complicated cases)'], duration: '5-7 days (mild), 7-10 days (moderate)', warning: 'Macrolide resistance in S. pneumoniae exceeds 35% in some regions. Do not use azithromycin monotherapy.', notes: 'CRB-65 score guides severity. Add atypical coverage for hospitalized patients.' },
  'Hospital-acquired pneumonia': { firstLine: { drug: 'Piperacillin-tazobactam 4.5g IV every 6 hours', dose: 'Extended infusion over 4 hours. Add vancomycin if MRSA risk.', safePregnancy: false }, alternatives: ['Meropenem 1g IV q8h (if MDR risk high)', 'Vancomycin 25mg/kg/day IV (add if MRSA suspected)', 'Colistin if pan-resistant Gram-negatives'], pregnancyFirst: 'Piperacillin-tazobactam 4.5g IV q6h', avoid: ['Ceftriaxone alone (inadequate Pseudomonas coverage)', 'Quinolone monotherapy'], duration: '7-8 days', warning: 'ICU patients: Carbapenem coverage may be needed given high CRE prevalence.', notes: 'De-escalate at 48-72h based on cultures. Obtain BAL before antibiotics in ventilated patients.' },
  'Sepsis (unknown source)': { firstLine: { drug: 'Piperacillin-tazobactam 4.5g IV + Gentamicin 5mg/kg IV OD', dose: 'Start within 1 hour of sepsis recognition.', safePregnancy: false }, alternatives: ['Meropenem 1g IV q8h (if ICU/MDR risk)', 'Add Vancomycin 25mg/kg/day if MRSA suspected', 'Imipenem 500mg IV q6h (severe MDR)'], pregnancyFirst: 'Piperacillin-tazobactam 4.5g IV q6h + seek obstetrics input urgently', avoid: ['Delaying antibiotics beyond 1 hour', 'Narrow spectrum empirically in ICU'], duration: '7-10 days if source controlled; review daily', warning: 'Sepsis 3-hour bundle: Blood cultures x2 BEFORE antibiotics, lactate, IV fluids 30mL/kg, antibiotics within 1 hour. Each hour delay increases mortality by 7%.', notes: 'De-escalate at 48-72h using culture results. Document source, indication, duration at prescribing.' },
  'Skin & soft tissue infection': { firstLine: { drug: 'Flucloxacillin 500mg-1g PO/IV four times daily', dose: 'PO if mild cellulitis, IV if systemically unwell or spreading', safePregnancy: false }, alternatives: ['Cephalexin 500mg PO QDS (cellulitis)', 'Co-amoxiclav 625mg PO TDS (bite wounds)', 'Vancomycin IV (MRSA suspected/confirmed)'], pregnancyFirst: 'Cephalexin 500mg PO QDS - safe in pregnancy', avoid: ['Empiric vancomycin unless MRSA risk factors present', 'Fluoroquinolones for skin infections'], duration: '5-7 days (cellulitis), 7-14 days (abscess post-drainage)', warning: 'Mark borders of cellulitis at presentation - if not improving at 48-72h, reassess and consider MRSA empiric cover.', notes: 'Drain any abscess - antibiotics alone insufficient for purulent collections. Elevate affected limb.' },
  'Intra-abdominal infection': { firstLine: { drug: 'Piperacillin-tazobactam 4.5g IV every 8 hours', dose: 'IV until source controlled + clinically improving, then oral step-down', safePregnancy: false }, alternatives: ['Ceftriaxone 2g IV OD + Metronidazole 500mg IV TDS', 'Meropenem 1g IV q8h (severe/ICU)', 'Ertapenem 1g IV OD (moderate, non-ICU)'], pregnancyFirst: 'Ceftriaxone + Metronidazole (avoid metronidazole in 1st trimester if possible)', avoid: ['Missing anaerobic coverage', 'Fluoroquinolones alone (poor anaerobic coverage)'], duration: '4-5 days post source control', warning: 'Source control (drainage/surgery) is the critical intervention - antibiotics are adjunctive only.', notes: 'Obtain intraoperative cultures. Escalate empiric therapy in severely ill or recent healthcare exposure.' },
  'Meningitis (bacterial)': { firstLine: { drug: 'Ceftriaxone 2g IV every 12 hours', dose: 'START IMMEDIATELY. Add dexamethasone 0.15mg/kg IV QDS x4 days.', safePregnancy: true }, alternatives: ['Add Ampicillin 2g IV q4h if Listeria risk (age >50, immunocompromised, pregnancy)', 'Meropenem 2g IV q8h if cephalosporin allergy', 'Vancomycin if MRSA meningitis (post-neurosurgery)'], pregnancyFirst: 'Ceftriaxone 2g IV q12h + Ampicillin 2g IV q4h (cover Listeria in pregnancy)', avoid: ['Oral antibiotics for bacterial meningitis', 'Delaying antibiotics for imaging if clinical diagnosis clear'], duration: '10-14 days (pneumococcal/meningococcal), 21 days (Listeria)', warning: 'Bacterial meningitis is a medical emergency. Time to antibiotics is critical.', notes: 'Notify public health for meningococcal disease. Dexamethasone reduces mortality in pneumococcal meningitis.' },
  'Sexually transmitted infection': { firstLine: { drug: 'Ceftriaxone 1g IM single dose', dose: 'For gonorrhea. Add doxycycline 100mg PO BD x7 days for chlamydia co-treatment.', safePregnancy: false }, alternatives: ['Cefixime 400mg PO single dose (if IM unavailable)', 'Benzathine penicillin 2.4MU IM single dose (syphilis)', 'Azithromycin 1g single dose (chlamydia only)'], pregnancyFirst: 'Ceftriaxone 1g IM single dose. Avoid doxycycline - use azithromycin instead.', avoid: ['Ciprofloxacin/fluoroquinolones for gonorrhea (high resistance)', 'Penicillin alone for gonorrhea'], duration: 'Single dose (gonorrhea), 7 days (chlamydia), 14 days (PID)', warning: 'XDR gonorrhea is spreading - resistance to azithromycin and cephalosporins emerging. Test of cure at 1-2 weeks post-treatment now recommended.', notes: 'Always treat for chlamydia co-infection. Partner notification and treatment essential.' }
};

function getFallbackResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('mrsa') || m.includes('staphylococcus')) return 'MRSA is resistant to all beta-lactam antibiotics. First-line treatment is Vancomycin 25-30mg/kg/day IV with trough monitoring (target 10-20mg/L). Alternatives include Daptomycin for bacteremia/skin infections, and Linezolid for pneumonia. Globally, MRSA accounts for ~27% of S. aureus isolates.';
  if (m.includes('carbapenem') || m.includes('cre') || m.includes('ndm')) return 'Carbapenem resistance is one of the most dangerous AMR threats. Mechanisms include NDM (prevalent in South Asia and Africa), KPC (common in Americas), and OXA-48 (MENA region). Treatment options are severely limited: colistin, ceftazidime-avibactam, or cefiderocol. US CRE cases surged 69% in 2025.';
  if (m.includes('death') || m.includes('kill') || m.includes('many')) return 'AMR directly causes approximately 1.27 million deaths per year globally - more than HIV/AIDS (~680K) or malaria (~600K). An additional 4.95 million deaths are associated with AMR annually. Projections to 2050: 10 million deaths/year. Between 2025-2050, 39 million total deaths are expected.';
  if (m.includes('africa') || m.includes('lmic')) return 'AMR is far worse in Sub-Saharan Africa due to: weak surveillance (only 18% lab data coverage), over-the-counter antibiotic sales without prescription in 70% of countries, agricultural antibiotic overuse, water and sanitation gaps, and healthcare workforce shortage (1 doctor per 10,000 people). E. coli fluoroquinolone resistance in East Africa exceeds 62%.';
  if (m.includes('wastewater') || m.includes('surveillance')) return 'Wastewater-based AMR surveillance samples sewage to detect resistance genes (blaNDM, blaKPC, mcr-1) using qPCR or metagenomic sequencing. One sample represents thousands of people simultaneously. Key advantage: detects emerging resistance 1-4 weeks before clinical cases appear. AMR Guardian integrates wastewater signals with hospital and pharmacy data to achieve 8+ day early warning.';
  if (m.includes('stewardship') || m.includes('prescrib')) return 'Antibiotic stewardship optimizes antibiotic use through: right drug (based on culture and local antibiogram), right dose (PK/PD optimization), right duration (shortest effective course - most infections 5-7 days), right route (IV-to-oral switch when safe). Stewardship programs reduce antibiotic use by 20-30% without compromising outcomes.';
  if (m.includes('pipeline') || m.includes('new antibiotic')) return 'The antibiotic pipeline is critically thin. WHO lists ~90 agents in development but only 12 have truly novel mechanisms. No new antibiotic class has been discovered since 1987. Major pharmaceutical companies have largely exited antibiotic R&D due to poor commercial returns.';
  return 'I specialize in antimicrobial resistance (AMR). I can help with: resistance patterns and statistics, specific pathogen resistance mechanisms, treatment guidance and antibiotic stewardship, outbreak surveillance methods, and global AMR policy. What would you like to know?';
}

function getStaticReport(type) {
  if (type === 'weekly') return '## Weekly AMR Surveillance Digest\n\n## Executive Summary\nThis week\'s surveillance identified 7 high-priority alerts. Critical developments include the confirmed NDM-1 carbapenem-resistant K. pneumoniae cluster in Nairobi (147 cases, 23% CFR), escalating XDR gonorrhea in South Asia, and continued ESBL E. coli surge across India.\n\n**Estimated deaths this week from AMR: ~24,400**\n\n## Top 5 Alerts\n• CRITICAL: Carbapenem-resistant K. pneumoniae (NDM-1) - Nairobi, Kenya - 147 cases, 23% mortality\n• CRITICAL: XDR gonorrhea - Dhaka, Bangladesh - 89 cases, all first-line antibiotics ineffective\n• HIGH: ESBL E. coli surge - Mumbai, India - 2,341 cases, 74% resistance rate\n• HIGH: MDR Salmonella Typhi - Lagos, Nigeria - 612 cases, children primarily affected\n• HIGH: CRE cluster - US ICUs - 3,892 cases, 69% year-over-year increase\n\n## Clinical Action Items\n• Avoid empiric fluoroquinolones for UTI in Sub-Saharan Africa and South Asia\n• Implement contact precautions for all ICU patients from NDM-endemic regions\n• Obtain blood cultures BEFORE antibiotics in all sepsis presentations';
  if (type === 'antibiogram') return '## Regional Antibiogram Report - Sub-Saharan Africa Q2 2026\n\n## Resistance Rates (% Resistant)\n• Ampicillin: E. coli 88%, K. pneumoniae 95%, S. aureus 71%\n• Ciprofloxacin: E. coli 62%, K. pneumoniae 58%, S. aureus 25%\n• Cotrimoxazole: E. coli 74%, K. pneumoniae 80%\n• Ceftriaxone: E. coli 48%, K. pneumoniae 62%\n• Gentamicin: E. coli 35%, K. pneumoniae 42%\n• Imipenem: E. coli 4%, K. pneumoniae 8% - RISING TREND\n\n## Recommended Empiric Therapy\n• UTI (uncomplicated): Nitrofurantoin 100mg BD x5d OR Fosfomycin 3g single dose\n• Pyelonephritis: Ceftriaxone 2g IV OD\n• Community pneumonia: Amoxicillin 1g TDS x5d\n• Sepsis: Piperacillin-tazobactam 4.5g IV q6h + Gentamicin\n\n## Antibiotics to AVOID\n• Ciprofloxacin/fluoroquinolones for UTI (>60% resistance)\n• Ampicillin for any Gram-negative (>85% resistance)\n• TMP-SMX empirically for UTI (>70% resistance)';
  return '## Outbreak Investigation Report - Carbapenem-Resistant K. pneumoniae (NDM-1)\n### Nairobi, Kenya | May 2026\n\n## Outbreak Summary\n• Total cases: 147 | Deaths: 34 (23.1% CFR)\n• Detection: May 4, 2026 | AMR Guardian predicted 8 days prior\n• Setting: 3 tertiary care hospitals in Nairobi\n\n## Genomic Findings\n• Organism: K. pneumoniae sequence type ST258\n• Resistance: NDM-1 metallo-beta-lactamase (blaNDM-1 gene)\n• Plasmid: IncFII conjugative - high horizontal transfer potential\n• Susceptible only to: Colistin, Tigecycline, Ceftazidime-avibactam\n\n## Containment Measures\n• Contact precautions for all cases and contacts\n• ICU cohorting with dedicated staff and equipment\n• Enhanced environmental decontamination\n• Admission screening with rectal swabs in all ICU patients\n\n## Treatment Options\n• Colistin 9MU IV loading then 4.5MU q12h\n• Tigecycline 100mg IV loading then 50mg q12h\n• Ceftazidime-avibactam 2.5g IV q8h (limited stock)';
}

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0', aiProvider: process.env.GEMINI_API_KEY ? 'gemini' : 'fallback' }));

app.get('/api/stats', (req, res) => {
  const daysPassed = (new Date() - new Date('2026-01-01')) / 86400000;
  res.json({ ...AMR_DATA.stats, deathsThisYear: Math.floor((1270000 / 365) * daysPassed) });
});

app.get('/api/alerts', (req, res) => {
  const { risk, limit = 20 } = req.query;
  let alerts = AMR_DATA.alerts;
  if (risk) alerts = alerts.filter(a => a.risk === risk);
  res.json(alerts.slice(0, parseInt(limit)));
});

app.get('/api/resistance/regional', (req, res) => res.json(AMR_DATA.regionalResistance));
app.get('/api/resistance/pathogens', (req, res) => res.json(AMR_DATA.pathogenResistance));
app.get('/api/antibiogram', (req, res) => res.json(AMR_DATA.antibiogramNairobi));

app.get('/api/outbreak/signals', (req, res) => {
  const data = [];
  for (let i = 1; i <= 30; i++) {
    const base = 10 + i * 1.5;
    const spike = i > 20 ? Math.pow(i - 20, 1.8) * 3 : 0;
    data.push({ day: i, wastewater: Math.round(base + spike + Math.random() * 15), hospitalAdmissions: Math.round(100 + i * 3 + (i > 20 ? (i - 20) * 12 : 0)), aiScore: Math.round(base * 0.8 + spike * 0.9 + Math.random() * 10), pharmacy: Math.round(50 + i * 1.2 + (i > 22 ? (i - 22) * 8 : 0)) });
  }
  res.json(data);
});

app.post('/api/predict', (req, res) => {
  const { pathogen, region, priorAntibiotics, healthcareExposure } = req.body;
  if (!pathogen) return res.status(400).json({ error: 'Pathogen is required' });
  const profile = RESISTANCE_PROFILES[pathogen] || RESISTANCE_PROFILES.ecoli;
  const isHighRisk = region && (region.includes('Africa') || region.includes('South Asia') || region.includes('Southeast Asia'));
  const isCarbapenem = priorAntibiotics && priorAntibiotics.includes('Carbapenems');
  const isICU = healthcareExposure && healthcareExposure.includes('ICU');
  const isMultiple = priorAntibiotics && priorAntibiotics.includes('Multiple');
  const baseScore = profile.baseScore[region] || (isHighRisk ? 72 : profile.baseScore.default);
  const score = Math.min(98, baseScore + (isCarbapenem ? 12 : 0) + (isICU ? 8 : 0) + (isMultiple ? 6 : 0));
  const antibiotics = profile.antibiotics.map(ab => {
    let status = ab.baseStatus;
    if (isHighRisk && ab.highRiskStatus) status = ab.highRiskStatus;
    if (isCarbapenem && ab.carbapenemStatus) status = ab.carbapenemStatus;
    if (isICU && ab.icuStatus) status = ab.icuStatus;
    if (isMultiple && ab.multipleStatus) status = ab.multipleStatus;
    return { name: ab.name, status };
  });
  const recKey = isCarbapenem ? 'carbapenem' : (isHighRisk || isICU) ? 'highRisk' : 'default';
  res.json({ pathogen: profile.name, score, riskLevel: score > 70 ? 'high' : score > 50 ? 'moderate' : 'low', confidence: 74 + Math.floor(Math.random() * 22), antibiotics, recommendation: profile.recommendation[recKey] || profile.recommendation.default, disclaimer: 'Clinical decision-support tool only. Laboratory confirmation and clinical judgement required before treatment decisions.', generatedAt: new Date().toISOString() });
});

app.post('/api/stewardship', (req, res) => {
  const { infectionType, allergies = [], renal, pregnancy } = req.body;
  if (!infectionType) return res.status(400).json({ error: 'Infection type is required' });
  const data = STEWARDSHIP_DATA[infectionType];
  if (!data) return res.status(404).json({ error: 'Infection type not found' });
  const isPregnant = pregnancy && (pregnancy.includes('Pregnant') || pregnancy.includes('Breastfeeding'));
  const poorRenal = renal && (renal.includes('Severe') || renal.includes('ESRD'));
  let firstLine = data.firstLine;
  let note = data.notes;
  if (isPregnant && data.pregnancyFirst) { firstLine = { drug: data.pregnancyFirst, dose: 'Pregnancy-safe option selected', safePregnancy: true }; note += ' NOTE: Avoid nitrofurantoin in 1st trimester. Avoid fluoroquinolones and tetracyclines throughout pregnancy.'; }
  if (poorRenal) note += ' RENAL DOSE ADJUSTMENT REQUIRED: Nitrofurantoin contraindicated if eGFR <30. Reduce aminoglycoside doses.';
  res.json({ infectionType, firstLine, alternatives: data.alternatives, toAvoid: data.avoid, duration: data.duration, stewardshipNotes: note, localResistanceWarning: data.warning, generatedAt: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });
  const systemPrompt = `You are AMR Guardian AI, an expert clinical and public health assistant specializing in antimicrobial resistance (AMR). Provide accurate, evidence-based answers about AMR statistics, pathogen resistance mechanisms, antibiotic treatment guidance, stewardship principles, outbreak surveillance, and global health policy. Be concise and practical. Current date: ${new Date().toISOString().split('T')[0]}.`;
  try {
    const response = await callGemini(systemPrompt, message, conversationHistory.slice(-10));
    if (response) return res.json({ response });
    res.json({ response: getFallbackResponse(message) });
  } catch (error) {
    console.error('Gemini error:', error.message);
    res.json({ response: getFallbackResponse(message) });
  }
});

app.post('/api/reports/generate', async (req, res) => {
  const { reportType } = req.body;
  const prompts = {
    weekly: 'Generate a structured weekly AMR surveillance digest. Include: global death toll estimate, top 5 resistance alerts with location/pathogen/risk level, key regional trends with resistance percentages, emerging resistance genes (NDM-1, KPC, OXA-48, mcr-1), and clinical action items for frontline clinicians. Use ## for headers and bullet points with bullet symbol.',
    antibiogram: 'Generate a regional antibiogram report for Sub-Saharan Africa Q2 2026. Include: executive summary, resistance rates for E. coli/K. pneumoniae/S. aureus against common antibiotics with realistic percentages, recommended empiric therapy for UTI/pneumonia/sepsis/skin infections, antibiotics to avoid empirically, and stewardship recommendations. Use ## for headers.',
    outbreak: 'Generate an outbreak investigation report for carbapenem-resistant Klebsiella pneumoniae (NDM-1) in Nairobi, Kenya. Cases: 147, Mortality: 23%, Detected: May 4 2026. Include: outbreak timeline, genomic findings (NDM-1 mechanism), transmission analysis, containment measures, treatment options (colistin/ceftazidime-avibactam/tigecycline), and clinician recommendations. Use ## for headers.'
  };
  if (!prompts[reportType]) return res.status(400).json({ error: 'Invalid report type' });
  try {
    const response = await callGemini('You are AMR Guardian, an AI-powered AMR intelligence system. Generate professional, evidence-based public health reports with realistic AMR data. Use ## for section headers and bullet symbol for bullet points.', prompts[reportType]);
    if (response) return res.json({ report: response, generated: new Date().toISOString() });
    res.json({ report: getStaticReport(reportType), generated: new Date().toISOString() });
  } catch (error) {
    res.json({ report: getStaticReport(reportType), generated: new Date().toISOString() });
  }
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true, token: Buffer.from(username + ':' + Date.now()).toString('base64'), message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Admin Overview
app.get('/api/admin/overview', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  res.json({
    summary: { totalAlerts: AMR_DATA.alerts.length, criticalAlerts: AMR_DATA.alerts.filter(a => a.risk === 'critical').length, highAlerts: AMR_DATA.alerts.filter(a => a.risk === 'high').length, countriesMonitored: 104, apiStatus: process.env.GEMINI_API_KEY ? 'Gemini Connected' : 'Fallback Mode', lastUpdated: new Date().toISOString() },
    alerts: AMR_DATA.alerts,
    regionalResistance: AMR_DATA.regionalResistance,
    systemHealth: { uptime: process.uptime(), memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), nodeVersion: process.version, environment: process.env.NODE_ENV || 'development' }
  });
});

// Admin Panel
app.get('/admin', (req, res) => {
  res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>AMR Guardian Admin</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0c10;color:#e8eaf0;font-family:'DM Sans',sans-serif;font-size:14px;min-height:100vh;display:flex;align-items:center;justify-content:center}.login-box{background:#1c212d;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:36px;width:380px}.logo{display:flex;align-items:center;gap:10px;margin-bottom:28px}.logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#00d4a0,#4a9eff);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px}.logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:16px}.logo-sub{font-size:10px;color:#8891a8;letter-spacing:1px;text-transform:uppercase}h2{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;margin-bottom:6px}.sub{font-size:12px;color:#8891a8;margin-bottom:24px}.form-group{margin-bottom:16px}label{display:block;font-size:11px;color:#8891a8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;font-family:'DM Mono',monospace}input{width:100%;background:#111318;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:10px 14px;color:#e8eaf0;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;transition:border-color 0.2s}input:focus{border-color:#00d4a0}.btn{width:100%;background:#00d4a0;color:#000;border:none;border-radius:8px;padding:11px;font-size:13px;font-weight:600;cursor:pointer;margin-top:8px;transition:opacity 0.2s}.btn:hover{opacity:0.85}.btn:disabled{opacity:0.5;cursor:not-allowed}.error{background:rgba(255,71,87,0.12);border:1px solid rgba(255,71,87,0.25);color:#ff6b7a;border-radius:8px;padding:10px 14px;font-size:12px;margin-bottom:14px;display:none}.dash-wrap{display:none;width:100%;min-height:100vh;flex-direction:column}.dash-header{display:flex;align-items:center;justify-content:space-between;padding:18px 28px;background:#111318;border-bottom:1px solid rgba(255,255,255,0.07)}.dash-body{padding:28px;max-width:1100px;margin:0 auto;width:100%}.grid{display:grid;gap:16px}.g4{grid-template-columns:repeat(4,1fr)}.g2{grid-template-columns:1fr 1fr}.card{background:#1c212d;border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px;margin-bottom:0}.card-label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8891a8;font-family:'DM Mono',monospace;margin-bottom:8px}.card-value{font-family:'Syne',sans-serif;font-size:26px;font-weight:700;line-height:1}.section-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:600;margin-bottom:14px}table{width:100%;border-collapse:collapse;font-size:13px}th{text-align:left;padding:10px 14px;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#8891a8;font-family:'DM Mono',monospace;font-weight:400;border-bottom:1px solid rgba(255,255,255,0.07)}td{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,0.04)}tr:last-child td{border-bottom:none}.badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:4px;font-size:11px;font-family:'DM Mono',monospace}.bc{background:rgba(255,71,87,0.15);color:#ff6b7a;border:1px solid rgba(255,71,87,0.2)}.bh{background:rgba(255,140,66,0.15);color:#ffaa77;border:1px solid rgba(255,140,66,0.2)}.bm{background:rgba(255,209,102,0.15);color:#ffd166;border:1px solid rgba(255,209,102,0.2)}.stat-ok{color:#00d4a0}.stat-warn{color:#ffd166}.mono{font-family:'DM Mono',monospace;font-size:12px;color:#8891a8}.logout-btn{background:transparent;color:#8891a8;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:7px 16px;font-size:12px;cursor:pointer}.logout-btn:hover{color:#e8eaf0}@media(max-width:800px){.g4{grid-template-columns:1fr 1fr}.g2{grid-template-columns:1fr}.dash-body{padding:16px}}</style></head><body><div id="lp"><div class="login-box"><div class="logo"><div class="logo-icon">🧬</div><div><div class="logo-text">AMR Guardian</div><div class="logo-sub">Admin Panel</div></div></div><h2>Administrator Login</h2><p class="sub">Restricted access — authorised personnel only</p><div class="error" id="err"></div><div class="form-group"><label>Username</label><input type="text" id="un" placeholder="Enter username" autocomplete="username"/></div><div class="form-group"><label>Password</label><input type="password" id="pw" placeholder="Enter password" autocomplete="current-password" onkeydown="if(event.key==='Enter')login()"/></div><button class="btn" id="lb" onclick="login()">Sign In</button></div></div><div id="dp" class="dash-wrap"><div class="dash-header"><div class="logo"><div class="logo-icon">🧬</div><div><div class="logo-text">AMR Guardian</div><div class="logo-sub">Admin Dashboard</div></div></div><button class="logout-btn" onclick="logout()">Sign Out</button></div><div class="dash-body"><div class="grid g4" style="margin-bottom:20px" id="sc"></div><div class="grid g2" style="margin-bottom:20px"><div class="card"><div class="section-title">System Health</div><div id="sh"></div></div><div class="card"><div class="section-title">Regional Resistance</div><div id="rt"></div></div></div><div class="card"><div class="section-title">All Active AMR Alerts</div><table><thead><tr><th>Date</th><th>Location</th><th>Pathogen</th><th>Resistance Type</th><th>Risk</th><th>Cases</th><th>Mortality</th></tr></thead><tbody id="at"></tbody></table></div></div></div><script>let tk=null;async function login(){const u=document.getElementById('un').value.trim(),p=document.getElementById('pw').value,b=document.getElementById('lb'),e=document.getElementById('err');if(!u||!p){e.textContent='Please enter both username and password.';e.style.display='block';return;}b.disabled=true;b.textContent='Signing in...';e.style.display='none';try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});const d=await r.json();if(d.success){tk=d.token;document.getElementById('lp').style.display='none';document.getElementById('dp').style.display='flex';loadDash();}else{e.textContent='Invalid username or password.';e.style.display='block';}}catch(ex){e.textContent='Connection error. Please try again.';e.style.display='block';}finally{b.disabled=false;b.textContent='Sign In';}}function logout(){tk=null;document.getElementById('dp').style.display='none';document.getElementById('lp').style.display='flex';document.getElementById('un').value='';document.getElementById('pw').value='';}async function loadDash(){try{const r=await fetch('/api/admin/overview',{headers:{'Authorization':'Bearer '+tk}});const d=await r.json();const s=d.summary;document.getElementById('sc').innerHTML=[{l:'Total Alerts',v:s.totalAlerts,c:'#4a9eff'},{l:'Critical Alerts',v:s.criticalAlerts,c:'#ff4757'},{l:'High Alerts',v:s.highAlerts,c:'#ff8c42'},{l:'Countries Monitored',v:s.countriesMonitored,c:'#00d4a0'}].map(x=>'<div class="card"><div class="card-label">'+x.l+'</div><div class="card-value" style="color:'+x.c+'">'+x.v+'</div></div>').join('');const h=d.systemHealth;document.getElementById('sh').innerHTML=[['AI Provider',s.apiStatus,s.apiStatus.includes('Connected')?'stat-ok':'stat-warn'],['Uptime',Math.round(h.uptime)+'s','stat-ok'],['Memory',h.memoryMB+' MB',h.memoryMB<200?'stat-ok':'stat-warn'],['Node Version',h.nodeVersion,'mono'],['Environment',h.environment,'mono'],['Last Updated',new Date(s.lastUpdated).toLocaleTimeString(),'mono']].map(([k,v,c])=>'<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px"><span style="color:#8891a8">'+k+'</span><span class="'+c+'">'+v+'</span></div>').join('');document.getElementById('rt').innerHTML='<div style="display:flex;flex-direction:column;gap:7px">'+d.regionalResistance.map(r=>{const col=r.rate>70?'#ff4757':r.rate>50?'#ff8c42':r.rate>30?'#ffd166':'#00d4a0';return'<div style="display:flex;align-items:center;gap:8px;font-size:12px"><span style="width:140px;color:#8891a8;flex-shrink:0">'+r.region+'</span><div style="flex:1;height:5px;background:rgba(255,255,255,0.08);border-radius:3px"><div style="width:'+r.rate+'%;height:100%;background:'+col+';border-radius:3px"></div></div><span style="width:35px;text-align:right;color:'+col+';font-family:DM Mono,monospace">'+r.rate+'%</span></div>';}).join('')+'</div>';document.getElementById('at').innerHTML=d.alerts.map(a=>'<tr><td class="mono">'+a.date+'</td><td>'+a.location+'</td><td style="font-style:italic">'+a.pathogen+'</td><td>'+a.resistanceType+'</td><td><span class="badge '+(a.risk==='critical'?'bc':a.risk==='high'?'bh':'bm')+'">'+a.risk.charAt(0).toUpperCase()+a.risk.slice(1)+'</span></td><td class="mono">'+a.cases.toLocaleString()+'</td><td class="mono">'+a.mortality+'</td></tr>').join('');}catch(ex){console.error('Dashboard error:',ex);}}</script></body></html>`);
});

// Catch-all: serve React app
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path === '/admin') return res.status(404).send('Not found');
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log('AMR Guardian running on port ' + PORT);
  console.log('AI Provider: ' + (process.env.GEMINI_API_KEY ? 'Gemini (Free)' : 'Built-in fallback'));
  console.log('Admin panel: /admin');
});
