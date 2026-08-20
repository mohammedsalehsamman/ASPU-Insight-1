import { FiLoader, FiEye, FiUsers, FiCheck, FiCheckCircle, FiAlertTriangle, FiUpload } from 'react-icons/fi';
import { FINAL_DECISION_OPTIONS, committeeHasVerdict } from './editorConstants';

/* ← يظهر فقط إذا قرار المحرر الأولي كان SEND_TO_COMMITTEE:
   أزرار "تعيين اللجنة" / "عرض حالة اللجنة" حسب committeeExists، ثم قرار المحرر
   النهائي (بعد تحكيم فعلي من اللجنة)، ثم زر نشر البحث بعد القبول */
export default function FinalDecisionForm({
  t, lang, extractErrorMessage,
  checkingCommittee, committeeExists, committeeStatusOpen, openCommitteeStatusPanel,
  committeePanelOpen, committeeSuccess, openCommitteePanel,
  committeeStatus,
  finalDecision, setFinalDecision, finalNoteText, setFinalNoteText,
  languageReviewPassed, setLanguageReviewPassed,
  citationCheckPassed, setCitationCheckPassed,
  publisherPermissionObtained, setPublisherPermissionObtained,
  submittingFinalDecision, finalDecisionError, finalReview, submitFinalDecision,
  publishing, publishSuccess, publishError, handlePublishPaper,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {checkingCommittee && (
          <span style={{ fontSize: 12, opacity: 0.65, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiLoader className="spin-ico" size={13} />
            {t('checking_committee')}
          </span>
        )}

        {/* زر عرض حالة اللجنة — يطلع فقط إذا أكيد في لجنة مشكّلة أصلاً */}
        {!checkingCommittee && committeeExists === true && !committeeStatusOpen && (
          <button
            onClick={openCommitteeStatusPanel}
            style={{
              background: "#C4A55A", color: "#fff", padding: "12px 20px", border: "none",
              borderRadius: "10px", cursor: "pointer", fontWeight: "600",
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <FiEye size={14} />
            {t('committee_status_btn')}
          </button>
        )}

        {/* زر تعيين اللجنة — يطلع فقط إذا أكيد ما في لجنة مشكّلة بعد */}
        {!checkingCommittee && committeeExists === false && !committeePanelOpen && !committeeSuccess && (
          <button
            onClick={openCommitteePanel}
            style={{
              background: "#5A8FA0", color: "#fff", padding: "12px 20px", border: "none",
              borderRadius: "10px", cursor: "pointer", fontWeight: "600",
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <FiUsers size={14} />
            {t('assign_committee_btn')}
          </button>
        )}
      </div>

      {/* ══ قرار المحرر النهائي (راديو بوتن) ══
            بيطلع حصراً لما زر "عرض حالة اللجنة" يكون ظاهر (في لجنة أصلاً)
            وجاي تحكيم فعلي من أعضاء اللجنة (مش لسا pending) ══ */}
      {committeeExists === true && committeeHasVerdict(committeeStatus) && (
        <div className="editor-field">
          <label className="editor-label">
            {t('final_decision_l')}
          </label>
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: -4, marginBottom: 10 }}>
            {t('final_decision_hint')}
          </p>

          {/* ✅ الباك بيرفض الطلب من دون notes */}
          <textarea
            className="editor-textarea"
            rows={4}
            placeholder={t('final_note_ph')}
            value={finalNoteText}
            onChange={e => setFinalNoteText(e.target.value)}
            disabled={submittingFinalDecision}
            style={{ marginBottom: 10 }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FINAL_DECISION_OPTIONS.map(opt => (
              <label
                key={opt.value}
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name="final-decision"
                  value={opt.value}
                  checked={finalDecision === opt.value}
                  onChange={() => setFinalDecision(opt.value)}
                  disabled={submittingFinalDecision}
                />
                {lang === 'ar' ? opt.ar : opt.en}
              </label>
            ))}
          </div>

          {/* ✅ الباك بيرفض ACCEPT من دون هالتلاتة تأكيدات — بتطلع فقط لما القرار المختار ACCEPT */}
          {finalDecision === 'ACCEPT' && (
            <div style={{ marginTop: 10, marginBottom: 4 }}>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                {t('accept_confirm_l')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={languageReviewPassed}
                    onChange={e => setLanguageReviewPassed(e.target.checked)}
                    disabled={submittingFinalDecision}
                  />
                  {t('language_review_passed_l')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={citationCheckPassed}
                    onChange={e => setCitationCheckPassed(e.target.checked)}
                    disabled={submittingFinalDecision}
                  />
                  {t('citation_check_passed_l')}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={publisherPermissionObtained}
                    onChange={e => setPublisherPermissionObtained(e.target.checked)}
                    disabled={submittingFinalDecision}
                  />
                  {t('publisher_permission_obtained_l')}
                </label>
              </div>
              {!(languageReviewPassed && citationCheckPassed && publisherPermissionObtained) && (
                <p style={{ color: '#F59E0B', fontSize: 12, marginTop: 6 }}>
                  {t('accept_confirm_missing')}
                </p>
              )}
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button
              className="btn-save-note"
              onClick={submitFinalDecision}
              disabled={
                submittingFinalDecision ||
                !finalDecision ||
                !finalNoteText.trim() ||
                (finalDecision === 'ACCEPT' && !(languageReviewPassed && citationCheckPassed && publisherPermissionObtained))
              }
            >
              {submittingFinalDecision ? <FiLoader className="spin-ico" size={13} /> : <FiCheck size={13} />}
              {submittingFinalDecision ? t('submitting_final') : t('submit_final_decision')}
            </button>
          </div>

          {!finalNoteText.trim() && finalDecision && (
            <p style={{ color: '#F59E0B', fontSize: 12, marginTop: 8 }}>
              {t('final_decision_missing')}
            </p>
          )}

          {finalReview && (
            <p style={{ color: '#22C55E', fontSize: 13, marginTop: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiCheckCircle size={15} />
              {t('final_decision_saved')}
            </p>
          )}
          {finalDecisionError && (
            <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
              {extractErrorMessage(finalDecisionError, lang) || t('final_decision_fail')}
            </p>
          )}
        </div>
      )}

      {/* ══ زر نشر البحث — يظهر فقط إذا القرار النهائي = قبول (ACCEPT) ══ */}
      {finalReview?.decision === 'ACCEPT' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handlePublishPaper}
            disabled={publishing}
            style={{
              background: "#22C55E", color: "#fff", padding: "12px 20px", border: "none",
              borderRadius: "10px", cursor: publishing ? "not-allowed" : "pointer",
              fontWeight: "600", opacity: publishing ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {publishing ? <FiLoader className="spin-ico" size={14} /> : <FiUpload size={14} />}
            {publishing ? t('publishing_l') : t('publish_btn')}
          </button>
        </div>
      )}

      {publishSuccess && (
        <p style={{ color: '#22C55E', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
          <FiCheckCircle size={15} />
          {t('publish_success')}
        </p>
      )}
      {publishError && (
        <p style={{ color: '#EF4444', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
          <FiAlertTriangle size={15} />
          {publishError}
        </p>
      )}
    </div>
  );
}
