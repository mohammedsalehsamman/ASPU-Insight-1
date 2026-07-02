// ← خاص بصفحة "مساعد المحرر" بس: عرض/إضافة تقرير مساعد المحرر (submitAssistantReport / getAssistantReview)
// هاد الجزء مش موجود بصفحة "المحرر" (اللي عندها initial review + decision + لجنة بدلاً منه)
export default function AssistantReportSection({
  hasReport, t,
  reviewData, loadingReview, loadReview, reviewError,
  noteEditorOpen, setNoteEditorOpen, noteText, setNoteText,
  savingNote, saveError, setSaveError, saveNote,
}) {
  return (
    <>
      <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('notes_l')}</div>
      <div className="dp-notes-wrap">
        {!hasReport ? (
          <div className="no-notes-msg">{t('no_notes')}</div>
        ) : reviewData ? (
          Array.isArray(reviewData) && reviewData.length > 0 ? (
            reviewData.map((rev, i) => (
              <div className="note-item" key={rev.id ?? i}>
                <div className="note-body">
                  {rev.report || rev.report_text || rev.content || rev.body || rev.assistant_editor_report || JSON.stringify(rev)}
                </div>
              </div>
            ))
          ) : (
            <div className="no-notes-msg">{t('no_notes')}</div>
          )
        ) : (
          <button className="add-note-btn" onClick={loadReview} disabled={loadingReview}>
            {loadingReview ? t('saving') : t('view_report')}
          </button>
        )}
        {reviewError && (
          <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
            {t('load_report_fail')}
          </p>
        )}
      </div>

      {!hasReport && !noteEditorOpen && (
        <button className="add-note-btn" onClick={() => { setNoteEditorOpen(true); setSaveError(null); }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/>
          </svg>
          {t('add_note')}
        </button>
      )}

      {noteEditorOpen && (
        <div className="note-editor open">
          <textarea
            className="note-textarea"
            placeholder={t('note_ph')}
            rows={4}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            autoFocus
            disabled={savingNote}
          />
          <div className="note-editor-btns">
            <button
              className="btn-cancel-note"
              onClick={() => { setNoteEditorOpen(false); setNoteText(''); setSaveError(null); }}
              disabled={savingNote}
            >
              {t('cancel')}
            </button>
            <button
              className="btn-save-note"
              onClick={saveNote}
              disabled={savingNote || !noteText.trim()}
            >
              {savingNote ? t('saving') : t('save_note')}
            </button>
          </div>
          {saveError && (
            <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
              {t('save_fail')}
            </p>
          )}
        </div>
      )}
    </>
  );
}
