// ← خاص بصفحة "المحرر" فقط: تظهر إذا القرار SEND_TO_COMMITTEE — اختيار أعضاء اللجنة وإنشاؤها
// getAvailableReviewers / createCommittee
export default function CommitteePanel({
  t, initialReview,
  committeePanelOpen, openCommitteePanel, closeCommitteePanel,
  loadingReviewers, reviewersError, availableReviewers,
  selectedReviewerIds, toggleReviewer,
  creatingCommittee, committeeError, committeeSuccess,
  handleCreateCommittee,
}) {
  return (
    <>
      {initialReview?.decision === 'SEND_TO_COMMITTEE' && !committeePanelOpen && !committeeSuccess && (
        <button
          onClick={openCommitteePanel}
          style={{
            background: "#5A8FA0", color: "#fff", padding: "12px 20px",
            border: "none", borderRadius: "10px", cursor: "pointer",
            fontWeight: "600", marginTop: 16,
          }}
        >
          {t('view_committee_members')}
        </button>
      )}

      {committeeSuccess && (
        <p style={{ color: '#22C55E', fontSize: 13, marginTop: 12, fontWeight: 600 }}>
          {t('committee_created')}
        </p>
      )}

      {committeePanelOpen && (
        <div className="note-editor open" style={{ marginTop: 16 }}>
          <div className="dp-sec-label">{t('select_committee')}</div>

          {loadingReviewers ? (
            <div className="no-notes-msg">{t('loading')}</div>
          ) : reviewersError ? (
            <p style={{ color: '#EF4444', fontSize: 12 }}>{t('load_reviewers_fail')}</p>
          ) : availableReviewers.length === 0 ? (
            <div className="no-notes-msg">{t('no_reviewers')}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {availableReviewers.map(r => (
                <label
                  key={r.user_id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    border: '1px solid var(--border)', borderRadius: 10,
                    padding: '10px 12px', cursor: 'pointer',
                    background: selectedReviewerIds.includes(r.user_id) ? 'var(--card-bg)' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedReviewerIds.includes(r.user_id)}
                    onChange={() => toggleReviewer(r.user_id)}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      {r.full_name}{' '}
                      <span style={{ opacity: 0.55, fontWeight: 400, fontSize: 12 }}>#{r.user_id}</span>
                    </span>
                    <span style={{ fontSize: 12, opacity: 0.7 }}>
                      {r.email}{r.institution ? ` · ${r.institution}` : ''}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="note-editor-btns">
            <button className="btn-cancel-note" onClick={closeCommitteePanel} disabled={creatingCommittee}>
              {t('cancel')}
            </button>
            <button
              className="btn-save-note"
              onClick={handleCreateCommittee}
              disabled={creatingCommittee || selectedReviewerIds.length === 0}
            >
              {creatingCommittee ? t('creating') : `${t('create_committee')} (${selectedReviewerIds.length})`}
            </button>
          </div>

          {committeeError && (
            <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>{t('create_committee_fail')}</p>
          )}
        </div>
      )}
    </>
  );
}
