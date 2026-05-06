import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import './styles/global.css';

import Dashboard from './pages/Dashboard';
import Surveillance from './pages/Surveillance';
import Alerts from './pages/Alerts';
import Predictor from './pages/Predictor';
import Stewardship from './pages/Stewardship';
import OutbreakDetector from './pages/OutbreakDetector';
import AIAssistant from './pages/AIAssistant';
import Reports from './pages/Reports';
import About from './pages/About';

const NAV_ITEMS = [
  { section: 'Overview' },
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/surveillance', label: 'Surveillance Map', icon: '🌍' },
  { to: '/alerts', label: 'Global Alerts', icon: '🚨', badge: 7 },
  { section: 'Clinical Tools' },
  { to: '/predict', label: 'AMR Predictor', icon: '🤖' },
  { to: '/stewardship', label: 'Antibiotic Advisor', icon: '💊' },
  { to: '/outbreak', label: 'Outbreak Detector', icon: '📡' },
  { section: 'Intelligence' },
  { to: '/ai', label: 'AMR AI Assistant', icon: '💬' },
  { to: '/reports', label: 'Reports', icon: '📋' },
  { to: '/about', label: 'About Project', icon: 'ℹ️' },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo-area">
        <div className="logo-badge">
          <div className="logo-icon">🧬</div>
          <div>
            <div className="logo-text">AMR Guardian</div>
            <div className="logo-sub">AI Health Platform</div>
          </div>
        </div>
      </div>
      <nav className="nav">
        {NAV_ITEMS.map((item, i) =>
          item.section ? (
            <div key={i} className="nav-section-label">{item.section}</div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          )
        )}
      </nav>
      <div className="status-bar">
        <span className="status-dot"></span>Live surveillance active
        <br />
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
          104 countries · Updated now
        </span>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/surveillance" element={<Surveillance />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/predict" element={<Predictor />} />
            <Route path="/stewardship" element={<Stewardship />} />
            <Route path="/outbreak" element={<OutbreakDetector />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
