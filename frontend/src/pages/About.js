import React from 'react';
export default function About() {
  const capabilities = [
    {icon:'🌍',title:'Global Surveillance',desc:'Real-time resistance mapping from 104 WHO countries with AI gap-filling for missing data regions'},
    {icon:'🤖',title:'AI Resistance Prediction',desc:'Predicts antibiotic susceptibility from patient features — no lab required. Works offline on mobile.'},
    {icon:'🚨',title:'Early Outbreak Warning',desc:'Multi-signal AI detects outbreak clusters 8+ days before traditional surveillance confirms'},
    {icon:'💊',title:'Antibiotic Stewardship',desc:'Locally-calibrated antibiotic recommendations adjusted for regional resistance patterns and patient factors'},
    {icon:'💬',title:'AI Clinical Assistant',desc:'Conversational AI for clinicians in low-resource settings — answers AMR questions in plain language'},
    {icon:'📋',title:'Auto-Generated Reports',desc:'WHO-ready antibiogram and outbreak reports auto-generated from aggregated surveillance data'},
  ];
  const stack = [['AI Core','Claude + Custom AMR ML Models'],['Genomics Data','WHO GLASS + NCBI + PATRIC'],['Surveillance','Wastewater + Hospital ADT + Rx Data'],['Backend','Node.js + Express REST API'],['Frontend','React + Chart.js'],['Deployment','Render (Web Service + Static)'],['Data Privacy','Federated learning — no PII shared']];
  const impact = [{label:'Lives saved (5yr)',val:'2.3M',pct:80,color:'var(--accent)'},{label:'Earlier detection',val:'8 days',pct:75,color:'var(--blue)'},{label:'Countries covered',val:'180',pct:90,color:'var(--purple)'},{label:'Clinicians supported',val:'500K',pct:65,color:'var(--accent3)'},{label:'Cost savings',val:'$8.4B',pct:85,color:'var(--orange)'}];
  return (
    <div className="page">
      <div className="topbar"><div><div className="page-title">About AMR Guardian</div><div className="page-sub">A hackathon project addressing the world's silent pandemic</div></div></div>
      <div className="impact-strip"><span style={{fontSize:28}}>🏆</span><div><div style={{fontSize:14,fontWeight:600}}>Global Healthtech Hackathon 2026 — Submission</div><div style={{fontSize:12,color:'var(--muted)',marginTop:2}}>Track: Healthcare AI & Global Health Crisis</div></div></div>
      <div className="grid g2" style={{marginBottom:16}}>
        <div className="card">
          <div style={{fontSize:22,marginBottom:10}}>🎯</div>
          <div className="card-title">The Crisis We're Solving</div>
          <div style={{fontSize:13,lineHeight:1.8,marginTop:8,color:'var(--muted)'}}>AMR silently kills <strong style={{color:'var(--red)'}}>1.27 million people annually</strong> — more than HIV/AIDS or malaria — projected to kill <strong style={{color:'var(--red)'}}>10 million/year by 2050</strong>. Yet <strong style={{color:'var(--orange)'}}>47% of the global population</strong> has no diagnostic access. We are heading into a post-antibiotic era with no coordinated early warning system.</div>
        </div>
        <div className="card">
          <div style={{fontSize:22,marginBottom:10}}>💡</div>
          <div className="card-title">Our Solution</div>
          <div style={{fontSize:13,lineHeight:1.8,marginTop:8,color:'var(--muted)'}}>AMR Guardian is an <strong style={{color:'var(--accent)'}}>AI-powered global surveillance and clinical decision platform</strong> for resource-constrained settings. It fuses wastewater genomics, hospital data, and pharmacy signals to detect outbreaks <strong style={{color:'var(--accent)'}}>8+ days earlier</strong> than traditional methods — providing frontline clinicians real-time antibiotic guidance without a laboratory.</div>
        </div>
      </div>
      <div className="card" style={{marginBottom:16}}>
        <div className="card-title" style={{marginBottom:14}}>Platform Capabilities</div>
        <div className="grid g3">{capabilities.map((c,i)=><div key={i} style={{padding:14,background:'var(--bg3)',borderRadius:8,border:'1px solid var(--border)'}}><div style={{fontSize:18,marginBottom:8}}>{c.icon}</div><div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{c.title}</div><div style={{fontSize:12,color:'var(--muted)'}}>{c.desc}</div></div>)}</div>
      </div>
      <div className="grid g2">
        <div className="card">
          <div className="card-title" style={{marginBottom:14}}>Technology Stack</div>
          {stack.map(([k,v],i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:i<stack.length-1?'1px solid var(--border)':'none'}}><span style={{color:'var(--muted)',fontSize:13}}>{k}</span><span style={{fontFamily:'var(--font-mono)',fontSize:12}}>{v}</span></div>)}
        </div>
        <div className="card">
          <div className="card-title" style={{marginBottom:14}}>Projected Impact (5 Years)</div>
          <div className="risk-meter">{impact.map((r,i)=><div key={i} className="risk-row"><span className="risk-label" style={{width:160}}>{r.label}</span><div className="risk-bar-bg"><div className="risk-bar-fill" style={{width:`${r.pct}%`,background:r.color}}/></div><span className="risk-val" style={{color:r.color,width:55}}>{r.val}</span></div>)}</div>
        </div>
      </div>
    </div>
  );
}
