import React, { useState, useEffect } from 'react';
import { fetchAlerts } from '../utils/api';

const TICKER_MESSAGES = [
  'BREAKING: Carbapenem-resistant K. pneumoniae cluster in 3 East African hospitals — NDM-1 gene transfer confirmed — urgent containment initiated',
  'WARNING: XDR gonorrhea spreading in South Asia — resistance to all WHO first-line antibiotics — 89 cases in Dhaka',
  'SURVEILLANCE: E. coli fluoroquinolone resistance exceeds 62% across East Africa — ciprofloxacin no longer recommended empirically',
  'UPDATE: WHO GLASS — 104 countries now reporting — Africa data coverage critically low at 18%',
  'RESEARCH: 39 million deaths projected from AMR 2025–2050 — 92 million preventable with better diagnostic access',
];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts({ limit: 20 }).then(data => { setAlerts(data); setLoading(false); }).catch(() => setLoading(false));
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER_MESSAGES.length), 8000);
    return () => clearInterval(t);
  }, []);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.risk === filter);

  const riskBorderColor = (risk) => ({
    critical: 'var(--red)', high: 'var(--orange)', medium: 'var(--accent3)', low: 'var(--green)'
  }[risk] || 'var(--border)');

  const riskIcon = (risk) => ({ critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' }[risk] || '⚪');

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <div className="page-title">Global AMR Alerts</div>
          <div className="page-sub">AI-detected outbreak signals and resistance escalation warnings</div>
        </div>
        <div className="crisis-badge">{alerts.length} Active Alerts</div>
      </div>

      {/* Ticker */}
      <div className="alert-ticker">
        <span className="ticker-dot" />
        <span>{TICKER_MESSAGES[tickerIdx]}</span>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'critical', 'high', 'medium', 'low'].map(f => (
          <button key={f} className={`chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Alerts' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-box"><div className="spinner" /></div>
      ) : (
        filtered.map(alert => (
          <div key={alert.id} className="alert-item" style={{ borderLeft: `3px solid ${riskBorderColor(alert.risk)}` }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{riskIcon(alert.risk)}</span>
            <div style={{ flex: 1 }}>
              <div className="alert-title">{alert.resistanceType} — {alert.location.split(',')[1]?.trim() || alert.location}</div>
              <div className="alert-desc">{alert.description}</div>
              <div className="alert-meta">
                📍 {alert.location} · {alert.date} · Genomics confidence: {alert.genomicConfidence} · Mortality: {alert.mortality}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <span className={`badge badge-${alert.risk}`}>{alert.risk.charAt(0).toUpperCase() + alert.risk.slice(1)}</span>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                {alert.cases?.toLocaleString()} cases
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
