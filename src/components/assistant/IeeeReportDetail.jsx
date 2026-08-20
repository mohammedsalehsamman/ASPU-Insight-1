import { FiChevronLeft, FiClock } from 'react-icons/fi';

export default function IeeeReportDetail({
  t, lang, ieeeDetailOpen, closeIeeeDetail,
  loadingIeeeDetail, ieeeDetailError, activeIeeeReport,
}) {
  return (
    <>
      <div className={`detail-overlay ${ieeeDetailOpen ? 'open' : ''}`} onClick={closeIeeeDetail} />
      <div className={`detail-panel ${ieeeDetailOpen ? 'open' : ''}`}>
        {ieeeDetailOpen && (
          <>
            <div className="dp-header">
              <button className="dp-back-btn" onClick={closeIeeeDetail}>
                <FiChevronLeft size={14} />
              </button>
              <span className="dp-header-title">{t('ieee_details')}</span>
            </div>

            <div className="dp-body">
              {loadingIeeeDetail && (
                <div className="empty-state">
                  <div className="empty-ico"><FiClock /></div>
                  <div className="empty-title">{t('ieee_loading')}</div>
                </div>
              )}

              {!loadingIeeeDetail && ieeeDetailError && (
                <div className="no-notes-msg" style={{ color: '#EF4444' }}>
                  {t('ieee_fail')}
                </div>
              )}

              {!loadingIeeeDetail && !ieeeDetailError && activeIeeeReport && (
                <>
                  <h2 className="dp-title">
                    {activeIeeeReport.paper_title || activeIeeeReport.original_filename}
                  </h2>

                  <div className="dp-info-grid">
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('ieee_filename')}</div>
                      <div className="dp-info-val">{activeIeeeReport.original_filename}</div>
                    </div>
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('status_l')}</div>
                      <div className="dp-info-val">{activeIeeeReport.status_display || activeIeeeReport.status}</div>
                    </div>
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('ieee_lang')}</div>
                      <div className="dp-info-val">{activeIeeeReport.detected_language || (lang === 'ar' ? 'غير محدد' : 'N/A')}</div>
                    </div>
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('ieee_pages')}</div>
                      <div className="dp-info-val">{activeIeeeReport.total_pages}</div>
                    </div>
                  </div>

                  {activeIeeeReport.status === 'pending' ? (
                    <div className="no-notes-msg" style={{ marginTop: 16 }}>
                      {activeIeeeReport.status_display || t('plag_pending')}
                    </div>
                  ) : activeIeeeReport.status === 'error' ? (
                    <div className="no-notes-msg" style={{ marginTop: 16, color: '#EF4444' }}>
                      {activeIeeeReport.summary || t('ieee_check_fail')}
                    </div>
                  ) : (
                    <>
                      <div className="dp-sec-label" style={{ marginTop: 20 }}>{lang === 'ar' ? 'نتائج الفحص' : 'Check Results'}</div>
                      <div className="dp-info-grid">
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('overall_score')}</div>
                          <div className="dp-info-val">{activeIeeeReport.overall_score}%</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('citation_match')}</div>
                          <div className="dp-info-val">{activeIeeeReport.citation_matching_score}%</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('format_score_l')}</div>
                          <div className="dp-info-val">{activeIeeeReport.format_score}%</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('crossref_score_l')}</div>
                          <div className="dp-info-val">{activeIeeeReport.crossref_score}%</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('total_cit')}</div>
                          <div className="dp-info-val">{activeIeeeReport.total_citations_in_text}</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('total_ref')}</div>
                          <div className="dp-info-val">{activeIeeeReport.total_references}</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('missing_cit')}</div>
                          <div className="dp-info-val">{activeIeeeReport.missing_citations_count}</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('unused_ref')}</div>
                          <div className="dp-info-val">{activeIeeeReport.unused_references_count}</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('crossref_checked_l')}</div>
                          <div className="dp-info-val">{activeIeeeReport.crossref_checked}</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('crossref_verified_l')}</div>
                          <div className="dp-info-val">{activeIeeeReport.crossref_verified}</div>
                        </div>
                      </div>

                      {activeIeeeReport.summary && (
                        <>
                          <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('ieee_summary')}</div>
                          <div className="dp-abstract">{activeIeeeReport.summary}</div>
                        </>
                      )}

                      {activeIeeeReport.recommendations?.length > 0 && (
                        <>
                          <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('recommendations_l')}</div>
                          <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 13, lineHeight: 1.8 }}>
                            {activeIeeeReport.recommendations.map((rec, i) => (
                              <li key={i}>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {activeIeeeReport.references_list?.length > 0 && (
                        <>
                          <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('references_l')}</div>
                          <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 13, lineHeight: 1.8 }}>
                            {activeIeeeReport.references_list.map((ref, i) => (
                              <li key={i}>{typeof ref === 'string' ? ref : JSON.stringify(ref)}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </>
                  )}

                  <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('ieee_created')}</div>
                  <div className="dp-abstract">
                    {activeIeeeReport.created_at ? new Date(activeIeeeReport.created_at).toLocaleString(lang === 'ar' ? 'ar' : 'en') : '—'}
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
