import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../utils/api';

const SUGGESTED = [
  'What antibiotics are effective against MRSA?',
  'Why is AMR worse in Africa?',
  'How does wastewater surveillance work?',
  'What is carbapenem resistance?',
  'Explain the antibiotic pipeline gap',
  'What is antibiotic stewardship?',
  'How many people does AMR kill per year?',
  'What is a One Health approach to AMR?',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([{role:'assistant',content:"Hello! I'm AMR Guardian AI, your expert on antimicrobial resistance.\n\nI can help with:\n• Resistance patterns and global data\n• Treatment guidance and stewardship\n• Outbreak signals and interpretation\n• Research and policy questions\n\nWhat would you like to know?"}]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);

  const send = async (msg) => {
    const text = msg || input.trim();
    if (!text || loading) return;
    setInput('');
    const newMessages = [...messages, {role:'user',content:text}];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history = newMessages.slice(-10).map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.content}));
      const {response} = await sendChatMessage(text, history.slice(0,-1));
      setMessages(prev => [...prev, {role:'assistant',content:response}]);
    } catch(e) {
      setMessages(prev => [...prev, {role:'assistant',content:'Sorry, I encountered an error. Please try again.'}]);
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="topbar"><div><div className="page-title">AMR AI Assistant</div><div className="page-sub">Ask anything about antimicrobial resistance, treatment, surveillance, or research</div></div></div>
      <div className="grid g2">
        <div className="chat-container">
          <div className="chat-header">
            <div className="ai-avatar">🧬</div>
            <div>
              <div style={{fontWeight:500,fontSize:13}}>AMR Guardian AI</div>
              <div style={{fontSize:11,color:'var(--accent)'}}>● Powered by Claude — AMR Knowledge Base</div>
            </div>
          </div>
          <div className="chat-messages">
            {messages.map((m,i)=>(
              <div key={i} className={`msg${m.role==='user'?' user':''}`}>
                <div className={`msg-ava ${m.role==='user'?'user-ava':'ai-ava'}`}>{m.role==='user'?'U':'🧬'}</div>
                <div className="msg-bubble" style={{whiteSpace:'pre-wrap'}}>{m.content}</div>
              </div>
            ))}
            {loading && <div className="msg"><div className="msg-ava ai-ava">🧬</div><div className="msg-bubble"><div className="typing"><span/><span/><span/></div></div></div>}
            <div ref={bottomRef}/>
          </div>
          <div className="chat-input-area">
            <input className="chat-input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about AMR, resistance patterns, treatments..."/>
            <button className="send-btn" onClick={()=>send()} disabled={loading||!input.trim()}>Send ↗</button>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="section-title" style={{marginBottom:12}}>Suggested Questions</div>
            <div>{SUGGESTED.map((q,i)=><span key={i} className="chip" onClick={()=>send(q)}>{q}</span>)}</div>
          </div>
          <div className="card">
            <div className="section-title" style={{marginBottom:12}}>Knowledge Base</div>
            <div className="risk-meter">
              {[{label:'Research papers',val:'142K',pct:90,color:'var(--blue)'},{label:'Clinical guidelines',val:'3,400',pct:75,color:'var(--accent)'},{label:'Countries tracked',val:'104',pct:85,color:'var(--purple)'},{label:'Resistance genes',val:'8,200',pct:65,color:'var(--accent3)'}].map((r,i)=>(
                <div key={i} className="risk-row">
                  <span className="risk-label">{r.label}</span>
                  <div className="risk-bar-bg"><div className="risk-bar-fill" style={{width:`${r.pct}%`,background:r.color}}/></div>
                  <span className="risk-val" style={{color:r.color,width:50}}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
