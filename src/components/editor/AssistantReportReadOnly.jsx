import { ASSISTANT_DECISION_MAP } from './editorConstants';

// ← خاص بصفحة "المحرر": عرض للقراءة فقط لتقرير مساعد المحرر (GET assistant-review)
// بعكس صفحة المساعد نفسه، المحرر ما بيقدر يعدّل هالتقرير، بس يشوفه
export default function AssistantReportReadOnly({
  t, lang, extractErrorMessage,
  loadingAssistantReview, assistantReviewError, assistantReview,
}) {
  return (
    <>
      <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('assistant_report')}</div>
      {loadingAssistantReview ? (
        <div className="no-notes-msg">{t('loading')}</div>
      ) : assistantReviewError ? (
        <p style={{ color: '#EF4444', fontSize: 12 }}>{extractErrorMessage(assistantReviewError, lang) || t('load_fail')}</p>
      ) : assistantReview ? (
        <>
          <div className="dp-author-row">
            <div className="dp-avatar">
              {assistantReview.assistant?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="dp-author-info">
              <div className="dp-author-name">{assistantReview.assistant?.full_name || t('assistant_l')}</div>
              <div className="dp-author-meta">{assistantReview.assistant?.email}</div>
            </div>
            {assistantReview.decision && (
              <span
                className={`pc-status ${ASSISTANT_DECISION_MAP[assistantReview.decision]?.cls || 'status-pending'}`}
                style={{ marginInlineStart: 'auto' }}
              >
                <span className="pc-status-dot" />
                {ASSISTANT_DECISION_MAP[assistantReview.decision]
                  ? (lang === 'ar' ? ASSISTANT_DECISION_MAP[assistantReview.decision].ar : ASSISTANT_DECISION_MAP[assistantReview.decision].en)
                  : assistantReview.decision}
              </span>
            )}
          </div>

          <div className="dp-info-grid">
            {[
              { label: t('format_ok_l'), val: assistantReview.is_format_compliant ? t('yes') : t('no') },
              { label: t('complete_l'), val: assistantReview.is_complete ? t('yes') : t('no') },
              {
                label: t('reviewed_at_l'),
                val: assistantReview.reviewed_at
                  ? new Date(assistantReview.reviewed_at).toLocaleString(lang === 'ar' ? 'ar' : 'en')
                  : '—',
              },
              ...(assistantReview.recommended_decision ? [{
                label: t('recommended_decision_l'),
                val: ASSISTANT_DECISION_MAP[assistantReview.recommended_decision]
                  ? (lang === 'ar' ? ASSISTANT_DECISION_MAP[assistantReview.recommended_decision].ar : ASSISTANT_DECISION_MAP[assistantReview.recommended_decision].en)
                  : assistantReview.recommended_decision,
              }] : []),
            ].map((cell, i) => (
              <div className="dp-info-cell" key={i}>
                <div className="dp-info-label">{cell.label}</div>
                <div className="dp-info-val">{cell.val}</div>
              </div>
            ))}
          </div>

          <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('assistant_notes_l')}</div>
          <div className="dp-notes-wrap">
            <div className="note-item">
              <div className="note-body">{assistantReview.notes || t('no_notes')}</div>
            </div>
          </div>

          {assistantReview.policy_notes && (
            <>
              <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('policy_notes_l')}</div>
              <div className="dp-notes-wrap">
                <div className="note-item">
                  <div className="note-body">{assistantReview.policy_notes}</div>
                </div>
              </div>
            </>
          )}

          {assistantReview.suggested_reviewers?.length > 0 && (
            <>
              <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('suggested_reviewers_l')}</div>
              <div className="dp-notes-wrap">
                {assistantReview.suggested_reviewers.map((rev, i) => (
                  <div className="note-item" key={rev?.id ?? rev?.user_id ?? i}>
                    <div className="note-body">
                      {typeof rev === 'string'
                        ? rev
                        : (rev?.full_name ?? rev?.name ?? rev?.email ?? JSON.stringify(rev))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {assistantReview.ieee_report && (
            <>
              <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('ieee_report_l')}</div>
              <div className="dp-notes-wrap">
                {typeof assistantReview.ieee_report === 'object' ? (
                  <div className="dp-info-grid">
                    {Object.entries(assistantReview.ieee_report)
                      .filter(([, v]) => v !== null && v !== undefined && v !== '')
                      .map(([k, v]) => (
                        <div className="dp-info-cell" key={k}>
                          <div className="dp-info-label">{k.replace(/_/g, ' ')}</div>
                          <div className="dp-info-val">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="note-item">
                    <div className="note-body">{String(assistantReview.ieee_report)}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="no-notes-msg">{t('no_notes')}</div>
      )}
    </>
  );
}
