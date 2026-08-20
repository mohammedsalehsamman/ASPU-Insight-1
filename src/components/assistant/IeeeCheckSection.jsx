export default function IeeeCheckSection({
  t, activePaper, ieeeCheckData, loadingIeeeCheck, ieeeCheckError, runIeeeCheck,
}) {
  return (
    <>
      <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('ieee_check_l')}</div>
      {!ieeeCheckData ? (
        <>
          <button
            className="add-note-btn"
            onClick={runIeeeCheck}
            disabled={loadingIeeeCheck || !activePaper.pdf_file}
          >
            {loadingIeeeCheck ? t('saving') : t('ieee_check_btn')}
          </button>
          {!activePaper.pdf_file && (
            <p className="dp-hint-msg">{t('ieee_check_no_pdf')}</p>
          )}
        </>
      ) : ieeeCheckData.status === 'error' ? (
        <div className="no-notes-msg" style={{ color: '#EF4444' }}>
          {ieeeCheckData.summary || t('ieee_check_fail')}
        </div>
      ) : ieeeCheckData.status === 'pending' ? (
        <div className="no-notes-msg">{t('plag_pending')}</div>
      ) : (
        <div className="dp-info-grid">
          <div className="dp-info-cell">
            <div className="dp-info-label">{t('overall_score')}</div>
            <div className="dp-info-val">{ieeeCheckData.overall_score}%</div>
          </div>
          <div className="dp-info-cell">
            <div className="dp-info-label">{t('citation_match')}</div>
            <div className="dp-info-val">{ieeeCheckData.citation_matching_score}%</div>
          </div>
          <div className="dp-info-cell">
            <div className="dp-info-label">{t('format_score_l')}</div>
            <div className="dp-info-val">{ieeeCheckData.format_score}%</div>
          </div>
          <div className="dp-info-cell">
            <div className="dp-info-label">{t('crossref_score_l')}</div>
            <div className="dp-info-val">{ieeeCheckData.crossref_score}%</div>
          </div>
        </div>
      )}
      {ieeeCheckError && (
        <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
          {t('ieee_check_fail')}
        </p>
      )}
    </>
  );
}
