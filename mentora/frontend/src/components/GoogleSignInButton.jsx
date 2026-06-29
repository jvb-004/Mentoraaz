import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({ onError }) {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const btnRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogle();
      document.head.appendChild(script);
    } else {
      initGoogle();
    }

    function initGoogle() {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with',
        locale: 'az',
      });
    }
  }, []);

  const handleCredential = async (response) => {
    try {
      await api.googleAuth(response.credential);
      await refresh();
      navigate('/');
    } catch (e) {
      onError?.(e.message);
    }
  };

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div style={{textAlign:'center',padding:'10px 0',fontSize:12.5,color:'var(--grey-400)'}}>
        Google giriş: <code>VITE_GOOGLE_CLIENT_ID</code> əlavə et
      </div>
    );
  }

  return <div ref={btnRef} style={{width:'100%'}} />;
}
