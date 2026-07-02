import { getStatus } from './statusHelpers';

// ← كرت البحث الواحد بالشبكة — مطابق تماماً بالصفحتين
export default function PaperCard({ paper, lang, index, onOpen }) {
  const s = getStatus(paper);
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
            ? (lang === 'ar' ? '🔓 مفتوح' : '🔓 Open Access')
            : (lang === 'ar' ? '🔒 مقيّد' : '🔒 Restricted')}
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
          <svg width="12" height="12" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
            <path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
    </div>
  );
}
