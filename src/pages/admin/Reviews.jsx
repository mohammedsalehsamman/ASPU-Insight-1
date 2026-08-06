import { useEffect, useState, useCallback } from 'react';
import { Warning, ArrowClockwise, CaretLeft, CaretRight } from '@phosphor-icons/react';
import AdminLayout from './AdminLayout';
import { getEditorReviews, getAssistantReviews, getCommittees } from '../../api/admin';
import { useAdminLang, adminT } from './adminI18n';

/* أعمدة مفضّلة لكل تبويب — تُعرض إذا كانت موجودة بالبيانات، وإلا تُشتق الأعمدة تلقائياً من أول عنصر */
const PREFERRED_COLUMNS = {
  editor: ['paper_title', 'editor_name', 'decision', 'notes', 'created_at'],
  assistant: ['paper_title', 'assistant_name', 'decision', 'notes', 'created_at'],
  committees: ['paper_title', 'members', 'status', 'created_at'],
};

const COL_LABELS = {
  ar: {
    paper_title: 'البحث', editor_name: 'المحرر', assistant_name: 'المساعد', decision: 'القرار',
    notes: 'الملاحظات', created_at: 'التاريخ', members: 'الأعضاء', status: 'الحالة',
  },
  en: {
    paper_title: 'Paper', editor_name: 'Editor', assistant_name: 'Assistant', decision: 'Decision',
    notes: 'Notes', created_at: 'Date', members: 'Members', status: 'Status',
  },
};

function humanize(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCell(key, value, lang) {
  if (value == null) return '—';
  if (key === 'created_at' || key === 'updated_at') {
    const d = new Date(value);
    return isNaN(d) ? String(value) : d.toLocaleString(lang === 'ar' ? 'ar' : 'en');
  }
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'object' ? (v.full_name || v.name || v.email || JSON.stringify(v)) : v)).join(', ');
  }
  if (typeof value === 'object') return value.full_name || value.name || value.title || JSON.stringify(value);
  const str = String(value);
  return str.length > 80 ? `${str.slice(0, 80)}…` : str;
}

function GenericTable({ items, tabKey, lang }) {
  const t = (key) => adminT(lang, key);
  if (items.length === 0) {
    return (
      <div className="admin-state-center">
        <span className="admin-empty-title">{t('no_results')}</span>
      </div>
    );
  }

  const preferred = PREFERRED_COLUMNS[tabKey].filter((k) => k in items[0]);
  const columns = preferred.length > 0
    ? preferred
    : Object.keys(items[0]).filter((k) => typeof items[0][k] !== 'object' || Array.isArray(items[0][k])).slice(0, 6);

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{COL_LABELS[lang]?.[c] ?? humanize(c)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id ?? i}>
              {columns.map((c) => (
                <td key={c}>{formatCell(c, item[c], lang)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  { key: 'editor', fetcher: getEditorReviews },
  { key: 'assistant', fetcher: getAssistantReviews },
  { key: 'committees', fetcher: getCommittees },
];

const TAB_TITLES = {
  editor: { ar: 'مراجعات المحررين', en: 'Editor Reviews' },
  assistant: { ar: 'مراجعات المساعدين', en: 'Assistant Reviews' },
  committees: { ar: 'اللجان', en: 'Committees' },
};

export default function Reviews() {
  const [lang] = useAdminLang();
  const t = (key) => adminT(lang, key);
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState('editor');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tab = TABS.find((tb) => tb.key === activeTab);
      const data = await tab.fetcher({ page });
      if (Array.isArray(data)) {
        setItems(data);
        setCount(data.length);
        setNextUrl(null);
        setPrevUrl(null);
      } else {
        setItems(data.results ?? []);
        setCount(data.count ?? null);
        setNextUrl(data.next ?? null);
        setPrevUrl(data.previous ?? null);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [activeTab]);

  return (
    <AdminLayout>
      <div className="admin-page-head">
        <div>
          <div className="admin-page-title">{t('reviews')}</div>
          <div className="admin-page-sub">
            {isAr ? 'عرض شامل لمراجعات المحررين والمساعدين ولجان التحكيم' : 'Overview of editor reviews, assistant reviews, and committees'}
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map((tb) => (
          <button
            key={tb.key}
            className={`admin-tab ${activeTab === tb.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tb.key)}
          >
            {TAB_TITLES[tb.key][lang]}
          </button>
        ))}
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
          <button className="admin-btn admin-btn-primary" onClick={fetchData} style={{ marginTop: 6 }}>
            <ArrowClockwise size={14} weight="bold" />
            {t('retry')}
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <GenericTable items={items} tabKey={activeTab} lang={lang} />

          {(nextUrl || prevUrl) && (
            <div className="admin-pagination">
              <button className="admin-btn admin-btn-sm" disabled={!prevUrl} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                {isAr ? <CaretRight size={14} /> : <CaretLeft size={14} />}
                {t('prev')}
              </button>
              <span style={{ fontSize: 13, color: 'var(--tx2)' }}>{count != null ? count : ''}</span>
              <button className="admin-btn admin-btn-sm" disabled={!nextUrl} onClick={() => setPage((p) => p + 1)}>
                {t('next')}
                {isAr ? <CaretLeft size={14} /> : <CaretRight size={14} />}
              </button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
