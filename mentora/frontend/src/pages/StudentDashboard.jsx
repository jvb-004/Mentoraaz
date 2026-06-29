import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatMonth(iso) {
  return new Date(iso).toLocaleString('az', { month: 'short' }).toUpperCase();
}
function formatDay(iso) {
  return new Date(iso).getDate();
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('az', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Returns one of three states for the Join button:
 *   'active'   — within the 10-min window before start until end
 *   'soon'     — more than 10 min away (show how long)
 *   'ended'    — session is over
 */
function getJoinState(startIso, durationMinutes) {
  const now = Date.now();
  const start = new Date(startIso).getTime();
  const end = start + durationMinutes * 60 * 1000;
  const windowOpen = start - 10 * 60 * 1000; // 10 min before start

  if (now >= windowOpen && now <= end) return 'active';
  if (now > end) return 'ended';
  return 'soon';
}

function msToHuman(ms) {
  const totalMin = Math.ceil(ms / 60000);
  if (totalMin < 60) return `${totalMin} dəq`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m ? `${h} saat ${m} dəq` : `${h} saat`;
}

// ─── sub-components ───────────────────────────────────────────────────────────

function MetricCard({ icon, iconBg, label, value }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB',
      padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: iconBg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 22, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function JoinButton({ session }) {
  const [state, setState] = useState(() => getJoinState(session.start_time, session.duration_minutes));
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const tick = () => {
      const s = getJoinState(session.start_time, session.duration_minutes);
      setState(s);
      if (s === 'soon') {
        const ms = new Date(session.start_time).getTime() - 10 * 60 * 1000 - Date.now();
        setTimeLeft(ms > 0 ? msToHuman(ms) : null);
      }
    };
    tick();
    const t = setInterval(tick, 15000); // re-check every 15 seconds
    return () => clearInterval(t);
  }, [session.start_time, session.duration_minutes]);

  const handleJoin = () => {
    const room = session.jitsi_room_id || `mentora-${session.id}`;
    window.open(`https://meet.jit.si/${room}`, '_blank', 'noopener');
  };

  if (state === 'ended') {
    return (
      <button disabled style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
        background: '#F3F4F6', color: '#9CA3AF', border: 'none', cursor: 'not-allowed',
      }}>
        <span>🎬</span> Bitdi
      </button>
    );
  }

  if (state === 'active') {
    return (
      <button onClick={handleJoin} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '9px 18px', borderRadius: 9, fontSize: 13.5, fontWeight: 700,
        background: '#0B7A75', color: '#fff', border: 'none', cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(11,122,117,0.3)',
        animation: 'pulse-join 2s infinite',
      }}>
        <span>🎥</span> Dərsə qoşul
      </button>
    );
  }

  // soon
  return (
    <button disabled title={timeLeft ? `${timeLeft} sonra aktiv olacaq` : ''} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
      background: '#F9FAFB', color: '#9CA3AF',
      border: '1px solid #E5E7EB', cursor: 'not-allowed',
    }}>
      <span>🎥</span>
      {timeLeft ? `${timeLeft} sonra` : 'Dərsə qoşul'}
    </button>
  );
}

