import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ROTATING = ['Riyaziyyat', 'İngilis dili', 'Boks', 'Fortepiano', 'SAT hazırlığı', 'Biologiya', 'MMA', 'Rəsm'];

export default function HomePage() {
  const [idx, setIdx] = useState(0);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % ROTATING.length), 1800);
    return () => clearInterval(t);
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/search${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  };

  return (
    <div>
      {/* HERO */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-eyebrow">🎓 Bakıda №1 müəllim platforması</div>
          <h1 className="hero-title">
            <span className="rotating-word">{ROTATING[idx]}</span><br />
            üzrə mütəxəssis tap
          </h1>
          <p className="hero-sub">Hər müəllim şəxsən yoxlanılır. Diplom, sertifikat, real rəylər — uşağın üçün ən doğru seçim.</p>

          <form className="hero-search" onSubmit={search}>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={`${ROTATING[idx]} axtar...`}
              className="hero-input"
            />
            <button type="submit" className="btn btn-primary btn-lg">Müəllim tap</button>
          </form>

          <div className="hero-tags">
            {['Riyaziyyat', 'İngilis dili', 'SAT', 'IELTS', 'Boks', 'Fortepiano'].map(tag => (
              <button key={tag} className="hero-tag" onClick={() => navigate(`/search?q=${tag}`)}>{tag}</button>
            ))}
          </div>

          <div className="hero-stats">
            <div><strong>200+</strong><span>Yoxlanılmış müəllim</span></div>
            <div><strong>4.9★</strong><span>Orta reytinq</span></div>
            <div><strong>1 gün</strong><span>Ortalama cavab vaxtı</span></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background:'var(--grey-50)' }}>
        <div className="container">
          <div className="section-head">
            <h2>3 addımda müəllim tap</h2>
            <p>Mürəkkəb proses yox — axtar, yaz, başla.</p>
          </div>
          <div className="steps-grid">
            {[
              { n:'1', title:'Axtar', desc:'Fənn, qiymət və yerə görə filtr et. Bütün müəllimlər təsdiqlənmiş.' },
              { n:'2', title:'Əlaqə saxla', desc:'Müəllimlə birbaşa mesajlaş. Suallarını ver, cədvəli müzakirə et.' },
              { n:'3', title:'Dərsə başla', desc:'Uyğun gəldikdə ilk dərsi planlaşdır. Uğur sənindedir.' },
            ].map(s => (
              <div key={s.n} className="step-card">
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Bütün sahələr bir yerdə</h2>
          </div>
          <div className="cats-grid">
            {[
              { emoji:'📘', label:'Akademik', sub:'Riyaziyyat, Fizika, SAT, DİM', slug:'akademik' },
              { emoji:'🗣', label:'Dil', sub:'İngilis, Rus, IELTS, TOEFL', slug:'dil' },
              { emoji:'🥊', label:'İdman', sub:'Boks, MMA, Üzgüçülük', slug:'idman' },
              { emoji:'🎨', label:'İncəsənət', sub:'Musiqi, Rəsm, Rəqs', slug:'incesenet' },
            ].map(c => (
              <button key={c.slug} className="cat-card" onClick={() => navigate(`/search?category=${c.slug}`)}>
                <span className="cat-emoji">{c.emoji}</span>
                <strong>{c.label}</strong>
                <span>{c.sub}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="section" style={{ background:'var(--grey-50)' }}>
        <div className="container">
          <div className="section-head">
            <h2>Niyə Mentora?</h2>
          </div>
          <div className="trust-grid">
            {[
              { icon:'✅', title:'Hər müəllim yoxlanılır', desc:'Diplom, sertifikat və iş təcrübəsi komandamız tərəfindən yoxlanılır. Saxta profil yoxdur.' },
              { icon:'💬', title:'Birbaşa əlaqə', desc:'Müəllimlə platformada mesajlaşırsın. Xarici nömrəyə ehtiyac yoxdur.' },
              { icon:'⭐', title:'Real rəylər', desc:'Rəy yalnız dərs alanlar tərəfindən yazıla bilər. Süni rəy mümkün deyil.' },
              { icon:'🔒', title:'Məlumatlar qorunur', desc:'Şəxsi məlumatların Azərbaycan Şəxsi Məlumatlar Qanununa uyğun qorunur.' },
            ].map(t => (
              <div key={t.title} className="trust-card">
                <span className="trust-icon">{t.icon}</span>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <div className="container" style={{ textAlign:'center' }}>
          <h2>Müəllim kimi qoşulmaq istəyirsən?</h2>
          <p>Profilini yarat, sənədlərini yüklə — tələbələr sənə gəlsin.</p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap', marginTop:28 }}>
            <a href="/signup" className="btn btn-white btn-lg">Müəllim kimi qeydiyyat</a>
            <a href="/search" className="btn btn-outline btn-lg" style={{ borderColor:'rgba(255,255,255,0.5)', color:'#fff' }}>Müəllim axtar</a>
          </div>
        </div>
      </section>

      <style>{`
        .hero-section { background: linear-gradient(135deg, #0B7A75 0%, #0D9590 50%, #0B7A75 100%); color: #fff; padding: 80px 0 72px; }
        .hero-eyebrow { display: inline-block; background: rgba(255,255,255,0.15); padding: 6px 16px; border-radius: 100px; font-size: 13.5px; font-weight: 600; margin-bottom: 24px; }
        .hero-title { font-size: clamp(36px, 5vw, 60px); font-weight: 800; line-height: 1.1; margin-bottom: 18px; color: #fff; }
        .rotating-word { display: inline-block; min-width: 280px; transition: opacity 0.3s; }
        .hero-sub { font-size: 17px; color: rgba(255,255,255,0.82); max-width: 520px; margin-bottom: 32px; line-height: 1.65; }
        .hero-search { display: flex; gap: 10px; max-width: 560px; margin-bottom: 20px; }
        .hero-input { flex: 1; padding: 14px 18px; border-radius: var(--radius-md); border: none; font-size: 15px; outline: none; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .hero-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; }
        .hero-tag { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25); padding: 6px 14px; border-radius: 100px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .hero-tag:hover { background: rgba(255,255,255,0.25); }
        .hero-stats { display: flex; gap: 40px; flex-wrap: wrap; }
        .hero-stats > div { display: flex; flex-direction: column; gap: 2px; }
        .hero-stats strong { font-size: 22px; font-weight: 800; color: #fff; }
        .hero-stats span { font-size: 12.5px; color: rgba(255,255,255,0.7); }
        .section-head { text-align: center; margin-bottom: 48px; }
        .section-head h2 { font-size: clamp(26px, 3.5vw, 36px); font-weight: 800; margin-bottom: 10px; }
        .section-head p { font-size: 16px; color: var(--grey-500); }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .step-card { background: #fff; border-radius: var(--radius-lg); padding: 28px; box-shadow: var(--shadow-sm); }
        .step-num { width: 40px; height: 40px; border-radius: 50%; background: var(--teal); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 17px; margin-bottom: 16px; }
        .step-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
        .step-card p { font-size: 14px; color: var(--grey-500); line-height: 1.65; }
        .cats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .cat-card { background: #fff; border: 1.5px solid var(--grey-200); border-radius: var(--radius-lg); padding: 24px 20px; text-align: left; display: flex; flex-direction: column; gap: 6px; cursor: pointer; transition: all 0.18s; }
        .cat-card:hover { border-color: var(--teal); box-shadow: var(--shadow-md); transform: translateY(-2px); }
        .cat-emoji { font-size: 28px; margin-bottom: 4px; }
        .cat-card strong { font-size: 16px; font-weight: 700; color: var(--grey-900); }
        .cat-card span { font-size: 13px; color: var(--grey-400); }
        .trust-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .trust-card { background: #fff; border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm); }
        .trust-icon { font-size: 28px; display: block; margin-bottom: 12px; }
        .trust-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
        .trust-card p { font-size: 13.5px; color: var(--grey-500); line-height: 1.65; }
        .cta-band { background: var(--teal-dark); color: #fff; padding: 72px 0; }
        .cta-band h2 { font-size: clamp(24px, 3vw, 34px); font-weight: 800; color: #fff; margin-bottom: 10px; }
        .cta-band p { font-size: 16px; color: rgba(255,255,255,0.75); }
        @media (max-width: 900px) {
          .steps-grid { grid-template-columns: 1fr; }
          .cats-grid { grid-template-columns: 1fr 1fr; }
          .trust-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .hero-search { flex-direction: column; }
          .cats-grid { grid-template-columns: 1fr 1fr; }
          .trust-grid { grid-template-columns: 1fr; }
          .hero-stats { gap: 24px; }
        }
      `}</style>
    </div>
  );
}
