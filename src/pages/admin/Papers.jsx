import { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { getDashboardPapers, getUsers } from '../../api/admin';
import { useAdminLang, adminT } from './adminI18n';
import StateCenter from '../../components/admin/StateCenter';
import Pagination from '../../components/admin/Pagination';
import SearchBox from '../../components/admin/SearchBox';
import PaperDrawer, { STATUS_OPTIONS, STATUS_BADGE, statusLabel } from '../../components/admin/PaperDrawer';
import { getErrorMessage } from '../../i18n/errorMessages';

export default function Papers() {
  const [lang] = useAdminLang();
  const t = (key, vars) => adminT(lang, key, vars);
  const isAr = lang === 'ar';

  const [papers, setPapers] = useState([]);
  const [count, setCount] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [ordering, setOrdering] = useState('-created_at');

  const [editors, setEditors] = useState([]);
  const [activePaperId, setActivePaperId] = useState(null);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, ordering };
      if (search) params.search = search;
      if (status !== 'all') params.status = status;

      const data = await getDashboardPapers(params);
      if (Array.isArray(data)) {
        setPapers(data);
        setCount(data.length);
        setNextUrl(null);
        setPrevUrl(null);
      } else {
        setPapers(data.results ?? []);
        setCount(data.count ?? null);
        setNextUrl(data.next ?? null);
        setPrevUrl(data.previous ?? null);
      }
    } catch (err) {
      setError(getErrorMessage(err, lang));
    } finally {
      setLoading(false);
    }
  }, [page, ordering, search, status]);

  useEffect(() => {
    const tm = setTimeout(fetchPapers, 300);
    return () => clearTimeout(tm);
  }, [fetchPapers]);

  useEffect(() => { setPage(1); }, [search, status]);

  useEffect(() => {
    getUsers({ role: 'editor' })
      .then((data) => setEditors(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setEditors([]));
  }, []);

  return (
    <AdminLayout>
      <div className="admin-page-head">
        <div>
          <div className="admin-page-title">{t('papers')}</div>
          <div className="admin-page-sub">
            {t('papers_page_sub')}
          </div>
        </div>
      </div>

      <div className="admin-filter-bar">
        <SearchBox value={search} onChange={setSearch} placeholder={t('papers_search_ph')} />

        <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">{t('all')}</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusLabel(s, lang)}</option>)}
        </select>

        <select className="admin-select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
          <option value="-created_at">{t('newest_first')}</option>
          <option value="created_at">{t('oldest_first')}</option>
          <option value="title">{t('title_asc')}</option>
        </select>
      </div>

      <StateCenter loading={loading} error={error} onRetry={fetchPapers} isEmpty={papers.length === 0} t={t} />

      {!loading && !error && papers.length > 0 && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('title_col')}</th>
                  <th>{t('author_col')}</th>
                  <th>{t('status')}</th>
                  <th>{t('editor_col')}</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => {
                  const editorObj = editors.find((ed) => (ed.user_id ?? ed.id) === (p.editor_id ?? p.editor?.id));
                  return (
                    <tr key={p.id} onClick={() => setActivePaperId(p.id)} style={{ cursor: 'pointer' }}>
                      <td>{p.title}</td>
                      <td>{p.author_name}</td>
                      <td>
                        <span className={`admin-badge ${STATUS_BADGE[p.status] ?? 'admin-badge-gray'}`}>
                          <span className="admin-badge-dot" />
                          {statusLabel(p.status, lang)}
                        </span>
                      </td>
                      <td>{p.editor_name || editorObj?.full_name || t('unassigned')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            isAr={isAr}
            t={t}
            hasPrev={!!prevUrl}
            hasNext={!!nextUrl}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
            countLabel={count != null ? t('papers_count', { count }) : ''}
          />
        </>
      )}

      {activePaperId && (
        <PaperDrawer
          paperId={activePaperId}
          lang={lang}
          onClose={() => setActivePaperId(null)}
        />
      )}
    </AdminLayout>
  );
}
