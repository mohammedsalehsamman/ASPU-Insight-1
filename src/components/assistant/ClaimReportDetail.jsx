import { FiChevronLeft, FiClock } from 'react-icons/fi';
import ClaimAnalysisResult from './ClaimAnalysisResult';

export default function ClaimReportDetail({
  t, lang, claimDetailOpen, closeClaimDetail,
  loadingClaimDetail, claimDetailError, activeClaimReport,
}) {
  return (
    <>
      <div className={`detail-overlay ${claimDetailOpen ? 'open' : ''}`} onClick={closeClaimDetail} />
      <div className={`detail-panel ${claimDetailOpen ? 'open' : ''}`}>
        {claimDetailOpen && (
          <>
            <div className="dp-header">
              <button className="dp-back-btn" onClick={closeClaimDetail}>
                <FiChevronLeft size={14} />
              </button>
              <span className="dp-header-title">{t('claim_details')}</span>
            </div>

            <div className="dp-body">
              {loadingClaimDetail && (
                <div className="empty-state">
                  <div className="empty-ico"><FiClock /></div>
                  <div className="empty-title">{t('claim_loading')}</div>
                </div>
              )}

              {!loadingClaimDetail && claimDetailError && (
                <div className="no-notes-msg" style={{ color: '#EF4444' }}>
                  {t('claim_fail')}
                </div>
              )}

              {!loadingClaimDetail && !claimDetailError && activeClaimReport && (
                <>
                  <h2 className="dp-title">
                    {activeClaimReport.paper_title || activeClaimReport.original_filename}
                  </h2>

                  <div className="dp-info-grid">
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('ieee_filename')}</div>
                      <div className="dp-info-val">{activeClaimReport.original_filename}</div>
                    </div>
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('status_l')}</div>
                      <div className="dp-info-val">{activeClaimReport.status_display || activeClaimReport.status}</div>
                    </div>
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('ieee_lang')}</div>
                      <div className="dp-info-val">{activeClaimReport.detected_language || (lang === 'ar' ? 'غير محدد' : 'N/A')}</div>
                    </div>
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('processing_time_l')}</div>
                      <div className="dp-info-val">{activeClaimReport.processing_time_seconds ?? '—'}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    <ClaimAnalysisResult data={activeClaimReport} t={t} lang={lang} />
                  </div>

                  <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('claim_created')}</div>
                  <div className="dp-abstract">
                    {activeClaimReport.created_at ? new Date(activeClaimReport.created_at).toLocaleString(lang === 'ar' ? 'ar' : 'en') : '—'}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
