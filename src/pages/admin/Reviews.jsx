import { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { getEditorReviews, getAssistantReviews, getCommittees } from '../../api/admin';
import { useAdminLang, adminT } from './adminI18n';
import { getErrorMessage } from '../../i18n/errorMessages';
import StateCenter from '../../components/admin/StateCenter';
import Pagination from '../../components/admin/Pagination';
import GenericTable from '../../components/admin/GenericTable';

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
      setError(getErrorMessage(err, lang));
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
            {t('reviews_page_sub')}
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

      <StateCenter loading={loading} error={error} onRetry={fetchData} isEmpty={false} t={t} />

      {!loading && !error && (
        <>
          <GenericTable items={items} tabKey={activeTab} lang={lang} />

          <Pagination
            isAr={isAr}
            t={t}
            hasPrev={!!prevUrl}
            hasNext={!!nextUrl}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
            countLabel={count != null ? count : ''}
          />
        </>
      )}
    </AdminLayout>
  );
}
