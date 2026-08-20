import { PiWarningDuotone, PiArrowClockwiseBold } from 'react-icons/pi';

/* حالة التحميل/الخطأ/الفراغ المشتركة بين كل صفحات لوحة الأدمن — تُعرض بدل المحتوى الفعلي */
export default function StateCenter({ loading, error, onRetry, isEmpty, t }) {
  if (loading) {
    return (
      <div className="admin-state-center">
        <div className="admin-spinner" />
        <span>{t('loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-state-center">
        <PiWarningDuotone size={36} style={{ color: 'var(--ac)' }} />
        <span className="admin-empty-title">{t('error')}</span>
        <span className="admin-empty-sub">{String(error)}</span>
        <button className="admin-btn admin-btn-primary" onClick={onRetry} style={{ marginTop: 6 }}>
          <PiArrowClockwiseBold size={14} />
          {t('retry')}
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="admin-state-center">
        <span className="admin-empty-title">{t('no_results')}</span>
        <span className="admin-empty-sub">{t('no_results_sub')}</span>
      </div>
    );
  }

  return null;
}
