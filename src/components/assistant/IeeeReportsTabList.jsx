import { FiSearch, FiClock, FiAlertTriangle, FiFileText, FiChevronRight, FiX } from 'react-icons/fi';
import { IEEE_STATUS_CLS } from './assistantConstants';
import { getErrorMessage } from '../../i18n/errorMessages';

export default function IeeeReportsTabList({
  t, lang, filteredIeee, loadingIeeeReports, ieeeReportsError,
  searchQuery, setSearchQuery, onOpenDetail, deletingIeeeId, onDelete,
}) {
  return (
    <>
      <div className="filter-bar">
        <div className="filter-space" />
        <div className="search-mini">
          <FiSearch size={14} />
          <input
            type="text"
            placeholder={t('ieee_search_ph')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="papers-grid">
        {loadingIeeeReports && (
          <div className="empty-state">
            <div className="empty-ico"><FiClock /></div>
            <div className="empty-title">{t('ieee_loading')}</div>
          </div>
        )}

        {!loadingIeeeReports && ieeeReportsError && (
          <div className="empty-state">
            <div className="empty-ico"><FiAlertTriangle /></div>
            <div className="empty-title">{t('ieee_error')}</div>
            <p className="empty-sub">{getErrorMessage(ieeeReportsError, lang)}</p>
          </div>
        )}

        {!loadingIeeeReports && !ieeeReportsError && filteredIeee.length === 0 && (
          <div className="empty-state">
            <div className="empty-ico"><FiFileText /></div>
            <div className="empty-title">{t('ieee_empty')}</div>
            <p className="empty-sub">{t('ieee_empty_sub')}</p>
          </div>
        )}

        {!loadingIeeeReports && !ieeeReportsError && filteredIeee.map((r, i) => {
          const cls = IEEE_STATUS_CLS[r.status] ?? 'status-pending';
          return (
            <div
              key={r.id}
              className="paper-card"
              style={{ animationDelay: `${i * 0.05}s`, position: 'relative' }}
              onClick={() => onOpenDetail(r.id)}
            >
              <button
                className="pc-delete-btn"
                onClick={(e) => onDelete(e, r.id)}
                disabled={deletingIeeeId === r.id}
                title={lang === 'ar' ? 'حذف التقرير' : 'Delete report'}
              >
                {deletingIeeeId === r.id ? <FiClock size={12} /> : <FiX size={12} />}
              </button>

              <div className="pc-meta">
                <span className="pc-dept">
                  {r.detected_language ? r.detected_language.toUpperCase() : (lang === 'ar' ? 'غير محدد' : 'N/A')}
                </span>
                <span className="pc-date">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en') : ''}
                </span>
              </div>

              <div className="pc-num">IEEE-{String(r.id).padStart(3, '0')}</div>
              <h3 className="pc-title">{r.paper_title || r.original_filename}</h3>

              <div className="pc-author">
                <div className="pc-author-dot" />
                {r.original_filename}
              </div>

              <p className="pc-summary">
                {r.summary || (lang === 'ar' ? 'لا يوجد ملخص بعد' : 'No summary yet')}
              </p>

              <div className="pc-foot">
                <span className={`pc-status ${cls}`}>
                  <span className="pc-status-dot" />
                  {r.status_display || r.status}
                </span>
                <span className="pc-arrow">
                  <FiChevronRight size={12} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
