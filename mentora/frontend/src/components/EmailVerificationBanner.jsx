import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || user.email_verified) return null;

  const resend = async () => {
    setLoading(true);
    try { await api.resendVerification(); setSent(true); }
    catch (e) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{background:'#FEF3C7',borderBottom:'1px solid #FCD34D',padding:'10px 24px',display:'flex',alignItems:'center',justifyContent:'center',gap:16,flexWrap:'wrap',fontSize:13.5}}>
      <span>📧 <strong>E-poçtunu təsdiqlə</strong> — {user.email} ünvanına doğrulama linki göndərildi.</span>
      {sent ? (
        <span style={{color:'var(--success)',fontWeight:600}}>✓ Göndərildi!</span>
      ) : (
        <button onClick={resend} disabled={loading} style={{background:'none',border:'none',color:'var(--teal)',fontWeight:700,cursor:'pointer',fontSize:13.5,textDecoration:'underline'}}>
          {loading ? 'Göndərilir...' : 'Yenidən göndər'}
        </button>
      )}
    </div>
  );
}
