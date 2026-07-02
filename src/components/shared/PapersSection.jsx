import PaperCard from './PaperCard';

// ← شريط الفلاتر + البحث + شبكة الأبحاث (loading / error / فاضي / نتائج) — مطابق بالصفحتين
export default function PapersSection({
  t, lang, filtered, loading, error,
  activeFilter, setActiveFilter, searchQuery, setSearchQuery, onOpenDetail,
}) {
  return (
    <div className="main-wrap">
      <div className="sec-head">
        <div className="sec-dot" />
        <span className="sec-title">{t('submitted')}</span>
        <div className="sec-rule" />
        <div className="sec-count">{filtered.length}</div>
      </div>

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
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
            <circle cx="6.5" cy="6.5" r="5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/>
          </svg>
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
            <div className="empty-ico">⏳</div>
            <div className="empty-title">{t('loading')}</div>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <div className="empty-ico">⚠️</div>
            <div className="empty-title">{t('error')}</div>
            <p className="empty-sub">{error.message}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-ico">🔍</div>
            <div className="empty-title">{t('no_results')}</div>
            <p className="empty-sub">{t('no_sub')}</p>
          </div>
        )}

        {!loading && !error && filtered.map((p, i) => (
          <PaperCard key={p.id} paper={p} lang={lang} index={i} onOpen={onOpenDetail} />
        ))}
      </div>
    </div>
  );
}
