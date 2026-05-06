import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { fetchStats, fetchAlerts, fetchRegionalResistance, fetchPathogenResistance } from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_DEFAULTS = {
  color: '#8891a8',
  borderColor: 'rgba(255,255,255,0.06)',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [regional, setRegional] = useState([]);
  const [pathogens, setPathogens] = useState([]);
  const [deathCount, setDeathCount] = useState(0);
  const counterRef = useRef(null);

  useEffect(() => {
    ChartJS.defaults.color = CHART_DEFAULTS.color;
    ChartJS.defaults.borderColor = CHART_DEFAULTS.borderColor;

    fetchStats().then(data => {
      setStats(data);
      // Animate death counter
      const target = data.deathsThisYear;
      const duration = 2000;
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        setDeathCount(Math.floor(progress * target));
        if (progress < 1) counterRef.current = requestAnimationFrame(animate);
        else {
          // Real-time increment
          const deathsPerSecond = 1270000 / 365 / 86400;
          setInterval(() => setDeathCount(prev => prev + Math.floor(deathsPerSecond)), 1000);
        }
      };
      counterRef.current = requestAnimationFrame(animate);
    }).catch(() => {});

    fetchAlerts({ limit: 5 }).then(setAlerts).catch(() => {});
    fetchRegionalResistance().then(setRegional).catch(() => {});
    fetchPathogenResistance().then(setPathogens).catch(() => {});

    return () => { if (counterRef.current) cancelAnimationFrame(counterRef.current); };
  }, []);

  const projectionData = {
    labels: ['2019', '2022', '2025', '2030', '2035', '2040', '2045', '2050'],
    datasets: [
      {
        label: 'Actual deaths',
        data: [1.27, 1.35, 1.45, null, null, null, null, null],
        borderColor: '#ff6b6b', backgroundColor: 'rgba(255,107,107,0.08)',
        tension: 0.3, pointRadius: 3, borderWidth: 2, fill: true,
      },
      {
        label: 'Projected (millions)',
        data: [null, 1.35, 1.45, 2.1, 3.5, 5.2, 7.4, 10.0],
        borderColor: '#ffd166', backgroundColor: 'rgba(255,209,102,0.06)',
        tension: 0.4, pointRadius: 3, borderWidth: 2, borderDash: [5, 3], fill: true,
      }
    ]
  };

  const pathogenData = {
    labels: pathogens.map(p => p.pathogen),
    datasets: [{
      label: 'Resistance %',
      data: pathogens.map(p => p.rate),
      backgroundColor: pathogens.map(p => p.color),
      borderRadius: 4, borderSkipped: false,
    }]
  };

  const pipelineData = {
    labels: ['Truly novel', 'Modified classes', 'Combinations'],
    datasets: [{
      data: [12, 51, 27],
      backgroundColor: ['#00d4a0', '#ff4757', '#ffd166'],
      borderWidth: 0, hoverOffset: 4,
    }]
  };

  const chartOpts = (yLabel = '%') => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { callback: v => v + (yLabel === 'M' ? 'M' : '%') }, grid: { color: 'rgba(255,255,255,0.04)' } },
      x: { grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  });

  const riskColor = (r) => r > 70 ? 'var(--red)' : r > 50 ? 'var(--orange)' : r > 30 ? 'var(--accent3)' : 'var(--green)';

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <div className="page-title">AMR Crisis Dashboard</div>
          <div className="page-sub">Real-time antimicrobial resistance intelligence — {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div className="topbar-right">
          <div className="crisis-badge">⚠ GLOBAL HEALTH EMERGENCY</div>
        </div>
      </div>

      {/* Impact Strip */}
      <div className="impact-strip">
        <span style={{ fontSize: 24 }}>☠️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--red)' }}>Active Crisis: Antimicrobial Resistance (AMR)</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            1.27M deaths/year directly attributable · 5M deaths linked · Projected 10M/year by 2050 · 47% of global population lacks diagnostic access
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>Deaths this year</div>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--red)', letterSpacing: '-0.5px' }}>
            {deathCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="section">
        <div className="grid g4">
          {[
            { label: 'Annual Direct Deaths', value: '1.27M', color: 'var(--red)', delta: '▲ 18% from 2019', up: true },
            { label: 'Resistant Infections', value: '1 in 6', color: 'var(--orange)', delta: '▲ 1 in 3 for UTIs', up: true },
            { label: 'No Diagnostic Access', value: '47%', color: 'var(--accent3)', delta: 'of global population' },
            { label: 'Projected 2050 Deaths', value: '10M', color: 'var(--purple)', delta: 'Overtaking cancer', up: true },
          ].map((s, i) => (
            <div key={i} className="card">
              <div className="card-label">{s.label}</div>
              <div className="card-value" style={{ color: s.color }}>{s.value}</div>
              <div className={`card-delta ${s.up ? 'up' : ''}`}>{s.delta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="section">
        <div className="grid g2">
          <div className="card">
            <div className="section-head"><div className="section-title">AMR Death Projections (2019–2050)</div></div>
            <div style={{ height: 220 }}>
              <Line data={projectionData} options={chartOpts('M')} />
            </div>
          </div>
          <div className="card">
            <div className="section-head"><div className="section-title">Resistance by Pathogen (2026)</div></div>
            <div style={{ height: 220 }}>
              {pathogens.length > 0 && <Bar data={pathogenData} options={chartOpts('%')} />}
            </div>
          </div>
        </div>
      </div>

      {/* Regional + Pipeline */}
      <div className="section">
        <div className="grid g2">
          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>Regional Resistance Levels</div>
            <div className="risk-meter">
              {regional.map((r, i) => (
                <div key={i} className="risk-row">
                  <span className="risk-label">{r.region}</span>
                  <div className="risk-bar-bg">
                    <div className="risk-bar-fill" style={{ width: `${r.rate}%`, background: riskColor(r.rate) }} />
                  </div>
                  <span className="risk-val" style={{ color: riskColor(r.rate) }}>{r.rate}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>Antibiotic Pipeline Gap</div>
            <div style={{ height: 180 }}>
              <Doughnut data={pipelineData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
              Only <span style={{ color: 'var(--red)', fontWeight: 500 }}>12 truly novel</span> antibiotic agents in the pipeline.
              No new antibiotic class discovered since <strong>1987</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events Table */}
      <div className="section">
        <div className="section-head">
          <div className="section-title">Recent AMR Events</div>
          <Link to="/alerts" className="section-action">View all →</Link>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th><th>Location</th><th>Pathogen</th>
                <th>Resistance Type</th><th>Risk</th><th>Cases</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{a.date}</td>
                  <td>{a.location}</td>
                  <td style={{ fontStyle: 'italic' }}>{a.pathogen}</td>
                  <td>{a.resistanceType}</td>
                  <td><span className={`badge badge-${a.risk}`}>{a.risk.charAt(0).toUpperCase() + a.risk.slice(1)}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{a.cases?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
