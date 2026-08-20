import { FiLoader, FiCheckCircle, FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { REQUIRED_PRIMARY_COUNT } from './editorConstants';

/* ← خاص بصفحة "المحرر" فقط: تظهر إذا القرار SEND_TO_COMMITTEE — اختيار أعضاء اللجنة (أساسي/احتياطي) وإنشاؤها
   getAvailableReviewers / createCommittee — يدعم الاقتراح الذكي (smart suggestion) ونوع التحكيم (blinding type) */
export default function CommitteePanel({
  t, lang, extractErrorMessage,
  committeePanelOpen, closeCommitteePanel,
  loadingReviewers, reviewersError, availableReviewers,
  getReviewerRole, setReviewerRole,
  primaryReviewerIds, blindingType, setBlindingType,
  suggesting, lastSuggestionApplied, suggestCommitteeSmart,
  creatingCommittee, committeeError, handleCreateCommittee,
}) {
  if (!committeePanelOpen) return null;

  return (
    <div className="note-editor open" style={{ marginTop: 16 }}>
      <div className="dp-sec-label">
        {t('select_committee_l')}
      </div>
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4, marginBottom: 12 }}>
        {t('committee_hint')}
      </p>

      {/* ══ زر الاقتراح الذكي — يعبّي primary/substitute تلقائياً من نفس availableReviewers، بدون أي API إضافي ══ */}
      <button
        className="btn-smart-suggest"
        onClick={suggestCommitteeSmart}
        disabled={suggesting || loadingReviewers || availableReviewers.length === 0}
      >
        {suggesting ? <FiLoader className="spin-ico" size={14} /> : <HiSparkles size={15} />}
        {suggesting ? t('suggesting') : t('smart_suggest_btn')}
      </button>

      {lastSuggestionApplied && (
        <p className="smart-suggest-note">
          {t('suggestion_applied')}
        </p>
      )}

      {loadingReviewers ? (
        <div className="no-notes-msg">{t('loading')}</div>
      ) : reviewersError ? (
        <p style={{ color: '#EF4444', fontSize: 12 }}>
          {extractErrorMessage(reviewersError, lang) || t('reviewers_load_fail')}
        </p>
      ) : availableReviewers.length === 0 ? (
        <div className="no-notes-msg">
          {t('no_reviewers')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {availableReviewers.map(r => {
            const currentRole = getReviewerRole(r.user_id);
            return (
              <div
                key={r.user_id}
                className={`reviewer-row ${currentRole !== 'none' ? `role-${currentRole}` : ''}`}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    {r.full_name}{' '}
                    <span style={{ opacity: 0.55, fontWeight: 400, fontSize: 12 }}>#{r.user_id}</span>
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>
                    {r.email}{r.institution ? ` · ${r.institution}` : ''}
                  </span>
                </div>

                <select
                  className="editor-select"
                  value={currentRole}
                  onChange={e => setReviewerRole(r.user_id, e.target.value)}
                  style={{ minWidth: 110 }}
                >
                  <option value="none">{t('role_none')}</option>
                  <option value="primary">{t('role_primary')}</option>
                  <option value="substitute">{t('role_substitute')}</option>
                </select>
              </div>
            );
          })}
        </div>
      )}

      {/* عدّاد الأساسيين — لازم بالضبط 3 */}
      <p style={{
        fontSize: 12,
        marginTop: 12,
        fontWeight: 600,
        color: primaryReviewerIds.length === REQUIRED_PRIMARY_COUNT ? '#22C55E' : '#F59E0B',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        {primaryReviewerIds.length === REQUIRED_PRIMARY_COUNT
          ? <FiCheckCircle size={13} />
          : <FiAlertTriangle size={13} />}
        {primaryReviewerIds.length === REQUIRED_PRIMARY_COUNT
          ? t('primary_count_ok')
          : `${t('primary_count_bad')}${primaryReviewerIds.length})`}
      </p>

      {/* نوع التحكيم */}
      <div className="editor-field" style={{ marginTop: 12 }}>
        <label className="editor-label">{t('blinding_type_l')}</label>
        <select
          className="editor-select"
          value={blindingType}
          onChange={e => setBlindingType(e.target.value)}
        >
          <option value="single_blind">{t('single_blind')}</option>
          <option value="double_blind">{t('double_blind')}</option>
        </select>
      </div>

      <div className="note-editor-btns">
        <button className="btn-cancel-note" onClick={closeCommitteePanel} disabled={creatingCommittee}>
          <FiX size={13} />
          {t('cancel')}
        </button>
        <button
          className="btn-save-note"
          onClick={handleCreateCommittee}
          disabled={creatingCommittee || primaryReviewerIds.length !== REQUIRED_PRIMARY_COUNT}
        >
          {creatingCommittee ? <FiLoader className="spin-ico" size={13} /> : <FiCheck size={13} />}
          {creatingCommittee
            ? t('creating')
            : `${t('create_committee_btn')} (${primaryReviewerIds.length}/${REQUIRED_PRIMARY_COUNT})`}
        </button>
      </div>

      {committeeError && (
        <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
          {extractErrorMessage(committeeError, lang) || t('committee_fail')}
        </p>
      )}
    </div>
  );
}
