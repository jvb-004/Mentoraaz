import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import TutorCard from '../components/TutorCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tutors, setTutors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [online, setOnline] = useState(false);
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => { api.categories().then(d => setCategories(d.categories)).catch(() => {}); }, []);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const { tutors } = await api.searchTutors({ q, category, online: online ? '1' : '', maxPrice });
      setTutors(tutors);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [q, category, online, maxPrice]);

  useEffect(() => {
    const t = setTimeout(search, 280);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="search-page">
      <div className="search-header-bar">
        <div className="container">
          <h1>Müəllim tap</h1>
          <div className="search-top-row">
            <input className="search-main-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Fənn, ad axtar..." />
          </div>
          <div className="search-cat-pills">
            <button className={`cat-pill${category === '' ? ' active' : ''}`} onClick={() => setCategory('')}>Hamısı</button>
            {categories.map(c => (
              <button key={c.slug} className={`cat-pill${category === c.slug ? ' active' : ''}`} onClick={() => setCategory(category === c.slug ? '' : c.slug)}>
                {c.icon} {c.name_az}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container search-body">
        <aside className="search-sidebar">
          <h3>Süzgəclər</h3>
          <div className="field" style={{ marginTop: 16 }}>
            <label>Maks. qiymət (₼/saat)</label>
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Məs. 50" />
          </div>
          <label className="checkbox-label">
            <input type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)} />
            Yalnız onlayn
          </label>
        </aside>

        <div className="search-results">
          <p className="results-count">
            {loading ? 'Axtarılır...' : `${tutors.length} müəllim tapıldı`}
          </p>

          {!loading && tutors.length === 0 && (
            <div className="empty-state" style={{ marginTop: 48 }}>
              <h3>Nəticə tapılmadı</h3>
              <p>Süzgəcləri dəyişməyi sına, ya da daha ümumi axtarış et.</p>
            </div>
          )}

          <div className="results-grid">
            {tutors.map(t => <TutorCard key={t.id} tutor={t} />)}
          </div>
        </div>
      </div>

      <style>{`
        .search-header-bar { background: var(--grey-50); border-bottom: 1px solid var(--grey-200); padding: 28px 0; }
        .search-header-bar h1 { font-size: 26px; font-weight: 800; margin-bottom: 16px; }
        .search-main-input { width: 100%; max-width: 500px; padding: 13px 18px; border: 1.5px solid var(--grey-200); border-radius: var(--radius-lg); font-size: 15px; outline: none; background: #fff; }
        .search-main-input:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(11,122,117,0.1); }
        .search-top-row { margin-bottom: 14px; }
        .search-cat-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .cat-pill { padding: 7px 16px; border-radius: 100px; border: 1.5px solid var(--grey-200); font-size: 13.5px; font-weight: 600; background: #fff; color: var(--grey-600); cursor: pointer; transition: all 0.15s; }
        .cat-pill:hover { border-color: var(--teal); color: var(--teal); }
        .cat-pill.active { background: var(--teal); border-color: var(--teal); color: #fff; }
        .search-body { display: flex; gap: 32px; padding-top: 32px; padding-bottom: 64px; align-items: flex-start; }
        .search-sidebar { width: 220px; flex-shrink: 0; background: #fff; border: 1px solid var(--grey-200); border-radius: var(--radius-lg); padding: 20px; position: sticky; top: 88px; }
        .search-sidebar h3 { font-size: 14.5px; font-weight: 700; color: var(--grey-700); }
        .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: var(--grey-700); cursor: pointer; }
        .checkbox-label input { width: auto; accent-color: var(--teal); }
        .search-results { flex: 1; min-width: 0; }
        .results-count { font-size: 14px; color: var(--grey-400); margin-bottom: 20px; }
        .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        @media (max-width: 768px) {
          .search-body { flex-direction: column; }
          .search-sidebar { width: 100%; position: static; }
        }
      `}</style>
    </div>
  );
}
