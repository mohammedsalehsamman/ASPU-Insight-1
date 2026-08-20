import { FiEdit3, FiX, FiLoader, FiCheck } from 'react-icons/fi';

/* ← زر "إضافة تقرير" + محرر الملاحظات الأولية (notes + decision) — يظهر فقط لما ما في initialReview بعد */
export default function ReviewEditorForm({
  t, lang, extractErrorMessage,
  initialReview, noteEditorOpen, openReviewEditor, cancelReviewEditor,
  noteText, setNoteText, decision, setDecision,
  savingNote, saveError, submitReview,
}) {
  return (
    <>
      {!noteEditorOpen && !initialReview && (
        <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
          <button
            onClick={openReviewEditor}
            style={{
              background: "#C4A55A", color: "#fff", padding: "12px 20px", border: "none",
              borderRadius: "10px", cursor: "pointer", fontWeight: "600",
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <FiEdit3 size={14} />
            {lang === 'ar' ? 'إضافة تقرير' : 'Add Report'}
          </button>
        </div>
      )}

      {noteEditorOpen && (
        <div className="note-editor open">
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
            {t('add_report')}
          </div>

          <div className="editor-field">
            <label className="editor-label">
              {t("editor_notes")}
            </label>

            <textarea
              className="editor-textarea"
              rows={6}
              placeholder={
                lang === "ar"
                  ? "اكتب ملاحظات المحرر هنا..."
                  : "Write editor notes..."
              }
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              disabled={savingNote}
            />
          </div>

          {/* ── دروب داون القرار (decision) — قيمتان فقط حالياً ── */}
          <div style={{ marginTop: 10 }}>
            <div className="editor-field">
              <label className="editor-label">
                {t("editor_decision")}
              </label>

              <select
                className="editor-select"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                disabled={savingNote}
              >
                <option value="">
                  {t("decision_ph")}
                </option>

                <option value="REVISION_REQUIRED">
                  {lang === "ar"
                    ? "طلب تعديلات من الباحث"
                    : "Request Revision"}
                </option>

                <option value="SEND_TO_COMMITTEE">
                  {lang === "ar"
                    ? "إرسال إلى لجنة التحكيم"
                    : "Send to Committee"}
                </option>

              </select>
            </div>

            <div className="note-editor-btns">
              <button
                className="btn-cancel-note"
                onClick={cancelReviewEditor}
                disabled={savingNote}
              >
                <FiX size={13} />
                {t('cancel')}
              </button>
              <button
                className="btn-save-note"
                onClick={submitReview}
                disabled={savingNote || !noteText.trim() || !decision}
              >
                {savingNote ? <FiLoader className="spin-ico" size={13} /> : <FiCheck size={13} />}
                {savingNote ? t('saving') : t('save_note')}
              </button>
            </div>

            {!decision && noteText.trim() && (
              <p style={{ color: '#F59E0B', fontSize: 12, marginTop: 8 }}>
                {t('decision_missing')}
              </p>
            )}

            {saveError && (
              <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                {extractErrorMessage(saveError, lang) || t('save_fail')}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
