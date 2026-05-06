import React, { useState } from 'react';
import { runPrediction } from '../utils/api';

const PATHOGENS = [
  { value: 'ecoli', label: 'Escherichia coli' },
  { value: 'kpneumo', label: 'Klebsiella pneumoniae' },
  { value: 'saur', label: 'Staphylococcus aureus' },
  { value: 'paerug', label: 'Pseudomonas aeruginosa' },
  { value: 'abau', label: 'Acinetobacter baumannii' },
];

const REGIONS = ['Sub-Saharan Africa','South Asia','Southeast Asia','East Asia / Pacific','Latin America','Middle East / North Africa','Eastern Europe','Western Europe','North America'];
const SAMPLE_SOURCES = ['Blood (Bacteremia)','Urine (UTI)','Sputum (Respiratory)','Wound/Soft tissue','CSF (Meningitis)'];
const PRIOR_AB = ['None / Unknown','Fluoroquinolones','Cephalosporins (1st/2nd gen)','Cephalosporins (3rd gen)','Carbapenems','Aminoglycosides','Multiple classes'];
const HEALTHCARE = ['Community — no recent hospitalization','Hospital-acquired (< 48h admission)','Hospital-acquired (> 48h admission)','ICU patient','Nursing home / Long-term care'];

export default function Predictor() {
  const [form, setForm] = useState({
    pathogen: 'ecoli', region: 'Sub-Saharan Africa', sampleSource: 'Blood (Bacteremia)',
    priorAntibiotics: 'None / Unknown', healthcareExposure: 'Community — no recent hospitalization',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await runPrediction(form);
      setResult(data);
    } catch (e) {
      setError('Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const riskColor = result ? (result.score > 70 ? 'var(--red)' : result.score > 50 ? 'var(--orange)' : 'var(--accent3)') : 'var(--text)';
  const riskLabel = result ? (result.score > 70 ? '🔴 High Resistance Risk' : result.score > 50 ? '🟠 Moderate Risk' : '🟡 Lower Risk') : '';

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <div className="page-title">AI AMR Resistance Predictor</div>
          <div className="page-sub">Enter patient & sample data to predict antibiotic resistance profiles</div>
        </div>
      </div>

      <div className="grid g2">
        {/* Input Form */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>Patient & Sample Input</div>

          {[
            { label: 'Suspected Pathogen', key: 'pathogen', options: PATHOGENS, isObj: true },
            { label: 'Sample Source', key: 'sampleSource', options: SAMPLE_SOURCES },
            { label: 'Patient Region', key: 'region', options: REGIONS },
            { label: 'Prior Antibiotic Use (last 90 days)', key: 'priorAntibiotics', options: PRIOR_AB },
            { label: 'Healthcare Exposure', key: 'healthcareExposure', options: HEALTHCARE },
          ].map(({ label, key, options, isObj }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <select
                className="form-select"
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              >
                {options.map(o => isObj
                  ? <option key={o.value} value={o.value}>{o.label}</option>
                  : <option key={o} value={o}>{o}</option>
                )}
              </select>
            </div>
          ))}

          {error && <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 12 }}>{error}</div>}

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
            {loading ? '⏳ Analyzing...' : '🤖 Run AI Resistance Prediction'}
          </button>
        </div>

        {/* Results */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>AI Prediction Results</div>

          {!result && !loading && (
            <div className="loading-box">
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧬</div>
              <div style={{ fontSize: 13 }}>Enter sample information and run the AI predictor to see resistance profiles and treatment recommendations.</div>
            </div>
          )}

          {loading && <div className="loading-box"><div className="spinner" /></div>}

          {result && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Resistance Risk Score</div>
                  <div className="pred-score" style={{ color: riskColor }}>{result.score}/100</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{riskLabel}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>AI Confidence</div>
                  <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{result.confidence}%</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{result.pathogen}</div>
                </div>
              </div>

              <div className="sep" />

              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Antibiotic Susceptibility Prediction</div>
              <div className="antibiotic-grid">
                {result.antibiotics?.map((ab, i) => (
                  <div key={i} className="ab-item">
                    <div className="ab-name">{ab.name}</div>
                    <div className={`ab-status ab-${ab.status}`}>
                      {ab.status === 'resistant' ? '✗ Resistant' : ab.status === 'sensitive' ? '✓ Sensitive' : '~ Intermediate'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="sep" />
              <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>🏥 Recommended Treatment</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, background: 'var(--bg3)', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
                {result.recommendation}
              </div>

              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                ⚠️ {result.disclaimer}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
