import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';

/* أزرار التنقل بين الصفحات المشتركة بين كل جداول لوحة الأدمن */
export default function Pagination({ isAr, t, hasPrev, hasNext, onPrev, onNext, countLabel }) {
  if (!hasPrev && !hasNext) return null;

  return (
    <div className="admin-pagination">
      <button className="admin-btn admin-btn-sm" disabled={!hasPrev} onClick={onPrev}>
        {isAr ? <PiCaretRight size={14} /> : <PiCaretLeft size={14} />}
        {t('prev')}
      </button>
      <span style={{ fontSize: 13, color: 'var(--tx2)' }}>{countLabel}</span>
      <button className="admin-btn admin-btn-sm" disabled={!hasNext} onClick={onNext}>
        {t('next')}
        {isAr ? <PiCaretLeft size={14} /> : <PiCaretRight size={14} />}
      </button>
    </div>
  );
}
