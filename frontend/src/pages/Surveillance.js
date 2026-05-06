import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchRegionalResistance } from '../utils/api';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Surveillance() {
  const [regional, setRegional] = useState([]);
  useEffect(() => { fetchRegionalResistance().then(setRegional).catch(() => {}); }, []);
  const riskColor = r => r > 70 ? '#ff4757' : r > 50 ? '#ff8c42' : r > 30 ? '#ffd166' : '#00d4a0';
  const countryData = {
    labels: ['India','Nigeria','Pakistan','Bangladesh','Congo DRC','Ethiopia','Indonesia','Tanzania','Philippines','Uganda','Afghanistan','Sudan','Mozambique','Cameroon','Myanmar','Madagascar','Zambia','Ghana','Senegal','Kenya'],
    datasets: [{ label: 'AMR Burden Score', data: [95,91,88,86,84,82,79,78,76,75,74,73,71,70,68,67,65,64,63,62], backgroundColor: [95,91,88,86,84,82,79,78,76,75,74,73,71,70,68,67,65,64,63,62].map(v => v > 85 ? '#ff4757' : v > 75 ? '#ff8c42' : '#ffd166'), borderRadius: 3, borderSkipped: false }]
  };
  return (
    <div className="page">
      <div className="topbar"><div><div className="page-title">Global AMR Surveillance Map</div><div className="page-sub">Real-time resistance tracking across 104 WHO-participating countries</div></div></div>
      <div className="grid g3" style={{marginBottom:16}}>
        {[{label:'Countries Reporting',value:'104',color:'var(--blue)',delta:'▲ From 27 in 2016'},{label:'Surveillance Gap',value:'89',color:'var(--red)',delta:'Countries with inadequate labs'},{label:'Data Quality Score',value:'42%',color:'var(--accent3)',delta:'Global avg — Africa: 18%'}].map((s,i)=>(
          <div key={i} className="card"><div className="card-label">{s.label}</div><div className="card-value" style={{color:s.color}}>{s.value}</div><div className="card-delta" style={{color:'var(--muted)'}}>{s.delta}</div></div>
        ))}
      </div>
      <div className="card" style={{marginBottom:16}}>
        <div className="section-title" style={{marginBottom:14}}>Regional Resistance Levels</div>
        <div className="risk-meter">
          {regional.map((r,i)=>(
            <div key={i} className="risk-row">
              <span className="risk-label" style={{width:180}}>{r.region}</span>
              <div className="risk-bar-bg"><div className="risk-bar-fill" style={{width:`${r.rate}%`,background:riskColor(r.rate)}}/></div>
              <span className="risk-val" style={{color:riskColor(r.rate),width:50}}>{r.rate}%</span>
              <span style={{fontSize:10,fontFamily:'var(--font-mono)',color:r.trend==='rising'?'var(--red)':r.trend==='declining'?'var(--green)':'var(--muted)',width:70}}>{r.trend==='rising'?'▲ Rising':r.trend==='declining'?'▼ Declining':'→ Stable'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="section-title" style={{marginBottom:14}}>Countries with Highest AMR Burden (Top 20)</div>
        <div style={{height:340}}><Bar data={countryData} options={{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{max:100,grid:{color:'rgba(255,255,255,0.04)'}},y:{grid:{display:false},ticks:{font:{size:11}}}}}}/></div>
      </div>
    </div>
  );
}
