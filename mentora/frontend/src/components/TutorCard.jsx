import { Link } from 'react-router-dom';

const CAT_COLORS = {
  akademik: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  idman:    { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  incesenet:{ bg: '#FDF4FF', text: '#7E22CE', border: '#E9D5FF' },
  dil:      { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
};

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ color:'var(--amber)', fontSize:13, letterSpacing:1 }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

export default function TutorCard({ tutor }) {
  const primaryCat = tutor.subjects?.[0]?.category_slug;
  const catStyle = CAT_COLORS[primaryCat] || { bg:'var(--teal-light)', text:'var(--teal)', border:'#99D6D3' };

  return (
    <Link to={`/tutors/${tutor.id}`} className="tutor-card-link">
      <div className="tutor-card">
        {tutor.is_boosted ? (
          <div className="tutor-card-boost">⚡ Öne çıxarılıb</div>
        ) : null}

        <div className="tc-header">
          <div className="tc-avatar" style={{ background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}` }}>
            {tutor.photo_url
              ? <img src={tutor.photo_url} alt={tutor.name} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
              : <span>{tutor.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <h3 className="tc-name">{tutor.name}</h3>
              {tutor.verification_status === 'verified' && (
                <span className="badge badge-verified">✓ Təsdiqlənmiş</span>
              )}
            </div>
            <p className="tc-subject">{tutor.subjects?.map(s => s.subject_name).join(' · ') || tutor.headline}</p>
            <p className="tc-location">
              {tutor.district ? `📍 ${tutor.district}` : ''}
              {tutor.district && tutor.offers_online ? ' · ' : ''}
              {tutor.offers_online ? '🌐 Onlayn' : ''}
            </p>
          </div>
          {tutor.price_amount ? (
            <div className="tc-price">
              <strong>{tutor.price_amount} ₼</strong>
              <span>/{tutor.price_unit}</span>
            </div>
          ) : null}
        </div>

        {tutor.bio && <p className="tc-bio">{tutor.bio.length > 100 ? tutor.bio.slice(0, 100) + '…' : tutor.bio}</p>}

        {tutor.credentials?.length > 0 && (
          <div className="tc-proofs">
            {tutor.credentials.slice(0, 2).map(c => (
              <span key={c.id} className="tc-proof-tag">✓ {c.title.length > 28 ? c.title.slice(0, 28) + '…' : c.title}</span>
            ))}
          </div>
        )}

        <div className="tc-footer">
          {tutor.avg_rating > 0 ? (
            <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
              <Stars rating={tutor.avg_rating} />
              <span style={{ color:'var(--grey-500)' }}>({tutor.review_count} rəy)</span>
            </span>
          ) : <span style={{ fontSize:13, color:'var(--grey-400)' }}>Yeni müəllim</span>}
          <span className="tc-cta">Profilə bax →</span>
        </div>
      </div>

      <style>{`
        .tutor-card-link { text-decoration: none; display: block; }
        .tutor-card {
          background: #fff; border: 1.5px solid var(--grey-200); border-radius: var(--radius-lg);
          padding: 20px; transition: all 0.2s ease; position: relative; height: 100%;
        }
        .tutor-card:hover { border-color: var(--teal); box-shadow: 0 8px 24px rgba(11,122,117,0.12); transform: translateY(-2px); }
        .tutor-card-boost { position: absolute; top: 14px; right: 14px; font-size: 11px; font-weight: 700; color: #92400E; background: var(--warning-light); padding: 3px 9px; border-radius: 100px; }
        .tc-header { display: flex; gap: 14px; margin-bottom: 12px; align-items: flex-start; }
        .tc-avatar { width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; flex-shrink: 0; overflow: hidden; }
        .tc-name { font-size: 16px; font-weight: 700; color: var(--grey-900); }
        .tc-subject { font-size: 13px; color: var(--teal); font-weight: 600; margin-top: 2px; }
        .tc-location { font-size: 12px; color: var(--grey-400); margin-top: 2px; }
        .tc-price { text-align: right; flex-shrink: 0; }
        .tc-price strong { display: block; font-size: 18px; font-weight: 800; color: var(--grey-900); }
        .tc-price span { font-size: 11.5px; color: var(--grey-400); }
        .tc-bio { font-size: 13.5px; color: var(--grey-500); line-height: 1.55; margin-bottom: 12px; }
        .tc-proofs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .tc-proof-tag { font-size: 11.5px; font-weight: 600; color: var(--success); background: var(--success-light); padding: 3px 9px; border-radius: 100px; }
        .tc-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--grey-100); }
        .tc-cta { font-size: 13px; font-weight: 700; color: var(--teal); }
      `}</style>
    </Link>
  );
}
