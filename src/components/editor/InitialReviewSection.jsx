import { extractReportText, extractDecisionLabel } from './reviewFormat';

// ← خاص بصفحة "المحرر" فقط: عرض/إرسال الملاحظات الأولية (notes + decision)
// submitEditorReviewInitial / getEditorReviewInitial
export default function InitialReviewSection({
  t, lang,
  loadingInitialReview, initialReviewError, initialReview,
  noteEditorOpen, openReviewEditor, cancelReviewEditor,
  noteText, setNoteText, decision, setDecision,
  savingNote, saveError, submitReview,
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
          <p style={{ color: '#EF4444', fontSize: 12 }}>{t('load_fail')}</p>
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

      {!noteEditorOpen && !initialReview && (
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <button
            onClick={openReviewEditor}
            style={{
              background: "#C4A55A", color: "#fff", padding: "12px 20px",
              border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600"
            }}
          >
            {t('add_report')}
          </button>
        </div>
      )}

      {noteEditorOpen && (
        <div className="note-editor open">
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{t('add_report')}</div>

          <div className="editor-field">
            <label className="editor-label">{t('editor_notes')}</label>
            <textarea
              className="editor-textarea"
              rows={6}
              placeholder={lang === 'ar' ? 'اكتب ملاحظات المحرر هنا...' : 'Write editor notes...'}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              disabled={savingNote}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <div className="editor-field">
              <label className="editor-label">{t('editor_decision')}</label>
              <select
                className="editor-select"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                disabled={savingNote}
              >
                <option value="">{t('decision_ph')}</option>
                <option value="REVISION_REQUIRED">
                  {lang === 'ar' ? 'طلب تعديلات من الباحث' : 'Request Revision'}
                </option>
                <option value="SEND_TO_COMMITTEE">
                  {lang === 'ar' ? 'إرسال إلى لجنة التحكيم' : 'Send to Committee'}
                </option>
              </select>
            </div>

            <div className="note-editor-btns">
              <button className="btn-cancel-note" onClick={cancelReviewEditor} disabled={savingNote}>
                {t('cancel')}
              </button>
              <button
                className="btn-save-note"
                onClick={submitReview}
                disabled={savingNote || !noteText.trim() || !decision}
              >
                {savingNote ? t('saving') : t('save_note')}
              </button>
            </div>

            {!decision && noteText.trim() && (
              <p style={{ color: '#F59E0B', fontSize: 12, marginTop: 8 }}>{t('decision_missing')}</p>
            )}
            {saveError && (
              <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>{t('save_fail')}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
