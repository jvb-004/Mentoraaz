import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:'var(--teal)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16 }}>M</div>
              <span style={{ fontSize:18, fontWeight:800 }}>Mentora</span>
            </div>
            <p style={{ fontSize:13.5, color:'var(--grey-400)', lineHeight:1.7, maxWidth:260 }}>
              Bakının ən etibarlı mütəxəssis platforması. Hər müəllim yoxlanılır.
            </p>
          </div>
          <div>
            <h4>Platform</h4>
            <Link to="/">Müəllim tap</Link>
            <Link to="/billing">Qiymətlər</Link>
            <Link to="/how-it-works">Necə işləyir</Link>
          </div>
          <div>
            <h4>Hesab</h4>
            <Link to="/signup">Qeydiyyat</Link>
            <Link to="/login">Daxil ol</Link>
            <Link to="/me">Profil</Link>
          </div>
          <div>
            <h4>Müəllimlər üçün</h4>
            <Link to="/signup">Qeydiyyatdan keç</Link>
            <Link to="/billing">Mentora Pro</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Mentora. Bütün hüquqlar qorunur.</span>
          <span>Bakı, Azərbaycan</span>
        </div>
      </div>
      <style>{`
        .footer { background: var(--grey-900); color: #fff; padding: 56px 0 0; margin-top: auto; }
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 48px; }
        .footer-grid h4 { font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--grey-400); margin-bottom: 16px; }
        .footer-grid a { display: block; font-size: 14px; color: var(--grey-300); margin-bottom: 10px; }
        .footer-grid a:hover { color: #fff; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding: 20px 0; display: flex; justify-content: space-between; font-size: 13px; color: var(--grey-500); }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
        }
      `}</style>
    </footer>
  );
}
