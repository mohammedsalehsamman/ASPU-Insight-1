import { FiSearch, FiClock, FiAlertTriangle, FiChevronRight, FiUnlock, FiLock } from 'react-icons/fi';
import { getStatus } from '../shared/statusHelpers';
import { getErrorMessage } from '../../i18n/errorMessages';

export default function PapersTabList({
  t, lang, filtered, loading, error,
  activeFilter, setActiveFilter, searchQuery, setSearchQuery, onOpenDetail,
}) {
  return (
    <>
      <div className="filter-bar">
        {[
          { key: 'all', label: t('all') },
          { key: 'pending', label: t('pending') },
          { key: 'noted', label: t('noted') },
        ].map(f => (
          <button
            key={f.key}
            className={`filter-pill ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >{f.label}</button>
        ))}
        <div className="filter-space" />
        <div className="search-mini">
          <FiSearch size={14} />
          <input
            type="text"
            placeholder={t('search_ph')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="papers-grid">
        {loading && (
          <div className="empty-state">
            <div className="empty-ico"><FiClock /></div>
            <div className="empty-title">{t('loading')}</div>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <div className="empty-ico"><FiAlertTriangle /></div>
            <div className="empty-title">{t('error')}</div>
            <p className="empty-sub">{getErrorMessage(error, lang)}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-ico"><FiSearch /></div>
            <div className="empty-title">{t('no_results')}</div>
            <p className="empty-sub">{t('no_sub')}</p>
          </div>
        )}

        {!loading && !error && filtered.map((p, i) => {
          const s = getStatus(p);
          return (
            <div
              key={p.id}
              className="paper-card"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => onOpenDetail(p.id)}
            >
              <div className="pc-meta">
                <span className="pc-dept">
                  {p.review_blindness_type === 'double_blind'
                    ? (lang === 'ar' ? 'تحكيم مزدوج' : 'Double Blind')
                    : (lang === 'ar' ? 'تحكيم فردي' : 'Single Blind')}
                </span>
                <span className="pc-date" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {p.is_paid_open_access
                    ? <><FiUnlock size={11} /> {lang === 'ar' ? 'مفتوح' : 'Open Access'}</>
                    : <><FiLock size={11} /> {lang === 'ar' ? 'مقيّد' : 'Restricted'}</>}
                </span>
              </div>

              <div className="pc-num">RES-{String(p.id).padStart(3, '0')}</div>
              <h3 className="pc-title">{p.title}</h3>

              <div className="pc-author">
                <div className="pc-author-dot" />
                {p.author_name}
              </div>

              <p className="pc-summary">{p.abstract}</p>

              <div className="pc-foot">
                <span className={`pc-status ${s.cls}`}>
                  <span className="pc-status-dot" />
                  {lang === 'ar' ? s.ar : s.en}
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
