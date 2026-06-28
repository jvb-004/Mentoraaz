import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [isTutor, setIsTutor] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isTutor === null) { setError('Zəhmət olmasa rolunu seç'); return; }
    setError(''); setLoading(true);
    try {
      await signup({ name, email, password, isTutor });
      navigate(isTutor ? '/me' : '/');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo"><div className="logo-mark">M</div><span>Mentora</span></div>
        <h1>Hesab yarat</h1>
        <p className="auth-sub">30 saniyə çəkir, pulsuzdur</p>

        <div className="role-picker">
          <button type="button" className={`role-btn${isTutor === false ? ' selected' : ''}`} onClick={() => setIsTutor(false)}>
            <span>🎓</span>
            <strong>Müəllim axtarıram</strong>
            <small>Övladım / özüm üçün</small>
          </button>
          <button type="button" className={`role-btn${isTutor === true ? ' selected' : ''}`} onClick={() => setIsTutor(true)}>
            <span>👩‍🏫</span>
            <strong>Mən müəllimim</strong>
            <small>Tələbə tapmaq istəyirəm</small>
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Ad Soyad</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Adın Soyadın" />
          </div>
          <div className="field"><label>E-poçt</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="sen@example.com" autoComplete="email" />
          </div>
          <div className="field"><label>Şifrə</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Ən azı 8 simvol" autoComplete="new-password" />
            <div className="field-hint">Ən azı 8 simvol</div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <span className="spinner" style={{borderTopColor:'#fff'}} /> : 'Hesab yarat'}
          </button>
          <p style={{fontSize:12,color:'var(--grey-400)',textAlign:'center',marginTop:12}}>
            Qeydiyyatdan keçməklə <a href="#" style={{color:'var(--teal)'}}>İstifadə Şərtləri</a> və <a href="#" style={{color:'var(--teal)'}}>Məxfilik Siyasəti</a>ni qəbul edirsən.
          </p>
        </form>
        <p className="auth-switch">Artıq hesabın var? <Link to="/login">Daxil ol</Link></p>
      </div>
      <style>{`
        .auth-page { min-height: calc(100vh - 68px); display: flex; align-items: center; justify-content: center; padding: 32px 16px; background: var(--grey-50); }
        .auth-card { width: 100%; max-width: 440px; padding: 36px 32px; }
        .auth-logo { display: flex; align-items: center; gap: 10px; font-size: 19px; font-weight: 800; margin-bottom: 24px; }
        .auth-logo .logo-mark { width: 34px; height: 34px; border-radius: 9px; background: var(--teal); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 800; }
        .auth-card h1 { font-size: 24px; font-weight: 800; margin-bottom: 6px; }
        .auth-sub { color: var(--grey-400); font-size: 14.5px; margin-bottom: 20px; }
        .role-picker { display: flex; gap: 10px; margin-bottom: 20px; }
        .role-btn { flex: 1; padding: 14px 10px; border: 1.5px solid var(--grey-200); border-radius: var(--radius-md); background: #fff; display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; transition: all 0.15s; }
        .role-btn span { font-size: 22px; }
        .role-btn strong { font-size: 13px; font-weight: 700; }
        .role-btn small { font-size: 11.5px; color: var(--grey-400); }
        .role-btn.selected { border-color: var(--teal); background: var(--teal-light); }
        .auth-switch { text-align: center; font-size: 14px; color: var(--grey-500); margin-top: 20px; }
        .auth-switch a { color: var(--teal); font-weight: 600; }
      `}</style>
    </div>
  );
}
