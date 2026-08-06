import { useEffect, useState, useCallback } from 'react';
import {
  MagnifyingGlass,
  Warning,
  ArrowClockwise,
  X,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import AdminLayout from './AdminLayout';
import { getDashboardPapers, getDashboardPaperDetail, assignEditor, getUsers, getResearchHistory } from '../../api/admin';
import { useAdminLang, adminT } from './adminI18n';

const STATUS_OPTIONS = ['pending', 'under_review', 'plagiarism_failed', 'plagiarism_passed', 'accepted', 'rejected', 'noted', 'published'];

const STATUS_LABELS = {
  ar: {
    pending: 'بانتظار المراجعة', under_review: 'قيد المراجعة', plagiarism_failed: 'فشل فحص الانتحال',
    plagiarism_passed: 'اجتاز فحص الانتحال', accepted: 'مقبول', rejected: 'مرفوض', noted: 'تمت الملاحظة', published: 'منشور',
  },
  en: {
    pending: 'Pending', under_review: 'Under Review', plagiarism_failed: 'Plagiarism Failed',
    plagiarism_passed: 'Plagiarism Passed', accepted: 'Accepted', rejected: 'Rejected', noted: 'Noted', published: 'Published',
  },
};

const STATUS_BADGE = {
  pending: 'admin-badge-amber', under_review: 'admin-badge-amber', plagiarism_failed: 'admin-badge-red',
  plagiarism_passed: 'admin-badge-blue', accepted: 'admin-badge-green', rejected: 'admin-badge-red',
  noted: 'admin-badge-blue', published: 'admin-badge-green',
};

function statusLabel(status, lang) {
  return STATUS_LABELS[lang]?.[status] ?? status;
}

/* ── Paper detail drawer ── */
function PaperDrawer({ paperId, lang, onClose, editors, onAssigned }) {
  const t = (key) => adminT(lang, key);
  const isAr = lang === 'ar';

  const [paper, setPaper] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingEditor, setSavingEditor] = useState(false);
  const [assignMsg, setAssignMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getDashboardPaperDetail(paperId),
      getResearchHistory(paperId).catch(() => []),
    ])
      .then(([detail, hist]) => {
        if (cancelled) return;
        setPaper(detail);
        const histArr = Array.isArray(hist) ? hist : (hist?.results ?? detail?.status_history ?? []);
        setHistory(Array.isArray(histArr) ? histArr : []);
      })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.detail || err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [paperId]);

  const handleAssign = async (e) => {
    const val = e.target.value;
    const editorId = val === '' ? null : Number(val);
    setSavingEditor(true);
    setAssignMsg(null);
    try {
      const updated = await assignEditor(paperId, editorId);
      setPaper((prev) => ({ ...prev, ...(updated ?? {}), editor_id: editorId }));
      setAssignMsg({ type: 'success', text: isAr ? 'تم تعيين المحرر بنجاح' : 'Editor assigned successfully' });
      onAssigned?.(paperId, editorId);
    } catch (err) {
      setAssignMsg({ type: 'error', text: isAr ? 'فشل تعيين المحرر' : 'Failed to assign editor' });
    } finally {
      setSavingEditor(false);
    }
  };

  return (
    <>
      <div className="admin-drawer-overlay open" onClick={onClose} />
      <div className="admin-drawer open">
        <div className="admin-drawer-head">
          <strong>{isAr ? 'تفاصيل البحث' : 'Paper Details'}</strong>
          <button className="admin-drawer-close" onClick={onClose}><X size={16} weight="bold" /></button>
        </div>

        <div className="admin-drawer-body">
          {loading && (
            <div className="admin-state-center">
              <div className="admin-spinner" />
              <span>{t('loading')}</span>
            </div>
          )}

          {!loading && error && (
            <div className="admin-state-center">
              <Warning size={30} weight="duotone" style={{ color: 'var(--ac)' }} />
              <span className="admin-empty-sub">{String(error)}</span>
            </div>
          )}

          {!loading && !error && paper && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{paper.title}</h2>
              <p style={{ fontSize: 13, color: 'var(--tx2)' }}>{paper.author_name}</p>

              <div className="admin-info-grid">
                <div className="admin-info-cell">
                  <div className="admin-info-label">{isAr ? 'الرقم المرجعي' : 'Reference ID'}</div>
                  <div className="admin-info-val">RES-{String(paper.id).padStart(3, '0')}</div>
                </div>
                <div className="admin-info-cell">
                  <div className="admin-info-label">{t('status')}</div>
                  <div className="admin-info-val">
                    <span className={`admin-badge ${STATUS_BADGE[paper.status] ?? 'admin-badge-gray'}`}>
                      {statusLabel(paper.status, lang)}
                    </span>
                  </div>
                </div>
                {paper.plagiarism_score != null && (
                  <div className="admin-info-cell">
                    <div className="admin-info-label">{isAr ? 'درجة الانتحال' : 'Plagiarism Score'}</div>
                    <div className="admin-info-val">{paper.plagiarism_score}%</div>
                  </div>
                )}
                <div className="admin-info-cell">
                  <div className="admin-info-label">{isAr ? 'وصول مفتوح مدفوع' : 'Paid Open Access'}</div>
                  <div className="admin-info-val">{paper.is_paid_open_access ? t('yes') : t('no')}</div>
                </div>
              </div>

              {paper.abstract && (
                <>
                  <div className="admin-sec-label">{isAr ? 'الملخص' : 'Abstract'}</div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.8, color: 'var(--tx)' }}>{paper.abstract}</p>
                </>
              )}

              <div className="admin-sec-label">{isAr ? 'تعيين محرر' : 'Assign Editor'}</div>
              <select
                className="admin-select"
                style={{ width: '100%' }}
                value={paper.editor_id ?? paper.editor?.id ?? ''}
                onChange={handleAssign}
                disabled={savingEditor}
              >
                <option value="">{isAr ? 'بدون محرر' : 'No Editor'}</option>
                {editors.map((ed) => (
                  <option key={ed.user_id ?? ed.id} value={ed.user_id ?? ed.id}>{ed.full_name || ed.email}</option>
                ))}
              </select>
              {assignMsg && <p className={`admin-msg admin-msg-${assignMsg.type}`}>{assignMsg.text}</p>}

              <div className="admin-sec-label">{isAr ? 'سجل تغيّر الحالة' : 'Status History'}</div>
              {history.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--tx2)' }}>{isAr ? 'لا يوجد سجل بعد' : 'No history yet'}</p>
              ) : (
                history.map((h, i) => (
                  <div className="admin-history-item" key={h.id ?? i}>
                    <div>
                      <strong>{h.new_status ?? h.status ?? h.action ?? '—'}</strong>
                      {h.changed_by_name && <span style={{ color: 'var(--tx2)' }}> — {h.changed_by_name}</span>}
                      {h.created_at && <div style={{ fontSize: 11.5, color: 'var(--tx2)' }}>{new Date(h.created_at).toLocaleString(isAr ? 'ar' : 'en')}</div>}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function Papers() {
  const [lang] = useAdminLang();
  const t = (key) => adminT(lang, key);
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
      setError(err.response?.data?.detail || err.message);
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

  const handleAssigned = (paperId, editorId) => {
    setPapers((prev) => prev.map((p) => (p.id === paperId ? { ...p, editor_id: editorId } : p)));
  };

  return (
    <AdminLayout>
      <div className="admin-page-head">
        <div>
          <div className="admin-page-title">{t('papers')}</div>
          <div className="admin-page-sub">
            {isAr ? 'إشراف شامل على كل الأبحاث المقدَّمة وحالتها ومحرريها' : 'Full oversight of all submitted papers, status, and editors'}
          </div>
        </div>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <MagnifyingGlass size={15} weight="duotone" />
          <input
            type="text"
            placeholder={isAr ? 'ابحث بالعنوان أو الباحث...' : 'Search by title or author...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="admin-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">{t('all')}</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusLabel(s, lang)}</option>)}
        </select>

        <select className="admin-select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
          <option value="-created_at">{isAr ? 'الأحدث أولاً' : 'Newest First'}</option>
          <option value="created_at">{isAr ? 'الأقدم أولاً' : 'Oldest First'}</option>
          <option value="title">{isAr ? 'العنوان (أ-ي)' : 'Title (A-Z)'}</option>
        </select>
      </div>

      {loading && (
        <div className="admin-state-center">
          <div className="admin-spinner" />
          <span>{t('loading')}</span>
        </div>
      )}

      {!loading && error && (
        <div className="admin-state-center">
          <Warning size={36} weight="duotone" style={{ color: 'var(--ac)' }} />
          <span className="admin-empty-title">{t('error')}</span>
          <span className="admin-empty-sub">{String(error)}</span>
          <button className="admin-btn admin-btn-primary" onClick={fetchPapers} style={{ marginTop: 6 }}>
            <ArrowClockwise size={14} weight="bold" />
            {t('retry')}
          </button>
        </div>
      )}

      {!loading && !error && papers.length === 0 && (
        <div className="admin-state-center">
          <span className="admin-empty-title">{t('no_results')}</span>
          <span className="admin-empty-sub">{t('no_results_sub')}</span>
        </div>
      )}

      {!loading && !error && papers.length > 0 && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{isAr ? 'العنوان' : 'Title'}</th>
                  <th>{isAr ? 'الباحث' : 'Author'}</th>
                  <th>{t('status')}</th>
                  <th>{isAr ? 'المحرر' : 'Editor'}</th>
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
                      <td>{p.editor_name || editorObj?.full_name || (isAr ? 'غير معيّن' : 'Unassigned')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(nextUrl || prevUrl) && (
            <div className="admin-pagination">
              <button className="admin-btn admin-btn-sm" disabled={!prevUrl} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                {isAr ? <CaretRight size={14} /> : <CaretLeft size={14} />}
                {t('prev')}
              </button>
              <span style={{ fontSize: 13, color: 'var(--tx2)' }}>
                {count != null ? (isAr ? `${count} بحث` : `${count} papers`) : ''}
              </span>
              <button className="admin-btn admin-btn-sm" disabled={!nextUrl} onClick={() => setPage((p) => p + 1)}>
                {t('next')}
                {isAr ? <CaretLeft size={14} /> : <CaretRight size={14} />}
              </button>
            </div>
          )}
        </>
      )}

      {activePaperId && (
        <PaperDrawer
          paperId={activePaperId}
          lang={lang}
          editors={editors}
          onClose={() => setActivePaperId(null)}
          onAssigned={handleAssigned}
        />
      )}
    </AdminLayout>
  );
}
