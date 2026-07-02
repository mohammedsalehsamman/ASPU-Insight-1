import { getStatus } from './statusHelpers';

// ← الجزء الثابت جوا لوحة التفاصيل: العنوان، صف الباحث، الشبكة المعلوماتية،
//   الكلمات المفتاحية، الملخص، وملف الـ PDF — مطابق بالصفحتين
// isReviewed: بتحدد لون خلية الحالة (خضر/أصفر) — كل صفحة بتحسبها بمنطقها الخاص
export default function PaperDetailInfo({ activePaper, lang, t, isReviewed }) {
  const s = getStatus(activePaper);
  return (
    <>
      <h2 className="dp-title">{activePaper.title}</h2>

      <div className="dp-author-row">
        <div className="dp-avatar">
          {activePaper.author_name?.charAt(0).toUpperCase()}
        </div>
        <div className="dp-author-info">
          <div className="dp-author-name">{activePaper.author_name}</div>
          <div className="dp-author-meta">
            {activePaper.review_blindness_type === 'double_blind'
              ? (lang === 'ar' ? 'تحكيم مزدوج' : 'Double Blind Review')
              : (lang === 'ar' ? 'تحكيم فردي' : 'Single Blind Review')}
          </div>
        </div>
      </div>

      <div className="dp-info-grid">
        {[
          { label: t('ref_id'), val: `RES-${String(activePaper.id).padStart(3, '0')}` },
          { label: t('status_l'), val: lang === 'ar' ? s.ar : s.en, color: isReviewed ? 'var(--ac2)' : '#F59E0B' },
          { label: t('plagiarism'), val: activePaper.plagiarism_score != null ? `${activePaper.plagiarism_score}%` : (lang === 'ar' ? 'غير محدد' : 'N/A') },
          { label: t('open_access'), val: activePaper.is_paid_open_access ? t('yes') : t('no') },
        ].map((cell, i) => (
          <div className="dp-info-cell" key={i}>
            <div className="dp-info-label">{cell.label}</div>
            <div className="dp-info-val" style={cell.color ? { color: cell.color } : {}}>{cell.val}</div>
          </div>
        ))}
      </div>

      {activePaper.ai_keywords?.length > 0 && (
        <>
          <div className="dp-sec-label">{t('keywords')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {activePaper.ai_keywords.map((kw, i) => (
              <span key={i} style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                color: 'var(--ac)',
              }}>{kw}</span>
            ))}
          </div>
        </>
      )}

      <div className="dp-sec-label">{t('abstract')}</div>
      <div className="dp-abstract">{activePaper.abstract}</div>

      <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('file')}</div>
      {activePaper.pdf_file ? (
        <div className="dp-pdf-block">
          <div className="dp-pdf-bar">
            <div className="dp-pdf-ico">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--ac)" strokeWidth="1.8">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="dp-pdf-name">
              {activePaper.pdf_file.split('/').pop()}
            </span>
            <a
              className="dp-pdf-dl"
              href={activePaper.pdf_file}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                <path d="M8 2v8M4 10l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('download')}
            </a>
          </div>
        </div>
      ) : (
        <div className="no-notes-msg">{t('no_file')}</div>
      )}
    </>
  );
}
