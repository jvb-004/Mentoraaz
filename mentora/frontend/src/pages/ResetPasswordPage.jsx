import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Şifrələr uyğun gəlmir'); return; }
    if (password.length < 8) { setError('Şifrə ən azı 8 simvol olmalıdır'); return; }
    setError(''); setLoading(true);
    try {
      await api.resetPassword(token, password);
      navigate('/login?reset=1');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (!token) return (
    <div style={{padding:32,textAlign:'center'}}>
      <p style={{color:'var(--danger)'}}>Etibarsız keçid</p>
      <Link to="/forgot-password" style={{color:'var(--teal)'}}>Yeni link al</Link>
    </div>
  );

  return (
    <div style={{minHeight:'calc(100vh - 68px)',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--grey-50)',padding:24}}>
      <div className="card" style={{maxWidth:400,width:'100%',padding:'40px 32px'}}>
        <h1 style={{fontSize:24,fontWeight:800,marginBottom:6}}>Yeni şifrə seç</h1>
        <p style={{color:'var(--grey-400)',fontSize:14.5,marginBottom:24}}>Ən azı 8 simvol olsun.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Yeni şifrə</label>
            <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Ən azı 8 simvol" autoFocus />
          </div>
          <div className="field"><label>Şifrəni təkrarla</label>
            <input type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Eyni şifrəni yaz" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <span className="spinner" style={{borderTopColor:'#fff'}}/> : 'Şifrəni yenilə'}
          </button>
        </form>
      </div>
    </div>
  );
}
