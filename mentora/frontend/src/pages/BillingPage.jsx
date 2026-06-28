import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function BillingPage() {
  const { user } = useAuth();
  const [sub, setSub] = useState(null);
  const [boost, setBoost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const flash = (m, isErr=false) => { if(isErr) setErr(m); else setMsg(m); setTimeout(() => {setMsg('');setErr('');}, 3500); };

  const load = async () => {
    try {
      const [s, b] = await Promise.all([api.mySubscription(), user?.is_tutor ? api.boostStatus() : Promise.resolve(null)]);
      setSub(s.subscription); setBoost(b);
    } catch (e) { flash(e.message, true); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubscribe = async () => { try { await api.subscribe(); flash('Mentora Pro aktivləşdirildi! 🎉'); load(); } catch(e) { flash(e.message, true); } };
  const handleCancel = async () => { if(!confirm('Abunəliyi ləğv etmək istəyirsən?')) return; try { await api.cancelSubscription(); flash('Abunəlik ləğv edildi'); load(); } catch(e) { flash(e.message, true); } };
  const handleBoost = async () => { try { await api.buyBoost(); flash('Boost aktivləşdirildi! Profilin 7 gün irəlidə görünəcək.'); load(); } catch(e) { flash(e.message, true); } };

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:64}}><div className="spinner"/></div>;

  return (
    <div>
      <div style={{background:'var(--teal)',color:'#fff',padding:'52px 0'}}>
        <div className="container">
          <h1 style={{fontSize:'clamp(28px,4vw,42px)',fontWeight:800,color:'#fff',marginBottom:10}}>Mentora Pro</h1>
          <p style={{fontSize:17,color:'rgba(255,255,255,0.8)',maxWidth:500}}>Görünən ol. Daha çox tələbə tap. Bazarda öndə ol.</p>
        </div>
      </div>

      <div className="container" style={{padding:'48px 24px'}}>
        {msg && <div className="alert alert-success">{msg}</div>}
        {err && <div className="alert alert-error">{err}</div>}

        <div className="billing-grid">
          <div className={`billing-card card${sub ? ' billing-active' : ''}`}>
            {sub && <div className="billing-active-badge">✓ Aktiv</div>}
            <div className="billing-plan-name">Mentora Pro</div>
            <div className="billing-price"><strong>12 ₼</strong><span>/ay</span></div>
            <p style={{fontSize:13.5,color:'var(--grey-400)',marginBottom:20}}>Aylıq abunəlik, istənilən vaxt ləğv etmək mümkün</p>
            <ul className="billing-features">
              {['Limitsiz aktiv elan','Aylıq 4 boost krediti','Reklamlarsız istifadə','Profil analitikası','Prioritet müəllim sıralaması'].map(f => (
                <li key={f}><span className="check">✓</span>{f}</li>
              ))}
            </ul>
            {sub ? (
              <div>
                <p style={{fontSize:12.5,color:'var(--grey-400)',marginBottom:12}}>Növbəti ödəniş: {new Date(sub.current_period_end).toLocaleDateString('az')}</p>
                <button className="btn btn-ghost btn-block" onClick={handleCancel}>Abunəliyi ləğv et</button>
              </div>
            ) : (
              <button className="btn btn-primary btn-block btn-lg" onClick={handleSubscribe}>Pro-ya keç — 12 ₼/ay</button>
            )}
            <p style={{fontSize:11.5,color:'var(--grey-300)',textAlign:'center',marginTop:10}}>Test rejimi · Real ödəniş tezliklə</p>
          </div>

          {user?.is_tutor && (
            <div className="billing-card card">
              <div className="billing-plan-name">Profil Boost</div>
              <div className="billing-price"><strong>15 ₼</strong><span>/7 gün</span></div>
              <p style={{fontSize:13.5,color:'var(--grey-400)',marginBottom:20}}>Profilin axtarış nəticələrinin başına çıxır</p>
              <ul className="billing-features">
                {['7 gün ərzində irəliləmiş sıralama','Öne çıxarılmış etiket','Daha çox profil baxışı'].map(f => (
                  <li key={f}><span className="check">✓</span>{f}</li>
                ))}
              </ul>
              {boost?.isBoosted ? (
                <div className="alert alert-success">Aktiv boost: {new Date(boost.boost.ends_at).toLocaleDateString('az')}-ə qədər</div>
              ) : (
                <button className="btn btn-amber btn-block btn-lg" onClick={handleBoost}>Boost al — 15 ₼</button>
              )}
              <p style={{fontSize:11.5,color:'var(--grey-300)',textAlign:'center',marginTop:10}}>Test rejimi · Real ödəniş tezliklə</p>
            </div>
          )}

          <div className="billing-card card">
            <div className="billing-plan-name">Pulsuz</div>
            <div className="billing-price"><strong>0 ₼</strong><span>/həmişə</span></div>
            <p style={{fontSize:13.5,color:'var(--grey-400)',marginBottom:20}}>Əsas funksiyalar üçün</p>
            <ul className="billing-features">
              {['Profil yarat','Müəllim axtar','Mesajlaş','Rəy yaz'].map(f => (
                <li key={f}><span className="check" style={{color:'var(--grey-300)'}}>✓</span>{f}</li>
              ))}
            </ul>
            <div style={{background:'var(--grey-50)',borderRadius:'var(--radius-md)',padding:'12px 16px',fontSize:13,color:'var(--grey-500)'}}>Hazırda bu plandasan</div>
          </div>
        </div>

        <div className="billing-faq">
          <h2 style={{fontSize:22,fontWeight:800,marginBottom:24}}>Tez-tez verilən suallar</h2>
          {[
            ['Ödəniş necə işləyir?','Test rejimindədir — real pul çəkilmir. Tezliklə yerli ödəniş üsulları (Kapital Bank, ABB) əlavə olunacaq.'],
            ['Abunəliyi nə vaxt ləğv edə bilərəm?','İstənilən vaxt, heç bir cərimə olmadan.'],
            ['Boost nə qədər effektlidir?','Boosted profillər axtarışda 3-5x daha çox baxış alır.'],
          ].map(([q,a]) => (
            <div key={q} className="faq-item">
              <h4>{q}</h4>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .billing-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; margin-bottom:56px; }
        .billing-card { padding:28px; position:relative; }
        .billing-active { border:2px solid var(--teal); }
        .billing-active-badge { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--teal); color:#fff; font-size:12px; font-weight:700; padding:4px 14px; border-radius:100px; }
        .billing-plan-name { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--grey-400); margin-bottom:12px; }
        .billing-price { margin-bottom:6px; }
        .billing-price strong { font-size:36px; font-weight:800; }
        .billing-price span { font-size:14px; color:var(--grey-400); }
        .billing-features { list-style:none; margin-bottom:24px; display:flex; flex-direction:column; gap:10px; }
        .billing-features li { display:flex; align-items:center; gap:10px; font-size:14px; color:var(--grey-600); }
        .check { color:var(--success); font-weight:700; font-size:13px; flex-shrink:0; }
        .billing-faq { border-top:1px solid var(--grey-200); padding-top:40px; }
        .faq-item { padding:20px 0; border-bottom:1px solid var(--grey-100); }
        .faq-item:last-child { border-bottom:none; }
        .faq-item h4 { font-size:15.5px; font-weight:700; margin-bottom:8px; }
        .faq-item p { font-size:14px; color:var(--grey-500); line-height:1.65; }
      `}</style>
    </div>
  );
}
