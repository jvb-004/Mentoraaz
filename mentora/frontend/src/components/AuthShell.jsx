export default function AuthShell({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-panel-form">
        <div className="auth-card">{children}</div>
      </div>
      <div className="auth-panel-visual">
        <div className="auth-visual-content">
          <h2>Bakının ən etibarlı mütəxəssislər platforması</h2>
          <p>Hər profil yoxlanılır. Diplomlar, sertifikatlar, real rəylər - uşağın üçün ən doğru seçimi et.</p>
          <div className="auth-stats">
            <div><strong>142+</strong><span>təsdiqlənmiş mütəxəssis</span></div>
            <div><strong>4 sahə</strong><span>akademik, idman, incəsənət, dil</span></div>
          </div>
        </div>
      </div>

      <style>{`
        .auth-shell { display: flex; min-height: 100vh; background: var(--paper); }
        .auth-panel-form {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 32px 24px;
        }
        .auth-card { width: 100%; max-width: 380px; }
        .auth-panel-visual {
          flex: 1; background: var(--ink); color: var(--text-on-ink);
          display: flex; align-items: center; justify-content: center;
          padding: 48px; position: relative; overflow: hidden;
        }
        .auth-panel-visual::before {
          content: ''; position: absolute; top: -120px; right: -120px;
          width: 360px; height: 360px; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,162,75,0.18) 0%, transparent 70%);
        }
        .auth-visual-content { max-width: 380px; position: relative; z-index: 2; }
        .auth-visual-content h2 {
          font-size: 30px; color: var(--text-on-ink); margin-bottom: 16px; line-height: 1.25;
        }
        .auth-visual-content p {
          font-size: 14.5px; color: var(--text-on-ink-dim); line-height: 1.7; margin-bottom: 36px;
        }
        .auth-stats { display: flex; gap: 32px; }
        .auth-stats > div { display: flex; flex-direction: column; gap: 4px; }
        .auth-stats strong { font-family: 'Fraunces', serif; font-size: 19px; color: var(--brass); }
        .auth-stats span { font-size: 12px; color: var(--text-on-ink-dim); }

        @media (max-width: 880px) {
          .auth-panel-visual { display: none; }
        }
      `}</style>
    </div>
  );
}
