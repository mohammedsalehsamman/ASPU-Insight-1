import { FiFileText, FiDownload } from 'react-icons/fi';

/* ← رأس بانل التفاصيل: العنوان، صف الباحث، شبكة المعلومات، الكلمات المفتاحية، الملخص، وملف الـ PDF */
export default function PaperOverviewSection({
  activePaper, lang, t, getStatus, handleDownloadPdf,
}) {
  const status = getStatus(activePaper);

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
          { label: t('status_l'), val: lang === 'ar' ? status.ar : status.en, color: activePaper.is_reviewed_by_assistant ? 'var(--ac2)' : '#F59E0B' },
          { label: t('plagiarism'), val: activePaper.plagiarism_score != null ? `${activePaper.plagiarism_score}%` : (lang === 'ar' ? 'غير محدد' : 'N/A') },
          { label: t('open_access'), val: activePaper.is_paid_open_access ? t('yes') : t('no') },
        ].map((cell, i) => (
          <div className="dp-info-cell" key={i}>
            <div className="dp-info-label">{cell.label}</div>
            <div className="dp-info-val" style={cell.color ? { color: cell.color } : {}}>{cell.val}</div>
          </div>
        ))}
      </div>

      {/* AI Keywords */}
      {activePaper.ai_keywords?.length > 0 && (
        <>
          <div className="dp-sec-label">{t('keywords')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {activePaper.ai_keywords.map((kw, i) => (
              <span key={i} style={{
                background: 'var(--surf2)',
                border: '1px solid var(--bd)',
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

      {/* PDF File */}
      <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('file')}</div>
      {activePaper.pdf_file ? (
        <div className="dp-pdf-block">
          <div className="dp-pdf-bar">
            <div className="dp-pdf-ico">
              <FiFileText size={18} />
            </div>
            <span className="dp-pdf-name">
              {activePaper.pdf_file.split('/').pop()}
            </span>
            <button
              type="button"
              className="dp-pdf-dl"
              onClick={handleDownloadPdf}
            >
              <FiDownload size={12} />
              {t('download')}
            </button>
          </div>
        </div>
      ) : (
        <div className="no-notes-msg">{t('no_file')}</div>
      )}
    </>
  );
}
