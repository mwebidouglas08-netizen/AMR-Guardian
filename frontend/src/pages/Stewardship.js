import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { getStewardship, fetchAntibiogram } from '../utils/api';

const INFECTION_TYPES = [
  'Urinary Tract Infection (uncomplicated)',
  'Urinary Tract Infection (complicated/pyelonephritis)',
  'Community-acquired pneumonia',
  'Hospital-acquired pneumonia',
  'Sepsis (unknown source)',
  'Skin & soft tissue infection',
  'Intra-abdominal infection',
  'Meningitis (bacterial)',
  'Sexually transmitted infection',
];
const ALLERGIES = ['Penicillin', 'Cephalosporin', 'Sulfa', 'Fluoroquinolone'];
const RENAL = ['Normal (eGFR > 60)', 'Mild impairment (eGFR 45–60)', 'Moderate impairment (eGFR 30–44)', 'Severe impairment (eGFR 15–29)', 'ESRD / Dialysis'];
const PREGNANCY = ['Not applicable / Not pregnant', 'Pregnant (1st trimester)', 'Pregnant (2nd trimester)', 'Pregnant (3rd trimester)', 'Breastfeeding'];

export default function Stewardship() {
  const [form, setForm] = useState({
    infectionType: INFECTION_TYPES[0], allergies: [], renal: RENAL[0],
    pregnancy: PREGNANCY[0], weight: 70,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [antibiogram, setAntibiogram] = useState(null);

  useEffect(() => {
    fetchAntibiogram().then(setAntibiogram).catch(() => {});
  }, []);

  const toggleAllergy = (a) => setForm(f => ({
    ...f, allergies: f.allergies.includes(a) ? f.allergies.filter(x => x !== a) : [...f.allergies, a]
  }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = await getStewardship(form);
      setResult(data);
    } catch (e) {} finally { setLoading(false); }
  };

  const antibiogramChartData = antibiogram ? {
    labels: antibiogram.antibiotics.map(a => a.name),
    datasets: antibiogram.pathogens.map((p, i) => ({
      label: p,
      data: antibiogram.antibiotics.map(a => a.rates[i]),
      backgroundColor: ['#ff6b6b', '#ffd166', '#a78bfa'][i],
      borderRadius: 3, borderSkipped: false,
    }))
  } : null;

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <div className="page-title">Antibiotic Stewardship Advisor</div>
          <div className="page-sub">AI-guided antibiotic selection using local resistance data and clinical context</div>
        </div>
      </div>

      <div className="grid g2" style={{ marginBottom: 16 }}>
        {/* Form */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>Clinical Scenario</div>

          <div className="form-group">
            <label className="form-label">Infection Type</label>
            <select className="form-select" value={form.infectionType} onChange={e => setForm(f => ({ ...f, infectionType: e.target.value }))}>
              {INFECTION_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Patient Weight (kg)</label>
            <input className="form-input" type="number" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="e.g. 70" />
          </div>

          <div className="form-group">
            <label className="form-label">Allergies (select all that apply)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALLERGIES.map(a => (
                <button key={a} className={`chip${form.allergies.includes(a) ? ' active' : ''}`} onClick={() => toggleAllergy(a)}>{a}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Renal Function</label>
            <select className="form-select" value={form.renal} onChange={e => setForm(f => ({ ...f, renal: e.target.value }))}>
              {RENAL.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Pregnancy / Breastfeeding Status</label>
            <select className="form-select" value={form.pregnancy} onChange={e => setForm(f => ({ ...f, pregnancy: e.target.value }))}>
              {PREGNANCY.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Generating...' : '💊 Get Antibiotic Recommendation'}
          </button>
        </div>

        {/* Result */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>Stewardship Recommendation</div>

          {!result && !loading && (
            <div className="loading-box">
              <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
              <div style={{ fontSize: 13 }}>Fill in the clinical scenario to get AI-powered antibiotic recommendations based on local resistance patterns.</div>
            </div>
          )}

          {loading && <div className="loading-box"><div className="spinner" /></div>}

          {result && (
            <>
              <div style={{ background: 'rgba(0,212,160,0.08)', border: '1px solid rgba(0,212,160,0.2)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>FIRST-LINE RECOMMENDATION</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{result.firstLine?.drug}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{result.firstLine?.dose}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Duration: {result.duration}</div>
              </div>

              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>ALTERNATIVES</div>
                {result.alternatives?.map((a, i) => (
                  <div key={i} style={{ fontSize: 13, paddingLeft: 12, borderLeft: '2px solid var(--border)', marginBottom: 6, lineHeight: 1.5 }}>{a}</div>
                ))}
              </div>

              {result.toAvoid?.length > 0 && (
                <div style={{ background: 'rgba(255,71,87,0.06)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>⛔ AVOID EMPIRICALLY</div>
                  {result.toAvoid.map((a, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--muted)', paddingLeft: 12, borderLeft: '2px solid rgba(255,71,87,0.3)', marginBottom: 4 }}>{a}</div>
                  ))}
                </div>
              )}

              <div style={{ background: 'rgba(255,209,102,0.08)', border: '1px solid rgba(255,209,102,0.2)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--accent3)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>STEWARDSHIP NOTES</div>
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>{result.stewardshipNotes}</div>
              </div>

              <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>⚠ LOCAL RESISTANCE ALERT</div>
                <div style={{ fontSize: 13, lineHeight: 1.7 }}>{result.localResistanceWarning}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Local Antibiogram Chart */}
      {antibiogram && antibiogramChartData && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>
            Local Antibiogram — {antibiogram.region} (Updated {antibiogram.updated})
          </div>
          <div style={{ height: 260 }}>
            <Bar data={antibiogramChartData} options={{
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { labels: { boxWidth: 10, padding: 16, color: '#8891a8' } } },
              scales: {
                y: { max: 100, ticks: { callback: v => v + '%' }, title: { display: true, text: '% Resistant', color: '#8891a8' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
              }
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
