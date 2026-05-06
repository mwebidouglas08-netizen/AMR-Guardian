import React, { useState } from 'react';
import { generateReport } from '../utils/api';

const REPORT_TYPES = [
  {id:'weekly',icon:'📊',title:'Weekly AMR Digest',desc:'Automated weekly summary of global resistance trends, new outbreaks, and surveillance data from 104 countries.',badge:'Latest: This Week'},
  {id:'antibiogram',icon:'🔬',title:'Regional Antibiogram',desc:'Customized local resistance data to guide empiric prescribing — tailored to Sub-Saharan Africa region.',badge:'Sub-Saharan Africa'},
  {id:'outbreak',icon:'⚡',title:'Outbreak Investigation',desc:'Full epidemiological report with resistance gene mapping and containment recommendations.',badge:'Active: Nairobi CRE'},
];

export default function Reports() {
  const [loadingType, setLoadingType] = useState(null);
  const [report, setReport] = useState(null);

  const handleGenerate = async (type) => {
    setLoadingType(type); setReport(null);
    try { const data = await generateReport(type); setReport({type,...data}); }
    catch(e) {} finally { setLoadingType(null); }
  };

  const formatReport = (text) => {
    if (!text) return '';
    return text
      .replace(/## (.*)/g,'<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/^• (.*)/gm,'<li>$1</li>')
      .replace(/\n/g,'<br/>');
  };

  return (
    <div className="page">
      <div className="topbar"><div><div className="page-title">AMR Intelligence Reports</div><div className="page-sub">AI-generated surveillance reports for clinicians, policymakers, and researchers</div></div></div>
      <div className="grid g3" style={{marginBottom:20}}>
        {REPORT_TYPES.map(r=>(
          <div key={r.id} className="card">
            <div style={{fontSize:28,marginBottom:10}}>{r.icon}</div>
            <div className="card-title">{r.title}</div>
            <div className="card-desc" style={{marginTop:6}}>{r.desc}</div>
            <div style={{marginTop:12}}><span className="badge badge-low">{r.badge}</span></div>
            <button className="btn btn-ghost" style={{marginTop:12,width:'100%',fontSize:12}} onClick={()=>handleGenerate(r.id)} disabled={!!loadingType}>
              {loadingType===r.id?'⏳ Generating...':'Generate Report'}
            </button>
          </div>
        ))}
      </div>
      {loadingType && !report && <div className="loading-box"><div className="spinner"/></div>}
      {report && (
        <div className="card">
          <div className="report-header">
            <div style={{fontSize:11,color:'var(--muted)',fontFamily:'var(--font-mono)',marginBottom:4}}>AMR GUARDIAN INTELLIGENCE REPORT</div>
            <div style={{fontFamily:'var(--font-head)',fontSize:18,fontWeight:700}}>{REPORT_TYPES.find(r=>r.id===report.type)?.title}</div>
            <div style={{fontSize:12,color:'var(--muted)',marginTop:4,fontFamily:'var(--font-mono)'}}>Generated: {new Date(report.generated).toLocaleString()} | AMR Guardian AI</div>
          </div>
          <div className="report-content" dangerouslySetInnerHTML={{__html:formatReport(report.report)}}/>
        </div>
      )}
    </div>
  );
}
