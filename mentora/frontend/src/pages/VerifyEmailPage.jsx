import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Token tapılmadı'); return; }
    api.verifyEmail(token)
      .then(d => { setStatus('success'); setMessage(d.message); })
      .catch(e => { setStatus('error'); setMessage(e.message); });
  }, [token]);

  return (
    <div style={{minHeight:'calc(100vh - 68px)',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--grey-50)',padding:24}}>
      <div className="card" style={{maxWidth:400,width:'100%',padding:'40px 32px',textAlign:'center'}}>
        {status === 'loading' && <><div className="spinner" style={{margin:'0 auto 16px'}}/><p>Yoxlanılır...</p></>}
        {status === 'success' && (
          <>
            <div style={{fontSize:48,marginBottom:16}}>✅</div>
            <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>E-poçt təsdiqləndi!</h2>
            <p style={{color:'var(--grey-500)',marginBottom:24}}>{message}</p>
            <Link to="/" className="btn btn-primary btn-block">Ana səhifəyə qayıt</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{fontSize:48,marginBottom:16}}>❌</div>
            <h2 style={{fontSize:22,fontWeight:800,marginBottom:8}}>Xəta baş verdi</h2>
            <p style={{color:'var(--grey-500)',marginBottom:24}}>{message}</p>
            <Link to="/" className="btn btn-ghost btn-block">Ana səhifə</Link>
          </>
        )}
      </div>
    </div>
  );
}
