// ← الهيكل العام لِلوحة التفاصيل (overlay + panel + header فيه زر رجوع وتاغ نوع التحكيم)
// المحتوى الخاص بكل صفحة بينمرر عن طريق children
export default function DetailPanelShell({ open, onClose, activePaper, lang, t, children }) {
  return (
    <>
      <div className={`detail-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`detail-panel ${open ? 'open' : ''}`}>
        {activePaper && (
          <>
            <div className="dp-header">
              <button className="dp-back-btn" onClick={onClose}>
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                  <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className="dp-header-title">{t('details')}</span>
              <span className="dp-dept-tag">
                {activePaper.review_blindness_type === 'double_blind'
                  ? (lang === 'ar' ? 'تحكيم مزدوج' : 'Double Blind')
                  : (lang === 'ar' ? 'تحكيم فردي' : 'Single Blind')}
              </span>
            </div>

            <div className="dp-body">
              {children}
            </div>
          </>
        )}
      </div>
    </>
  );
}
