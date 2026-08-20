import { FiPlus } from 'react-icons/fi';
import { ASSISTANT_DECISION_MAP } from './assistantConstants';

/* ← تقرير مساعد المحرر الخاص بالبحث الحالي: عرض التقرير المحفوظ (إن وُجد) + نموذج كتابة تقرير جديد */
export default function AssistantReportSection({
  t, lang,
  activePaper, reviewData, loadingReview, reviewError, loadReview,
  noteEditorOpen, setNoteEditorOpen,
  noteText, setNoteText, decision, setDecision,
  isFormatCompliant, setIsFormatCompliant, isComplete, setIsComplete,
  policyNotes, setPolicyNotes,
  savingNote, saveError, setSaveError, saveNote,
}) {
  return (
    <>
      <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('notes_l')}</div>
      {!activePaper.is_reviewed_by_assistant ? (
        <div className="no-notes-msg">{t('no_notes')}</div>
      ) : reviewData ? (
        <>
          <div className="dp-author-row">
            <div className="dp-avatar">
              {reviewData.assistant?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="dp-author-info">
              <div className="dp-author-name">{reviewData.assistant?.full_name || t('assistant_l')}</div>
              <div className="dp-author-meta">{reviewData.assistant?.email}</div>
            </div>
            {reviewData.decision && (
              <span
                className={`pc-status ${ASSISTANT_DECISION_MAP[reviewData.decision]?.cls || 'status-pending'}`}
                style={{ marginInlineStart: 'auto' }}
              >
                <span className="pc-status-dot" />
                {ASSISTANT_DECISION_MAP[reviewData.decision]
                  ? (lang === 'ar' ? ASSISTANT_DECISION_MAP[reviewData.decision].ar : ASSISTANT_DECISION_MAP[reviewData.decision].en)
                  : reviewData.decision}
              </span>
            )}
          </div>

          <div className="dp-info-grid">
            {[
              { label: t('format_ok_l'), val: reviewData.is_format_compliant ? t('yes') : t('no') },
              { label: t('complete_l'), val: reviewData.is_complete ? t('yes') : t('no') },
              {
                label: t('reviewed_at_l'),
                val: reviewData.reviewed_at
                  ? new Date(reviewData.reviewed_at).toLocaleString(lang === 'ar' ? 'ar' : 'en')
                  : '—',
              },
              ...(reviewData.recommended_decision ? [{
                label: t('recommended_decision_l'),
                val: ASSISTANT_DECISION_MAP[reviewData.recommended_decision]
                  ? (lang === 'ar' ? ASSISTANT_DECISION_MAP[reviewData.recommended_decision].ar : ASSISTANT_DECISION_MAP[reviewData.recommended_decision].en)
                  : reviewData.recommended_decision,
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
              <div className="note-body">{reviewData.notes || t('no_notes')}</div>
            </div>
          </div>

          {reviewData.policy_notes && (
            <>
              <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('policy_notes_l')}</div>
              <div className="dp-notes-wrap">
                <div className="note-item">
                  <div className="note-body">{reviewData.policy_notes}</div>
                </div>
              </div>
            </>
          )}

          {reviewData.suggested_reviewers?.length > 0 && (
            <>
              <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('suggested_reviewers_l')}</div>
              <div className="dp-notes-wrap">
                {reviewData.suggested_reviewers.map((rev, i) => (
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

          {reviewData.ieee_report && (
            <>
              <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('ieee_report_l')}</div>
              <div className="dp-notes-wrap">
                {typeof reviewData.ieee_report === 'object' ? (
                  <div className="dp-info-grid">
                    {Object.entries(reviewData.ieee_report)
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
                    <div className="note-body">{String(reviewData.ieee_report)}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        <button className="add-note-btn" onClick={loadReview} disabled={loadingReview}>
          {loadingReview ? t('saving') : (lang === 'ar' ? 'عرض التقرير' : 'View Report')}
        </button>
      )}
      {reviewError && (
        <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
          {lang === 'ar' ? 'فشل تحميل التقرير، حاول مرة أخرى' : 'Failed to load report, please try again'}
        </p>
      )}

      {!activePaper.is_reviewed_by_assistant && !noteEditorOpen && (
        <button className="add-note-btn" onClick={() => { setNoteEditorOpen(true); setSaveError(null); }}>
          <FiPlus size={14} />
          {t('add_note')}
        </button>
      )}

      {noteEditorOpen && (
        <div className="note-editor open">
          <div className="dp-sec-label" style={{ marginTop: 4 }}>{t('decision_l')}</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              type="button"
              className={`filter-pill ${decision === 'APPROVE' ? 'active' : ''}`}
              onClick={() => setDecision('APPROVE')}
              disabled={savingNote}
            >
              {t('approve')}
            </button>
            <button
              type="button"
              className={`filter-pill ${decision === 'REJECT' ? 'active' : ''}`}
              onClick={() => setDecision('REJECT')}
              disabled={savingNote}
            >
              {t('reject')}
            </button>
          </div>

          <textarea
            className="note-textarea"
            placeholder={t('note_ph')}
            rows={4}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            autoFocus
            disabled={savingNote}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={isFormatCompliant}
              onChange={e => setIsFormatCompliant(e.target.checked)}
              disabled={savingNote}
            />
            {t('format_ok_l')}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={isComplete}
              onChange={e => setIsComplete(e.target.checked)}
              disabled={savingNote}
            />
            {t('complete_l')}
          </label>

          <div className="dp-sec-label" style={{ marginTop: 12 }}>{t('policy_notes_l')}</div>
          <textarea
            className="note-textarea"
            placeholder={t('policy_ph')}
            rows={2}
            value={policyNotes}
            onChange={e => setPolicyNotes(e.target.value)}
            disabled={savingNote}
          />

          <div className="note-editor-btns">
            <button
              className="btn-cancel-note"
              onClick={() => {
                setNoteEditorOpen(false);
                setNoteText('');
                setDecision('APPROVE');
                setIsFormatCompliant(true);
                setIsComplete(true);
                setPolicyNotes('');
                setSaveError(null);
              }}
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
