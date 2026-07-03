import { getStatus } from './statusHelpers';
import { FiUnlock, FiLock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// ← كرت البحث الواحد بالشبكة — مطابق تماماً بالصفحتين
export default function PaperCard({ paper, lang, index, onOpen }) {
  const s = getStatus(paper);
  const isRtl = lang === 'ar';
  return (
    <div
      className="paper-card"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onOpen(paper.id)}
    >
      <div className="pc-meta">
        <span className="pc-dept">
          {paper.review_blindness_type === 'double_blind'
            ? (lang === 'ar' ? 'تحكيم مزدوج' : 'Double Blind')
            : (lang === 'ar' ? 'تحكيم فردي' : 'Single Blind')}
        </span>
        <span className="pc-date">
          {paper.is_paid_open_access
            ? <><FiUnlock size={12} /> {lang === 'ar' ? 'مفتوح' : 'Open Access'}</>
            : <><FiLock size={12} /> {lang === 'ar' ? 'مقيّد' : 'Restricted'}</>}
        </span>
      </div>

      <div className="pc-num">RES-{String(paper.id).padStart(3, '0')}</div>
      <h3 className="pc-title">{paper.title}</h3>

      <div className="pc-author">
        <div className="pc-author-dot" />
        {paper.author_name}
      </div>

      <p className="pc-summary">{paper.abstract}</p>

      <div className="pc-foot">
        <span className={`pc-status ${s.cls}`}>
          <span className="pc-status-dot" />
          {lang === 'ar' ? s.ar : s.en}
        </span>
        <span className="pc-arrow">
          {isRtl ? <FiChevronLeft size={12} /> : <FiChevronRight size={12} />}
        </span>
      </div>
    </div>
  );
}