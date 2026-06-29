import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await api.forgotPassword(email); setSent(true); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'calc(100vh - 68px)',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--grey-50)',padding:24}}>
      <div className="card" style={{maxWidth:400,width:'100%',padding:'40px 32px'}}>
        <h1 style={{fontSize:24,fontWeight:800,marginBottom:6}}>Şifrəni unutdun?</h1>
        <p style={{color:'var(--grey-400)',fontSize:14.5,marginBottom:24}}>E-poçtunu daxil et, şifrə yeniləmə linki göndərəcəyik.</p>
        {sent ? (
          <div className="alert alert-success">
            E-poçtunu yoxla — şifrə yeniləmə linki göndərildi. Spam qovluğunu da yoxlamağı unutma.
            <br/><br/>
            <small style={{color:'var(--grey-500)'}}>Dev modunda link terminalda görünür.</small>
          </div>
        ) : (
          <>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="field"><label>E-poçt</label>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="sen@example.com" autoFocus />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? <span className="spinner" style={{borderTopColor:'#fff'}}/> : 'Link göndər'}
              </button>
            </form>
          </>
        )}
        <p style={{textAlign:'center',marginTop:20,fontSize:14,color:'var(--grey-500)'}}>
          <Link to="/login" style={{color:'var(--teal)',fontWeight:600}}>← Geri qayıt</Link>
        </p>
      </div>
    </div>
  );
}
