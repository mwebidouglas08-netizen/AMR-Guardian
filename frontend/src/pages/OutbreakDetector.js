import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { fetchOutbreakSignals } from '../utils/api';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function OutbreakDetector() {
  const [signals, setSignals] = useState([]);
  useEffect(() => { fetchOutbreakSignals().then(setSignals).catch(()=>{}); }, []);
  const sources = [
    {icon:'💧',name:'Wastewater Surveillance',desc:'AMR gene detection from municipal water sampling'},
    {icon:'🏥',name:'Hospital Admissions',desc:'Anonymised admission patterns from 3,400 hospitals'},
    {icon:'💊',name:'Pharmacy Prescriptions',desc:'Aggregated antibiotic dispensing anomalies'},
    {icon:'🧬',name:'Genomic Sequencing',desc:'Shared resistance gene databases (NCBI/PATRIC)'},
  ];
  const chartData = signals.length ? {
    labels: signals.map(s=>`Day ${s.day}`),
    datasets: [
      {label:'Wastewater AMR',data:signals.map(s=>s.wastewater),borderColor:'#4a9eff',backgroundColor:'rgba(74,158,255,0.06)',tension:0.4,pointRadius:1,borderWidth:2,fill:true},
      {label:'AI Composite Score',data:signals.map(s=>s.aiScore),borderColor:'#00d4a0',backgroundColor:'rgba(0,212,160,0.06)',tension:0.4,pointRadius:1,borderWidth:2.5,fill:true},
      {label:'Pharmacy Anomaly',data:signals.map(s=>s.pharmacy),borderColor:'#ffd166',tension:0.4,pointRadius:1,borderWidth:1.5,fill:false,borderDash:[4,2]},
    ]
  } : null;
  return (
    <div className="page">
      <div className="topbar"><div><div className="page-title">AI Outbreak Detector</div><div className="page-sub">Early warning system using multi-source surveillance signals</div></div></div>
      <div className="grid g3" style={{marginBottom:16}}>
        {[{label:'Signals Monitored',value:'2.4M',color:'var(--blue)',delta:'Daily data points'},{label:'Early Warnings (2026)',value:'847',color:'var(--accent)',delta:'Avg 8.3 days early'},{label:'Prediction Accuracy',value:'94.2%',color:'var(--purple)',delta:'Retrospectively validated'}].map((s,i)=>(
          <div key={i} className="card"><div className="card-label">{s.label}</div><div className="card-value" style={{color:s.color}}>{s.value}</div><div className="card-delta" style={{color:'var(--muted)'}}>{s.delta}</div></div>
        ))}
      </div>
      <div className="card" style={{marginBottom:16}}>
        <div className="section-title" style={{marginBottom:14}}>Signal Sources</div>
        <div className="grid g4">
          {sources.map((s,i)=>(
            <div key={i} style={{background:'var(--bg3)',borderRadius:8,border:'1px solid var(--border)',padding:14,textAlign:'center'}}>
              <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
              <div style={{fontSize:12,fontWeight:500,marginBottom:4}}>{s.name}</div>
              <div style={{fontSize:11,color:'var(--muted)'}}>{s.desc}</div>
              <div style={{fontSize:11,color:'var(--accent)',marginTop:8,fontFamily:'var(--font-mono)'}}>● LIVE</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="section-title" style={{marginBottom:14}}>Signal Timeline — East Africa (Last 30 Days)</div>
        {chartData && <div style={{height:260}}><Line data={chartData} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{boxWidth:10,padding:16,color:'#8891a8'}}},scales:{y:{grid:{color:'rgba(255,255,255,0.04)'}},x:{ticks:{autoSkip:true,maxTicksLimit:10,maxRotation:0},grid:{display:false}}}}}/></div>}
        <div style={{marginTop:14,background:'rgba(255,71,87,0.08)',border:'1px solid rgba(255,71,87,0.2)',borderRadius:8,padding:12,fontSize:13,lineHeight:1.7}}>
          <span style={{color:'var(--red)',fontWeight:500}}>⚠ AI PREDICTION:</span> Based on wastewater AMR gene load (+340%), hospital admission spikes in Days 22–30, and pharmacy anomalies, the model predicted a <strong>high-probability carbapenem-resistant cluster</strong> — confirmed on Day 28. Early warning lead time: <strong>8 days</strong>.
        </div>
      </div>
    </div>
  );
}
