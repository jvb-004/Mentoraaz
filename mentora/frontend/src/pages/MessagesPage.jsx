import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function MessagesPage() {
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.listConversations().then(d => setConvos(d.conversations)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:64}}><div className="spinner" /></div>;

  return (
    <div style={{maxWidth:680,margin:'0 auto',padding:'40px 24px'}}>
      <h1 style={{fontSize:24,fontWeight:800,marginBottom:24}}>Mesajlar</h1>
      {convos.length === 0 && (
        <div className="empty-state card" style={{padding:48}}>
          <h3>Hələ mesaj yoxdur</h3>
          <p>Müəllim profilinə girib "Mesaj yaz" düyməsini bas.</p>
          <a href="/search" className="btn btn-primary" style={{marginTop:20,display:'inline-flex'}}>Müəllim tap</a>
        </div>
      )}
      {convos.map(c => (
        <div key={c.conversationId} className="convo-row card" onClick={() => navigate(`/messages/${c.conversationId}`)}>
          <div className="convo-avatar">{c.otherUser?.name?.[0]?.toUpperCase()}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:15}}>{c.otherUser?.name}</div>
            <div style={{fontSize:13,color:'var(--grey-400)',marginTop:2,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
              {c.lastMessage?.body || '📎 Fayl'}
            </div>
          </div>
          {c.unreadCount > 0 && (
            <span className="unread-dot">{c.unreadCount}</span>
          )}
        </div>
      ))}
      <style>{`
        .convo-row { display:flex; align-items:center; gap:14px; padding:16px 18px; margin-bottom:10px; cursor:pointer; transition:box-shadow 0.15s; }
        .convo-row:hover { box-shadow: var(--shadow-md); }
        .convo-avatar { width:44px; height:44px; border-radius:50%; background:var(--teal-light); color:var(--teal); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:17px; flex-shrink:0; }
        .unread-dot { background:var(--teal); color:#fff; border-radius:100px; padding:2px 9px; font-size:12px; font-weight:700; flex-shrink:0; }
      `}</style>
    </div>
  );
}
