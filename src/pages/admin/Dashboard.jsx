import { useEffect, useState, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { getDashboardStats } from '../../api/admin';
import { useAdminLang, adminT } from './adminI18n';
import StateCenter from '../../components/admin/StateCenter';
import { getErrorMessage } from '../../i18n/errorMessages';

/* تسميات ودّية للحقول المعروفة داخل كل مجموعة إحصائيات — أي حقل غير معروف يُعرض باسمه كما هو */
const LABELS = {
  ar: {
    users: {
      total: 'إجمالي المستخدمين', active: 'نشطون', inactive: 'معطّلون',
      verified: 'بريد موثّق', unverified: 'بريد غير موثّق',
      admin: 'أدمن', editor: 'محررون', reviewer: 'مراجعون',
      assistant_editor: 'مساعدو محررين', author: 'باحثون', reader: 'قرّاء',
    },
    papers: {
      total: 'إجمالي الأبحاث', pending: 'قيد الانتظار', under_review: 'قيد المراجعة',
      accepted: 'مقبولة', rejected: 'مرفوضة', published: 'منشورة',
    },
    reviews: { total: 'إجمالي المراجعات', editor: 'مراجعات محررين', assistant: 'مراجعات مساعدين' },
    committees: { total: 'إجمالي اللجان', active: 'لجان نشطة' },
    ai_reports: { total: 'تقارير الذكاء الاصطناعي' },
  },
  en: {
    users: {
      total: 'Total Users', active: 'Active', inactive: 'Inactive',
      verified: 'Verified Email', unverified: 'Unverified Email',
      admin: 'Admins', editor: 'Editors', reviewer: 'Reviewers',
      assistant_editor: 'Assistant Editors', author: 'Authors', reader: 'Readers',
    },
    papers: {
      total: 'Total Papers', pending: 'Pending', under_review: 'Under Review',
      accepted: 'Accepted', rejected: 'Rejected', published: 'Published',
    },
    reviews: { total: 'Total Reviews', editor: 'Editor Reviews', assistant: 'Assistant Reviews' },
    committees: { total: 'Total Committees', active: 'Active Committees' },
    ai_reports: { total: 'AI Reports' },
  },
};

const SECTION_TITLES = {
  users: { ar: 'المستخدمون', en: 'Users' },
  papers: { ar: 'الأبحاث', en: 'Papers' },
  reviews: { ar: 'المراجعات', en: 'Reviews' },
  committees: { ar: 'اللجان', en: 'Committees' },
  ai_reports: { ar: 'تقارير الذكاء الاصطناعي', en: 'AI Reports' },
};

function humanize(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export default function Dashboard() {
  const [lang] = useAdminLang();
  const t = (key) => adminT(lang, key);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(getErrorMessage(err, lang));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const sections = stats ? Object.entries(stats).filter(([, v]) => isPlainObject(v) || typeof v === 'number') : [];

  return (
    <AdminLayout>
      <div className="admin-page-head">
        <div>
          <div className="admin-page-title">{t('dashboard')}</div>
          <div className="admin-page-sub">
            {t('dashboard_page_sub')}
          </div>
        </div>
      </div>

      <StateCenter loading={loading} error={error} onRetry={fetchStats} isEmpty={false} t={t} />

      {!loading && !error && stats && sections.length === 0 && (
        <div className="admin-state-center">
          <span className="admin-empty-title">{t('no_results')}</span>
        </div>
      )}

      {!loading && !error && sections.map(([sectionKey, value]) => {
        const title = SECTION_TITLES[sectionKey]?.[lang] ?? humanize(sectionKey);
        const entries = isPlainObject(value) ? Object.entries(value) : [['total', value]];

        /* الحقول الرقمية (total, active, unverified...) بتصير بطاقة رقم كبيرة.
           الحقول يلي قيمتها object متداخل (by_role, by_status...) بتصير بطاقة توزيع
           فيها صفوف صغيرة، بدل ما نحاول نطبعها كرقم واحد ونطلع "[object Object]". */
        const numericEntries = entries.filter(([, v]) => typeof v === 'number' || typeof v === 'string');
        const breakdownEntries = entries.filter(([, v]) => isPlainObject(v));

        return (
          <div key={sectionKey}>
            <div className="admin-stats-section-title">{title}</div>
            <div className="admin-stats-grid">
              {numericEntries.map(([k, v]) => (
                <div className="admin-stat-card" key={k}>
                  <div className="admin-stat-n">{v}</div>
                  <div className="admin-stat-l">{LABELS[lang]?.[sectionKey]?.[k] ?? humanize(k)}</div>
                </div>
              ))}

              {breakdownEntries.map(([k, v]) => (
                <div className="admin-stat-card admin-breakdown-card" key={k}>
                  <div className="admin-stat-l" style={{ marginBottom: 8 }}>
                    {LABELS[lang]?.[sectionKey]?.[k] ?? humanize(k)}
                  </div>
                  {Object.entries(v).length === 0 ? (
                    <span style={{ fontSize: 12.5, color: 'var(--tx2)' }}>—</span>
                  ) : (
                    <div className="admin-breakdown-rows">
                      {Object.entries(v).map(([subK, subV]) => (
                        <div className="admin-breakdown-row" key={subK}>
                          <span>{LABELS[lang]?.[sectionKey]?.[subK] ?? humanize(subK)}</span>
                          <strong>{typeof subV === 'object' ? JSON.stringify(subV) : String(subV)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </AdminLayout>
  );
}
