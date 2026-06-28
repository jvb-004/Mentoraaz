import { useState, useEffect } from 'react';
import { api } from '../api/client';

const STATUS_COLOR = { unverified:'var(--grey-400)', pending:'#92400E', verified:'var(--success)', rejected:'var(--danger)' };
const STATUS_LABEL = { unverified:'Yoxlanılmayıb', pending:'Gözləmədə', verified:'Təsdiqlənmiş', rejected:'Rədd edilib' };

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [creds, setCreds] = useState([]);
  const [notes, setNotes] = useState({});
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const flash = (m, isErr=false) => { if(isErr) setErr(m); else setMsg(m); setTimeout(()=>{setMsg('');setErr('');},3500); };

  const load = async () => {
    try {
      const [s, c] = await Promise.all([api.adminStats(), api.pendingCredentials()]);
      setStats(s); setCreds(c.credentials);
    } catch (e) { setErr(e.message || 'Admin girişi tələb olunur. .env faylında ADMIN_EMAILS-i yoxla.'); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => { try { await api.approveCredential(id, notes[id]||''); flash('Təsdiqləndi ✓'); load(); } catch(e){flash(e.message,true);} };
  const reject  = async (id) => { try { await api.rejectCredential(id, notes[id]||'Rədd edildi'); flash('Rədd edildi'); load(); } catch(e){flash(e.message,true);} };

  return (
    <div>
      <div style={{background:'var(--grey-900)',color:'#fff',padding:'40px 0'}}>
        <div className="container"><h1 style={{color:'#fff',fontSize:28,fontWeight:800}}>Admin Paneli</h1></div>
      </div>
      <div className="container" style={{padding:'36px 24px'}}>
        {msg && <div className="alert alert-success">{msg}</div>}
        {err && <div className="alert alert-error">{err}</div>}

        {stats && (
          <div className="admin-stats">
            {[['İstifadəçilər',stats.totalUsers],['Müəllimlər',stats.totalTutors],['Təsdiqlənmiş',stats.verifiedTutors],['Gözləyən sənəd',stats.pendingCredentials],['Mesajlar',stats.totalMessages],['Pro abunəlik',stats.activeSubs]].map(([l,v])=>(
              <div key={l} className="card admin-stat"><strong>{v}</strong><span>{l}</span></div>
            ))}
          </div>
        )}

        <h2 style={{fontSize:20,fontWeight:800,margin:'32px 0 16px'}}>Gözləyən sənədlər ({creds.length})</h2>
        {creds.length === 0 && <div className="empty-state"><h3>Gözləyən sənəd yoxdur</h3></div>}
        {creds.map(c => (
          <div key={c.id} className="card admin-cred-card">
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,flexWrap:'wrap',gap:8}}>
              <div>
                <strong style={{fontSize:15}}>{c.tutor_name}</strong>
                <span style={{fontSize:12.5,color:'var(--grey-400)',marginLeft:8}}>{c.tutor_email}</span>
              </div>
              <span style={{fontSize:11.5,color:'var(--grey-400)'}}>{new Date(c.created_at).toLocaleString('az')}</span>
            </div>
            <div style={{marginBottom:10}}>
              <strong style={{fontSize:14}}>{c.title}</strong>
              <span style={{fontSize:12,color:'var(--grey-400)',marginLeft:8}}>({c.type})</span>
            </div>
            <div style={{display:'flex',gap:12,marginBottom:14,flexWrap:'wrap'}}>
              {c.file_url && <a href={c.file_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">📎 Faylı aç</a>}
              {c.external_url && <a href={c.external_url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">🔗 Keçid</a>}
            </div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <input
                placeholder="Qeyd (istəyə bağlı)"
                value={notes[c.id]||''}
                onChange={e=>setNotes(n=>({...n,[c.id]:e.target.value}))}
                style={{flex:1,padding:'9px 13px',border:'1.5px solid var(--grey-200)',borderRadius:'var(--radius-md)',fontSize:13.5,fontFamily:'inherit',minWidth:180}}
              />
              <button className="btn btn-primary btn-sm" onClick={()=>approve(c.id)}>✓ Təsdiqlə</button>
              <button className="btn btn-danger btn-sm" onClick={()=>reject(c.id)}>✗ Rədd et</button>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .admin-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:12px; margin-bottom:8px; }
        .admin-stat { padding:16px 18px; text-align:center; }
        .admin-stat strong { display:block; font-size:26px; font-weight:800; font-family:inherit; }
        .admin-stat span { font-size:12px; color:var(--grey-400); }
        .admin-cred-card { padding:20px; margin-bottom:12px; }
      `}</style>
    </div>
  );
}
