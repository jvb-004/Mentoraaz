import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const CRED_TYPES = [
  { value: 'diploma', label: 'Diplom' },
  { value: 'certificate', label: 'Sertifikat' },
  { value: 'link', label: 'Xarici keçid (LinkedIn, GitHub...)' },
  { value: 'work_history', label: 'İş təcrübəsi' },
];

const STATUS = { unverified:'Yoxlanılmayıb', pending:'Yoxlanılır', verified:'Təsdiqlənmiş', rejected:'Rədd edilib' };
const STATUS_COLOR = { unverified:'var(--grey-400)', pending:'#92400E', verified:'var(--success)', rejected:'var(--danger)' };

export default function MyProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('account');
  const [tutor, setTutor] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Account fields
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || 'Bakı');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.photo_url || null);

  // Tutor profile fields
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [price, setPrice] = useState('');
  const [district, setDistrict] = useState('');
  const [online, setOnline] = useState(false);
  const [inPerson, setInPerson] = useState(true);

  // Subject form
  const [newCat, setNewCat] = useState('akademik');
  const [newSubj, setNewSubj] = useState('');

  // Credential form
  const [credType, setCredType] = useState('diploma');
  const [credTitle, setCredTitle] = useState('');
  const [credUrl, setCredUrl] = useState('');
  const [credFile, setCredFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const loadTutor = () => {
    if (!user?.is_tutor) return;
    api.myTutorProfile().then(d => {
      setTutor(d.tutor);
      setHeadline(d.tutor.headline || '');
      setBio(d.tutor.bio || '');
      setPrice(d.tutor.price_amount || '');
      setDistrict(d.tutor.district || '');
      setOnline(!!d.tutor.offers_online);
      setInPerson(d.tutor.offers_in_person !== 0);
    }).catch(() => {});
  };

  useEffect(() => { loadTutor(); }, [user]);

  const flash = (m, isErr = false) => {
    if (isErr) setErr(m); else setMsg(m);
    setTimeout(() => { setMsg(''); setErr(''); }, 3500);
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let photoUrl = user?.photo_url;
      if (photoFile) {
        const r = await api.uploadFile(photoFile);
        photoUrl = r.url;
      }
      await api.updateMe({ name, city, photo_url: photoUrl });
      updateUser({ name, city, photo_url: photoUrl });
      flash('Hesab məlumatları yeniləndi');
    } catch (e) { flash(e.message, true); }
    finally { setSaving(false); }
  };

  const saveTutor = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateMyTutorProfile({ headline, bio, price_amount: Number(price), district, offers_online: online, offers_in_person: inPerson });
      flash('Profil yeniləndi');
      loadTutor();
    } catch (e) { flash(e.message, true); }
    finally { setSaving(false); }
  };

  const addSubject = async () => {
    if (!newSubj.trim()) return;
    try { await api.addSubject({ category_slug: newCat, subject_name: newSubj }); setNewSubj(''); loadTutor(); }
    catch (e) { flash(e.message, true); }
  };

  const removeSubject = async (id) => {
    try { await api.removeSubject(id); loadTutor(); }
    catch (e) { flash(e.message, true); }
  };

  const submitCred = async () => {
    if (!credTitle.trim()) return;
    setUploading(true);
    try {
      let fileUrl = null;
      if (credFile) { const r = await api.uploadFile(credFile); fileUrl = r.url; }
      await api.addCredential({ type: credType, title: credTitle, file_url: fileUrl, external_url: credUrl || null });
      setCredTitle(''); setCredUrl(''); setCredFile(null);
      flash('Sənəd yükləndi, yoxlanılacaq');
      loadTutor();
    } catch (e) { flash(e.message, true); }
    finally { setUploading(false); }
  };

  const handlePhotoChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  return (
    <div className="profile-page">
      <div className="container profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-avatar-wrap">
            <div className="profile-big-avatar" onClick={() => fileInputRef.current?.click()}>
              {photoPreview ? <img src={photoPreview} alt="" /> : <span>{user?.name?.[0]?.toUpperCase()}</span>}
              <div className="avatar-edit-overlay">📷</div>
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoChange} style={{display:'none'}} />
            <div className="profile-user-name">{user?.name}</div>
            <div className="profile-user-email">{user?.email}</div>
            <div className="profile-role-badge">{user?.is_tutor ? '👩‍🏫 Müəllim' : '🎓 Tələbə / Valideyn'}</div>
          </div>
          <nav className="profile-nav">
            <button className={`pnav-btn${tab === 'account' ? ' active' : ''}`} onClick={() => setTab('account')}>Hesab məlumatları</button>
            {user?.is_tutor && <>
              <button className={`pnav-btn${tab === 'tutor' ? ' active' : ''}`} onClick={() => setTab('tutor')}>Müəllim profili</button>
              <button className={`pnav-btn${tab === 'subjects' ? ' active' : ''}`} onClick={() => setTab('subjects')}>Fənlər</button>
              <button className={`pnav-btn${tab === 'creds' ? ' active' : ''}`} onClick={() => setTab('creds')}>Sənədlər</button>
            </>}
          </nav>
        </aside>

        <div className="profile-content">
          {msg && <div className="alert alert-success">{msg}</div>}
          {err && <div className="alert alert-error">{err}</div>}

          {tab === 'account' && (
            <div className="card profile-panel">
              <h2>Hesab məlumatları</h2>
              <form onSubmit={saveAccount}>
                <div className="field"><label>Ad Soyad</label>
                  <input value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="field"><label>Şəhər</label>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="Bakı" />
                </div>
                <div className="field"><label>E-poçt</label>
                  <input value={user?.email} disabled style={{background:'var(--grey-50)', color:'var(--grey-400)'}} />
                  <div className="field-hint">E-poçt dəyişdirilə bilməz</div>
                </div>
                {photoFile && <div className="alert alert-info">Yeni foto seçilib — yadda saxlamağı unutma.</div>}
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" style={{borderTopColor:'#fff'}} /> : 'Yadda saxla'}
                </button>
              </form>
            </div>
          )}

          {tab === 'tutor' && tutor && (
            <div className="card profile-panel">
              <div className="panel-header">
                <h2>Müəllim profili</h2>
                <span style={{fontSize:13,fontWeight:700,color:STATUS_COLOR[tutor.verification_status]}}>
                  ● {STATUS[tutor.verification_status]}
                </span>
              </div>
              {tutor.verification_status === 'pending' && (
                <div className="alert alert-warning" style={{marginBottom:16}}>Sənədlərin yoxlanılır. Təsdiq edildikdən sonra profilin axtarışda görünəcək.</div>
              )}
              {tutor.verification_status === 'unverified' && (
                <div className="alert alert-info" style={{marginBottom:16}}>Profilin hələ görünmür. "Sənədlər" bölməsindən diplom və ya sertifikat yüklə.</div>
              )}
              <form onSubmit={saveTutor}>
                <div className="field"><label>Başlıq</label>
                  <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Məs: Riyaziyyat müəllimi · SAT hazırlığı" />
                </div>
                <div className="field"><label>Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Özün haqqında qısa məlumat, təcrübən, metodların..." />
                </div>
                <div style={{display:'flex',gap:12}}>
                  <div className="field" style={{flex:1}}><label>Qiymət (₼/saat)</label>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="35" />
                  </div>
                  <div className="field" style={{flex:1}}><label>Rayon</label>
                    <input value={district} onChange={e => setDistrict(e.target.value)} placeholder="Nəsimi" />
                  </div>
                </div>
                <div style={{display:'flex',gap:24,marginBottom:18}}>
                  <label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,fontWeight:500,cursor:'pointer'}}>
                    <input type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)} style={{accentColor:'var(--teal)',width:'auto'}} />
                    Onlayn dərs verirəm
                  </label>
                  <label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,fontWeight:500,cursor:'pointer'}}>
                    <input type="checkbox" checked={inPerson} onChange={e => setInPerson(e.target.checked)} style={{accentColor:'var(--teal)',width:'auto'}} />
                    Üz-üzə dərs verirəm
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" style={{borderTopColor:'#fff'}} /> : 'Yadda saxla'}
                </button>
              </form>
            </div>
          )}

          {tab === 'subjects' && tutor && (
            <div className="card profile-panel">
              <h2>Fənlər</h2>
              <p style={{color:'var(--grey-400)',fontSize:13.5,marginBottom:20}}>Tədris etdiyin fənləri əlavə et. Bunlar axtarışda görünəcək.</p>
              {tutor.subjects?.map(s => (
                <div key={s.id} className="subj-row">
                  <span>{s.category_name} — <strong>{s.subject_name}</strong></span>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeSubject(s.id)} style={{color:'var(--danger)'}}>Sil</button>
                </div>
              ))}
              <div className="add-subj-row">
                <select value={newCat} onChange={e => setNewCat(e.target.value)} className="add-subj-select">
                  <option value="akademik">📘 Akademik</option>
                  <option value="idman">🥊 İdman</option>
                  <option value="incesenet">🎨 İncəsənət</option>
                  <option value="dil">🗣 Dil</option>
                </select>
                <input className="add-subj-input" value={newSubj} onChange={e => setNewSubj(e.target.value)} placeholder="Fənn adı (məs. SAT Riyaziyyat)" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubject())} />
                <button className="btn btn-outline" onClick={addSubject}>Əlavə et</button>
              </div>
            </div>
          )}

          {tab === 'creds' && tutor && (
            <div className="card profile-panel">
              <h2>Sənədlər və sertifikatlar</h2>
              <p style={{color:'var(--grey-400)',fontSize:13.5,marginBottom:20}}>Ən azı bir sənəd yüklə ki, profilin axtarışda görünsün. Yoxlanılma adətən 24 saat ərzində tamamlanır.</p>

              {tutor.credentials?.map(c => (
                <div key={c.id} className="cred-list-row">
                  <div>
                    <strong style={{fontSize:14}}>{c.title}</strong>
                    <span style={{fontSize:12,color:'var(--grey-400)',marginLeft:8}}>({c.type})</span>
                  </div>
                  <span style={{fontSize:12.5,fontWeight:700,color:STATUS_COLOR[c.review_status]}}>
                    {STATUS[c.review_status] || c.review_status}
                  </span>
                </div>
              ))}

              <div className="cred-form">
                <h3>Yeni sənəd əlavə et</h3>
                <div className="field"><label>Növ</label>
                  <select value={credType} onChange={e => setCredType(e.target.value)}>
                    {CRED_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="field"><label>Başlıq</label>
                  <input value={credTitle} onChange={e => setCredTitle(e.target.value)} placeholder="Məs: BDU Riyaziyyat fakültəsi diplomu" />
                </div>
                <div className="field"><label>Xarici keçid (istəyə bağlı)</label>
                  <input value={credUrl} onChange={e => setCredUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="field"><label>Fayl yüklə (PDF, JPG, PNG)</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e => setCredFile(e.target.files[0])} />
                </div>
                <button className="btn btn-primary" onClick={submitCred} disabled={uploading || !credTitle.trim()}>
                  {uploading ? <span className="spinner" style={{borderTopColor:'#fff'}} /> : 'Sənədi göndər'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-page { padding: 40px 0 80px; background: var(--grey-50); min-height: calc(100vh - 68px); }
        .profile-layout { display: grid; grid-template-columns: 260px 1fr; gap: 28px; align-items: flex-start; }
        .profile-sidebar { position: sticky; top: 88px; }
        .profile-avatar-wrap { background: #fff; border: 1px solid var(--grey-200); border-radius: var(--radius-lg); padding: 24px; text-align: center; margin-bottom: 12px; }
        .profile-big-avatar { width: 80px; height: 80px; border-radius: 50%; background: var(--teal-light); color: var(--teal); display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; margin: 0 auto 14px; cursor: pointer; position: relative; overflow: hidden; }
        .profile-big-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-edit-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; font-size: 20px; }
        .profile-big-avatar:hover .avatar-edit-overlay { opacity: 1; }
        .profile-user-name { font-size: 15.5px; font-weight: 700; }
        .profile-user-email { font-size: 12.5px; color: var(--grey-400); margin-top: 2px; }
        .profile-role-badge { display: inline-block; margin-top: 10px; font-size: 12px; font-weight: 700; background: var(--teal-light); color: var(--teal); padding: 4px 12px; border-radius: 100px; }
        .profile-nav { background: #fff; border: 1px solid var(--grey-200); border-radius: var(--radius-lg); padding: 8px; display: flex; flex-direction: column; gap: 2px; }
        .pnav-btn { text-align: left; background: none; border: none; padding: 11px 14px; border-radius: 9px; font-size: 14px; font-weight: 500; color: var(--grey-600); transition: all 0.14s; }
        .pnav-btn:hover { background: var(--grey-50); color: var(--grey-900); }
        .pnav-btn.active { background: var(--teal-light); color: var(--teal); font-weight: 700; }
        .profile-content { min-width: 0; }
        .profile-panel { padding: 28px; }
        .profile-panel h2 { font-size: 18px; font-weight: 800; margin-bottom: 20px; }
        .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .panel-header h2 { margin-bottom: 0; }
        .subj-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--grey-100); font-size: 14px; }
        .subj-row:last-of-type { border-bottom: none; }
        .add-subj-row { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
        .add-subj-select { padding: 10px 12px; border: 1.5px solid var(--grey-200); border-radius: var(--radius-md); font-size: 13.5px; font-family: inherit; }
        .add-subj-input { flex: 1; padding: 10px 14px; border: 1.5px solid var(--grey-200); border-radius: var(--radius-md); font-size: 13.5px; font-family: inherit; min-width: 160px; }
        .cred-list-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--grey-100); }
        .cred-form { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--grey-200); }
        .cred-form h3 { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
        @media (max-width: 768px) {
          .profile-layout { grid-template-columns: 1fr; }
          .profile-sidebar { position: static; }
        }
      `}</style>
    </div>
  );
}
