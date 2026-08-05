import PaperCard from './PaperCard';
import { FiSearch } from 'react-icons/fi';
import { BsHourglassSplit } from 'react-icons/bs';
import { AiOutlineExclamationCircle, AiOutlineFrown } from 'react-icons/ai';

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
            <div className="empty-ico"><BsHourglassSplit size={28} /></div>
            <div className="empty-title">{t('loading')}</div>
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <div className="empty-ico"><AiOutlineExclamationCircle size={28} /></div>
            <div className="empty-title">{t('error')}</div>
            <p className="empty-sub">{error.message}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-ico"><AiOutlineFrown size={28} /></div>
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