import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function TutorProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [error, setError] = useState('');
  const [messaging, setMessaging] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    api.getTutor(id).then(d => setTutor(d.tutor)).catch(e => setError(e.message));
  }, [id]);

  const handleMessage = async () => {
    if (!user) return navigate('/login');
    setMessaging(true);
    try {
      const { conversationId } = await api.startConversation(tutor.user_id);
      navigate(`/messages/${conversationId}`);
    } catch (e) { setError(e.message); setMessaging(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try { await api.addReview(tutor.id, { rating, comment }); setReviewed(true); } catch (e) { setError(e.message); }
  };

  if (error) return <div className="container" style={{ padding: '48px 24px' }}><div className="alert alert-error">{error}</div></div>;
  if (!tutor) return <div className="container" style={{ padding: 48 }}><div className="spinner" /></div>;

  return (
    <div className="tp-wrap">
      <div className="container tp-grid">
        <div className="tp-main">
          <div className="tp-hero-card card">
            <div className="tp-hero-top">
              <div className="tp-avatar">
                {tutor.photo_url ? <img src={tutor.photo_url} alt={tutor.name} /> : tutor.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                  <h1 className="tp-name">{tutor.name}</h1>
                  {tutor.verification_status === 'verified' && <span className="badge badge-verified">✓ Təsdiqlənmiş</span>}
                </div>
                <p style={{ color:'var(--teal)', fontWeight:600, fontSize:14.5 }}>{tutor.headline}</p>
                <p style={{ color:'var(--grey-400)', fontSize:13, marginTop:3 }}>
                  {tutor.district ? `📍 ${tutor.district}, Bakı` : ''}
                  {tutor.district && tutor.offers_online ? ' · ' : ''}
                  {tutor.offers_online ? '🌐 Onlayn' : ''}
                </p>
                <div style={{ display:'flex', gap:20, marginTop:12 }}>
                  {tutor.avg_rating > 0 && <span style={{ fontSize:13.5 }}>⭐ <strong>{tutor.avg_rating.toFixed(1)}</strong> ({tutor.review_count} rəy)</span>}
                  {tutor.profile_views > 0 && <span style={{ fontSize:13, color:'var(--grey-400)' }}>👁 {tutor.profile_views} baxış</span>}
                </div>
              </div>
            </div>
          </div>

          {tutor.bio && (
            <div className="card tp-section">
              <h2>Haqqında</h2>
              <p>{tutor.bio}</p>
            </div>
          )}

          {tutor.subjects?.length > 0 && (
            <div className="card tp-section">
              <h2>Tədris etdiyi fənlər</h2>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:12 }}>
                {tutor.subjects.map(s => (
                  <span key={s.subject_name} style={{ padding:'6px 14px', background:'var(--teal-light)', color:'var(--teal)', borderRadius:100, fontSize:13.5, fontWeight:600 }}>{s.subject_name}</span>
                ))}
              </div>
            </div>
          )}

          {tutor.credentials?.length > 0 && (
            <div className="card tp-section">
              <h2>Kvalifikasiyalar</h2>
              {tutor.credentials.map(c => (
                <div key={c.id} className="cred-item">
                  <div className="cred-check">✓</div>
                  <div>
                    <strong style={{ fontSize:14 }}>{c.title}</strong>
                    <p style={{ fontSize:12, color:'var(--grey-400)', marginTop:2 }}>Mentora tərəfindən yoxlanılıb</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tutor.reviews?.length > 0 && (
            <div className="card tp-section">
              <h2>Rəylər ({tutor.reviews.length})</h2>
              {tutor.reviews.map((r, i) => (
                <div key={i} className="review-item">
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <strong style={{ fontSize:13.5 }}>{r.reviewer_name}</strong>
                    <span style={{ color:'var(--amber)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <p style={{ fontSize:13.5, color:'var(--grey-500)' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {user && !reviewed && (
            <div className="card tp-section">
              <h2>Rəy yaz</h2>
              <form onSubmit={handleReview} style={{ marginTop:12 }}>
                <div className="field">
                  <label>Reytinq</label>
                  <select value={rating} onChange={e => setRating(Number(e.target.value))}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ulduz</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Şərh</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Təcrübən haqqında yaz..." />
                </div>
                <button type="submit" className="btn btn-primary">Rəyi göndər</button>
              </form>
            </div>
          )}
          {reviewed && <div className="alert alert-success">Rəyin göndərildi, təşəkkür edirik!</div>}
        </div>

        <aside className="tp-sidebar">
          <div className="card tp-sticky-card">
            {tutor.price_amount ? (
              <div className="tp-price">
                <strong>{tutor.price_amount} ₼</strong>
                <span>/{tutor.price_unit}</span>
              </div>
            ) : null}
            <button className="btn btn-primary btn-block btn-lg" onClick={handleMessage} disabled={messaging}>
              {messaging ? <span className="spinner" style={{ borderTopColor:'#fff' }} /> : '✉ Mesaj yaz'}
            </button>
            <p style={{ fontSize:12, color:'var(--grey-400)', textAlign:'center', marginTop:10 }}>Pulsuz əlaqə · Heç bir ödəniş tələb olunmur</p>
            {tutor.offers_online && <div className="sidebar-chip">🌐 Onlayn dərs mövcuddur</div>}
            {tutor.offers_in_person && tutor.district && <div className="sidebar-chip">📍 {tutor.district}, Bakı</div>}
          </div>
        </aside>
      </div>

      <style>{`
        .tp-wrap { padding: 32px 0 64px; }
        .tp-grid { display: grid; grid-template-columns: 1fr 300px; gap: 28px; align-items: flex-start; }
        .tp-main { display: flex; flex-direction: column; gap: 20px; }
        .tp-hero-card { padding: 24px; }
        .tp-hero-top { display: flex; gap: 20px; }
        .tp-avatar { width: 80px; height: 80px; border-radius: 50%; background: var(--teal-light); color: var(--teal); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; flex-shrink: 0; overflow: hidden; }
        .tp-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .tp-name { font-size: 22px; font-weight: 800; }
        .tp-section { padding: 22px; }
        .tp-section h2 { font-size: 16px; font-weight: 700; color: var(--grey-700); margin-bottom: 12px; }
        .tp-section p { font-size: 14.5px; color: var(--grey-500); line-height: 1.7; }
        .cred-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--grey-100); }
        .cred-item:last-child { border-bottom: none; }
        .cred-check { width: 28px; height: 28px; border-radius: 50%; background: var(--success-light); color: var(--success); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
        .review-item { padding: 12px 0; border-bottom: 1px solid var(--grey-100); }
        .review-item:last-child { border-bottom: none; }
        .tp-sidebar { position: sticky; top: 88px; }
        .tp-sticky-card { padding: 22px; }
        .tp-price { margin-bottom: 14px; }
        .tp-price strong { font-size: 28px; font-weight: 800; }
        .tp-price span { font-size: 13.5px; color: var(--grey-400); }
        .sidebar-chip { background: var(--grey-50); border: 1px solid var(--grey-200); border-radius: 8px; padding: 8px 12px; font-size: 13px; font-weight: 600; color: var(--grey-600); margin-top: 10px; }
        @media (max-width: 900px) {
          .tp-grid { grid-template-columns: 1fr; }
          .tp-sidebar { position: static; }
        }
      `}</style>
    </div>
  );
}
