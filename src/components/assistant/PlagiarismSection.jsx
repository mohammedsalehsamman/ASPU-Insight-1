import { fmtPct } from './assistantConstants';

export default function PlagiarismSection({
  t, lang, plagiarismData, loadingPlagiarism, plagiarismError, loadPlagiarismReport,
}) {
  return (
    <>
      <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('plag_report_l')}</div>
      {!plagiarismData ? (
        <button className="add-note-btn" onClick={loadPlagiarismReport} disabled={loadingPlagiarism}>
          {loadingPlagiarism ? t('saving') : t('plag_load_btn')}
        </button>
      ) : plagiarismData.status === 'failed' ? (
        <div className="no-notes-msg" style={{ borderColor: '#EF4444', color: '#EF4444' }}>
          {t('plag_status_failed_l')}
        </div>
      ) : plagiarismData.status !== 'completed' ? (
        // يغطي pending / processing / أي حالة غير معروفة بعد
        <div className="no-notes-msg">{t('plag_pending')}</div>
      ) : (
        <>
          <div className="dp-info-grid">
            <div className="dp-info-cell">
              <div className="dp-info-label">{t('plag_total')}</div>
              <div className="dp-info-val">{fmtPct(plagiarismData.total_similarity_score)}%</div>
            </div>
            <div className="dp-info-cell">
              <div className="dp-info-label">{t('plag_internal')}</div>
              <div className="dp-info-val">{fmtPct(plagiarismData.internal_similarity_score)}%</div>
            </div>
            <div className="dp-info-cell">
              <div className="dp-info-label">{t('plag_external')}</div>
              <div className="dp-info-val">{fmtPct(plagiarismData.external_similarity_score)}%</div>
            </div>
            <div className="dp-info-cell">
              <div className="dp-info-label">{t('plag_human')}</div>
              <div className="dp-info-val">{plagiarismData.requires_human_review ? t('yes') : t('no')}</div>
            </div>
          </div>

          <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('plag_sources_l')}</div>
          {plagiarismData.sources?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plagiarismData.sources.map((s) => {
                const isConfirmed = s.confidence_level === 'confirmed';
                const badgeColor = isConfirmed ? '#EF4444' : '#F59E0B';
                return (
                  <div
                    key={s.id}
                    className="dp-info-cell"
                    style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: lang === 'ar' ? 'right' : 'left' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{s.matched_paper_title || s.source_title}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: badgeColor }}>{fmtPct(s.match_percentage)}%</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11, opacity: 0.75 }}>
                      <span style={{ color: badgeColor, fontWeight: 600 }}>
                        {t('plag_confidence')}: {isConfirmed ? t('plag_confidence_confirmed') : t('plag_confidence_suspected')}
                      </span>
                      <span>
                        {t('plag_source_type')}: {s.source_type === 'internal' ? t('plag_source_internal') : t('plag_source_external')}
                      </span>
                      {s.source_url && (
                        <a href={s.source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ac)' }}>
                          {s.source_url}
                        </a>
                      )}
                    </div>
                    {(s.own_text_snippet || s.source_text_snippet) && (
                      <details style={{ marginTop: 4 }}>
                        <summary style={{ cursor: 'pointer', fontSize: 11, opacity: 0.75, color: 'inherit' }}>
                          {t('plag_view_snippets')}
                        </summary>
                        {s.own_text_snippet && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ fontSize: 10, opacity: 0.6 }}>{t('plag_own_snippet')}</div>
                            <div style={{ fontSize: 11, whiteSpace: 'pre-wrap', opacity: 0.85 }}>{s.own_text_snippet}</div>
                          </div>
                        )}
                        {s.source_text_snippet && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ fontSize: 10, opacity: 0.6 }}>{t('plag_source_snippet')}</div>
                            <div style={{ fontSize: 11, whiteSpace: 'pre-wrap', opacity: 0.85 }}>{s.source_text_snippet}</div>
                          </div>
                        )}
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-notes-msg">{t('plag_no_sources')}</div>
          )}
        </>
      )}
      {plagiarismError && (
        <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
          {t('plag_fail')}
        </p>
      )}
    </>
  );
}
