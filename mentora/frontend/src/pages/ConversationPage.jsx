import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ConversationPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const bottomRef = useRef(null);

  const load = () => {
    api.getConversation(id)
      .then(d => { setMessages(d.messages); setOtherUser(d.otherUser); })
      .catch(e => { if (e.status === 403 || e.status === 404) navigate('/messages'); });
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const { message, safetyNotice } = await api.sendMessage(id, { body: text.trim() });
      setMessages(prev => [...prev, message]);
      setText('');
      if (safetyNotice === 'early_contact_request') setNotice('Məsləhət: xarici kontaktı paylaşmazdan əvvəl platformada bir müddət əlaqə qurun.');
    } catch (e) { alert(e.message); }
    finally { setSending(false); }
  };

  const report = async () => {
    if (!reportReason.trim()) return;
    try { await api.reportConversation(id, { reason: reportReason }); setReporting(false); setReportReason(''); alert('Şikayət göndərildi. Komandamız yoxlayacaq.'); }
    catch (e) { alert(e.message); }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('az', { hour:'2-digit', minute:'2-digit' });

  return (
    <div className="chat-page">
      <div className="chat-head">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/messages')}>← Geri</button>
        <div className="chat-head-avatar">{otherUser?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div style={{fontWeight:700,fontSize:15}}>{otherUser?.name}</div>
          <div style={{fontSize:12,color:'var(--grey-400)'}}>Aktiv</div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{marginLeft:'auto',fontSize:12,color:'var(--danger)'}} onClick={() => setReporting(true)}>Şikayət et</button>
      </div>

      <div className="chat-body">
        {notice && <div className="alert alert-warning" style={{margin:'8px 16px'}}>{notice}</div>}
        {messages.map(m => (
          <div key={m.id} className={`chat-msg ${m.sender_id === user?.id ? 'mine' : 'theirs'}`}>
            {m.body && <span>{m.body}</span>}
            {m.attachment_url && <a href={m.attachment_url} target="_blank" rel="noreferrer" style={{textDecoration:'underline'}}>📎 Əlavə</a>}
            <div className="msg-time">{formatTime(m.created_at)}{m.sender_id === user?.id && m.read_at ? ' · Oxundu' : ''}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-bar" onSubmit={send}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Mesaj yaz..." autoFocus />
        <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
          {sending ? <span className="spinner" style={{borderTopColor:'#fff'}} /> : 'Göndər'}
        </button>
      </form>

      {reporting && (
        <div className="report-overlay" onClick={() => setReporting(false)}>
          <div className="report-modal" onClick={e => e.stopPropagation()}>
            <h3>Şikayət et</h3>
            <p style={{color:'var(--grey-400)',fontSize:13.5,marginBottom:14}}>Bu istifadəçi haqqında şikayətin nədir?</p>
            <div className="field">
              <textarea value={reportReason} onChange={e => setReportReason(e.target.value)} placeholder="Şikayət səbəbini ətraflı yaz..." rows={4} />
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-danger btn-block" onClick={report}>Göndər</button>
              <button className="btn btn-ghost btn-block" onClick={() => setReporting(false)}>Ləğv et</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .chat-page { display:flex; flex-direction:column; height:calc(100vh - 68px); }
        .chat-head { display:flex; align-items:center; gap:12px; padding:12px 20px; border-bottom:1px solid var(--grey-200); background:#fff; flex-shrink:0; }
        .chat-head-avatar { width:38px; height:38px; border-radius:50%; background:var(--teal-light); color:var(--teal); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; flex-shrink:0; }
        .chat-body { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:10px; background:var(--grey-50); }
        .chat-msg { max-width:72%; padding:11px 15px; border-radius:16px; font-size:14px; line-height:1.55; }
        .chat-msg.mine { background:var(--teal); color:#fff; align-self:flex-end; border-bottom-right-radius:4px; }
        .chat-msg.theirs { background:#fff; border:1px solid var(--grey-200); align-self:flex-start; border-bottom-left-radius:4px; }
        .msg-time { font-size:10.5px; opacity:0.6; margin-top:4px; }
        .chat-input-bar { display:flex; gap:10px; padding:14px 20px; border-top:1px solid var(--grey-200); background:#fff; flex-shrink:0; }
        .chat-input-bar input { flex:1; padding:11px 16px; border:1.5px solid var(--grey-200); border-radius:100px; font-size:14.5px; outline:none; font-family:inherit; }
        .chat-input-bar input:focus { border-color:var(--teal); }
        .report-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:flex-end; justify-content:center; z-index:200; }
        .report-modal { background:#fff; border-radius:20px 20px 0 0; padding:28px; width:100%; max-width:480px; }
        .report-modal h3 { font-size:18px; font-weight:800; margin-bottom:8px; }
      `}</style>
    </div>
  );
}
