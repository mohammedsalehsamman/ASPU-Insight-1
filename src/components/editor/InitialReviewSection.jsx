import { extractReportText, extractDecisionLabel } from './reviewFormat';

/* ← خاص بصفحة "المحرر" فقط: عرض الملاحظات الأولية (notes + decision) المُرسَلة مسبقاً */
export default function InitialReviewSection({
  t, lang, extractErrorMessage,
  loadingInitialReview, initialReviewError, initialReview,
}) {
  return (
    <>
      <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
        {t('initial_notes')}
      </div>
      <div className="dp-notes-wrap">
        {loadingInitialReview ? (
          <div className="no-notes-msg">{t('loading')}</div>
        ) : initialReviewError ? (
          <p style={{ color: '#EF4444', fontSize: 12 }}>{extractErrorMessage(initialReviewError, lang) || t('load_fail')}</p>
        ) : initialReview ? (
          <div className="note-item">
            <div className="note-body">{extractReportText(initialReview)}</div>
            {initialReview.decision && (
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                {t('decision_l')}: <strong>{extractDecisionLabel(initialReview, lang)}</strong>
              </div>
            )}
          </div>
        ) : (
          <div className="no-notes-msg">{t('no_notes')}</div>
        )}
      </div>
    </>
  );
}