function SessionRow({ session }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 0', borderBottom: '1px solid #F3F4F6',
    }}>
      {/* Date box */}
      <div style={{
        flexShrink: 0, width: 50, borderRadius: 10,
        background: '#F0FDF4', border: '1px solid #D1FAE5',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '7px 4px',
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', letterSpacing: '0.06em' }}>
          {formatMonth(session.start_time)}
        </span>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
          {formatDay(session.start_time)}
        </span>
      </div>

      {/* Session info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{session.subject}</span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100,
            background: '#EFF6FF', color: '#3B82F6',
          }}>{session.duration_minutes} dəq</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6B7280' }}>
            <span>🕐</span> {formatTime(session.start_time)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: '#0B7A75',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, flexShrink: 0,
            }}>
              {session.tutor_name?.[0]?.toUpperCase()}
            </div>
            {session.tutor_name} ilə
          </span>
        </div>
      </div>

      {/* Join button */}
      <div style={{ flexShrink: 0 }}>
        <JoinButton session={session} />
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seeding, setSeeding] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions/my', { credentials: 'include' });
      if (!res.ok) throw new Error('Sessiyalar yüklənə bilmədi');
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const seedDemo = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/sessions/seed-demo', { method: 'POST', credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      await fetchData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 600, margin: '48px auto', padding: '0 24px' }}>
      <div className="alert alert-error">{error}</div>
    </div>
  );

  const { upcoming = [], completed = [], hoursLearned = 0 } = data || {};

  return (
    <div style={{ background: '#F7F8FA', minHeight: 'calc(100vh - 68px)', padding: '36px 0 64px' }}>
      <style>{`
        @keyframes pulse-join {
          0%, 100% { box-shadow: 0 2px 8px rgba(11,122,117,0.3); }
          50% { box-shadow: 0 2px 20px rgba(11,122,117,0.55); }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 32, flexWrap:'wrap', gap: 16 }}>
          <div>
            <h1 style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 'clamp(24px, 3.5vw, 36px)',
              fontWeight: 700, color: '#111827', marginBottom: 6,
            }}>
              Xoş gəldin, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280' }}>Öyrənmə səfərinin ümumi görünüşü.</p>
          </div>
          <Link to="/search" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#0B7A75', color: '#fff', padding: '12px 22px',
            borderRadius: 10, fontWeight: 700, fontSize: 14.5, textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(11,122,117,0.25)',
          }}>
            🔍 Yeni müəllim tap
          </Link>
        </div>

        {/* ── Metric cards ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
          <MetricCard icon="📅" iconBg="#ECFDF5" label="Gələcək dərslər" value={upcoming.length} />
          <MetricCard icon="🎬" iconBg="#EFF6FF" label="Tamamlanmış dərslər" value={completed.length} />
          <MetricCard icon="⏱" iconBg="#ECFDF5" label="Öyrənilən saatlar" value={`${hoursLearned}s`} />
        </div>

        {/* ── Main split ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap: 20, alignItems:'flex-start' }}>

          {/* ── Left: Next Sessions ── */}
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB',
            padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 4 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 2 }}>Növbəti dərslər</h2>
                <p style={{ fontSize: 13.5, color: '#6B7280' }}>Gələcək günlər üçün cədvəlin.</p>
              </div>
              <Link to="/messages" style={{ fontSize: 13, fontWeight: 700, color: '#0B7A75', textDecoration: 'none' }}>
                Hamısına bax
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div style={{ textAlign:'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Planlanmış dərs yoxdur</h3>
                <p style={{ fontSize: 13.5, color: '#9CA3AF', marginBottom: 20 }}>
                  Müəllim taparaq ilk dərsinizi planlaşdırın.
                </p>
                <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                  <Link to="/search" style={{
                    padding: '9px 18px', borderRadius: 9, background:'#0B7A75', color:'#fff',
                    fontWeight:700, fontSize:13.5, textDecoration:'none',
                  }}>Müəllim tap</Link>
                  <button onClick={seedDemo} disabled={seeding} style={{
                    padding: '9px 18px', borderRadius: 9, background:'#F3F4F6',
                    color:'#374151', fontWeight:600, fontSize:13.5, border:'none', cursor:'pointer',
                  }}>
                    {seeding ? 'Yüklənir...' : '🧪 Demo dərs əlavə et'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {upcoming.map(s => <SessionRow key={s.id} session={s} />)}
              </div>
            )}
          </div>

          {/* ── Right: Quick Actions ── */}
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB',
            padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 18 }}>Sürətli əməliyyatlar</h2>

            {[
              {
                icon: '💬',
                iconBg: '#EFF6FF',
                title: 'Mesajlar',
                desc: 'Son söhbətlərinə bax',
                to: '/messages',
              },
              {
                icon: '⚙️',
                iconBg: '#F0FDF4',
                title: 'Profil parametrləri',
                desc: 'Şəxsi məlumatlarını yenilə',
                to: '/me',
              },
              {
                icon: '🔍',
                iconBg: '#FEF3C7',
                title: 'Müəllim tap',
                desc: 'Yeni mövzular üçün axtarış et',
                to: '/search',
              },
              {
                icon: '⭐',
                iconBg: '#FDF4FF',
                title: 'Mentora Pro',
                desc: 'Premium üstünlüklərini kəşf et',
                to: '/billing',
              },
            ].map((item, i, arr) => (
              <Link key={item.to} to={item.to} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 0',
                borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.paddingLeft = '4px'}
              onMouseLeave={e => e.currentTarget.style.paddingLeft = '0'}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: item.iconBg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 18, flexShrink: 0,
                }}>{item.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12.5, color: '#9CA3AF' }}>{item.desc}</div>
                </div>
                <span style={{ color: '#D1D5DB', fontSize: 16, flexShrink: 0 }}>›</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Completed sessions (collapsed summary) ── */}
        {completed.length > 0 && (
          <div style={{
            marginTop: 20, background: '#fff', borderRadius: 16,
            border: '1px solid #E5E7EB', padding: 24,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#111827', marginBottom: 16 }}>
              Tamamlanmış dərslər ({completed.length})
            </h2>
            {completed.slice(0, 3).map(s => (
              <div key={s.id} style={{
                display:'flex', alignItems:'center', gap:14,
                padding:'12px 0', borderBottom:'1px solid #F3F4F6',
                opacity: 0.75,
              }}>
                <div style={{
                  width:42, height:42, borderRadius:10, background:'#F3F4F6',
                  display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent:'center',
                }}>
                  <span style={{fontSize:9,fontWeight:700,color:'#9CA3AF',letterSpacing:'0.05em'}}>{formatMonth(s.start_time)}</span>
                  <span style={{fontSize:17,fontWeight:800,color:'#6B7280',lineHeight:1.1}}>{formatDay(s.start_time)}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:600,color:'#374151'}}>{s.subject}</div>
                  <div style={{fontSize:12.5,color:'#9CA3AF'}}>{s.tutor_name} ilə · {s.duration_minutes} dəq</div>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:'#059669',background:'#ECFDF5',padding:'3px 10px',borderRadius:100}}>✓ Tamamlandı</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
          .metrics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
