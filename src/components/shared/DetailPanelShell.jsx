import { FiChevronLeft } from 'react-icons/fi';

export default function DetailPanelShell({ open, onClose, activePaper, lang, t, children }) {
  return (
    <>
      <div className={`detail-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`detail-panel ${open ? 'open' : ''}`}>
        {activePaper && (
          <>
            <div className="dp-header">
              <button className="dp-back-btn" onClick={onClose}>
                <FiChevronLeft size={16} />
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
