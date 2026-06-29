import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-logo"><div className="logo-mark">M</div><span>Mentora</span></div>
        <h1>Xoş gəldin</h1>
        <p className="auth-sub">Hesabına daxil ol</p>

        {params.get('reset') && <div className="alert alert-success">Şifrən uğurla yeniləndi. İndi daxil ola bilərsən.</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <GoogleSignInButton onError={setError} />

        <div className="auth-divider"><span>və ya e-poçt ilə</span></div>

        <form onSubmit={handleSubmit}>
          <div className="field"><label>E-poçt</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="sen@example.com" autoComplete="email" />
          </div>
          <div className="field">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
              <label style={{margin:0}}>Şifrə</label>
              <Link to="/forgot-password" style={{fontSize:12.5,color:'var(--teal)',fontWeight:600}}>Unutdun?</Link>
            </div>
            <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Şifrəni daxil et" autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <span className="spinner" style={{borderTopColor:'#fff'}}/> : 'Daxil ol'}
          </button>
        </form>
        <p className="auth-switch">Hesabın yoxdur? <Link to="/signup">Qeydiyyat</Link></p>
      </div>
      <style>{`
        .auth-page { min-height:calc(100vh - 68px); display:flex; align-items:center; justify-content:center; padding:32px 16px; background:var(--grey-50); }
        .auth-card { width:100%; max-width:420px; padding:36px 32px; }
        .auth-logo { display:flex; align-items:center; gap:10px; font-size:19px; font-weight:800; margin-bottom:24px; }
        .auth-logo .logo-mark { width:34px; height:34px; border-radius:9px; background:var(--teal); color:#fff; display:flex; align-items:center; justify-content:center; font-size:17px; font-weight:800; }
        .auth-card h1 { font-size:24px; font-weight:800; margin-bottom:6px; }
        .auth-sub { color:var(--grey-400); font-size:14.5px; margin-bottom:20px; }
        .auth-divider { display:flex; align-items:center; gap:12px; margin:16px 0; }
        .auth-divider::before, .auth-divider::after { content:''; flex:1; height:1px; background:var(--grey-200); }
        .auth-divider span { font-size:12.5px; color:var(--grey-400); white-space:nowrap; }
        .auth-switch { text-align:center; font-size:14px; color:var(--grey-500); margin-top:20px; }
        .auth-switch a { color:var(--teal); font-weight:600; }
      `}</style>
    </div>
  );
}
