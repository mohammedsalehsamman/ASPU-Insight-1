import ClaimAnalysisResult from './ClaimAnalysisResult';

export default function ClaimCheckSection({
  t, lang, activePaper, claimAnalysisData, loadingClaimAnalysis, claimAnalysisError, runClaimAnalysis,
}) {
  return (
    <>
      <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('claim_check_l')}</div>
      {!claimAnalysisData ? (
        <button
          className="add-note-btn"
          onClick={runClaimAnalysis}
          disabled={loadingClaimAnalysis || !activePaper.pdf_file}
        >
          {loadingClaimAnalysis ? t('saving') : t('claim_check_btn')}
        </button>
      ) : (
        <ClaimAnalysisResult data={claimAnalysisData} t={t} lang={lang} />
      )}
      {!claimAnalysisData && !activePaper.pdf_file && (
        <p className="dp-hint-msg">{t('claim_check_no_pdf')}</p>
      )}
      {claimAnalysisError && (
        <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
          {t('claim_check_fail')}
        </p>
      )}
    </>
  );
}
