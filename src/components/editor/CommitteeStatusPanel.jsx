import { FiX } from 'react-icons/fi';
import { MEMBER_RESPONSE_MAP, MEMBER_DECISION_MAP } from './editorConstants';

/* ← بانل حالة اللجنة الكاملة (أعضاء + ردودهم + قراراتهم) — يُعرض بعد إنشاء اللجنة */
export default function CommitteeStatusPanel({
  t, lang, extractErrorMessage,
  committeeStatusOpen, closeCommitteeStatusPanel,
  loadingCommitteeStatus, committeeStatusError, committeeStatus,
}) {
  if (!committeeStatusOpen) return null;

  return (
    <div className="note-editor open" style={{ marginTop: 16 }}>
      <div className="dp-header" style={{ padding: 0, marginBottom: 12, border: 'none' }}>
        <span className="dp-header-title" style={{ margin: 0 }}>{t('committee_status_title')}</span>
      </div>

      {loadingCommitteeStatus ? (
        <div className="no-notes-msg">{t('loading')}</div>
      ) : committeeStatusError ? (
        <p style={{ color: '#EF4444', fontSize: 12 }}>{extractErrorMessage(committeeStatusError, lang) || t('committee_status_load_fail')}</p>
      ) : committeeStatus ? (
        <>
          <div className="dp-info-grid" style={{ marginBottom: 16 }}>
            <div className="dp-info-cell">
              <div className="dp-info-label">{t('blinding_type_l')}</div>
              <div className="dp-info-val">
                {committeeStatus.blinding_type === 'double_blind' ? t('double_blind') : t('single_blind')}
              </div>
            </div>
            <div className="dp-info-cell">
              <div className="dp-info-label">{t('committee_created_by')}</div>
              <div className="dp-info-val">{committeeStatus.editor_name}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(committeeStatus.members ?? []).map(member => {
              const respMeta = MEMBER_RESPONSE_MAP[member.response] ?? MEMBER_RESPONSE_MAP.pending;
              const decMeta = MEMBER_DECISION_MAP[member.paper_decision] ?? MEMBER_DECISION_MAP.pending;
              return (
                <div key={member.id} className="reviewer-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      {member.user?.full_name}{' '}
                      <span style={{ opacity: 0.55, fontWeight: 400, fontSize: 12 }}>
                        {member.user?.institution ? `· ${member.user.institution}` : ''}
                      </span>
                    </span>
                    <span className={`pc-status ${respMeta.cls}`}>
                      <span className="pc-status-dot" />
                      {lang === 'ar' ? respMeta.ar : respMeta.en}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 12, opacity: 0.7 }}>{t('member_decision_l')}</span>
                    <span className={`pc-status ${decMeta.cls}`}>
                      <span className="pc-status-dot" />
                      {lang === 'ar' ? decMeta.ar : decMeta.en}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 2 }}>{t('member_comment_l')}</div>
                    <div style={{ fontSize: 13 }}>
                      {member.comments?.trim() ? member.comments : t('no_comment')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      <div className="note-editor-btns">
        <button className="btn-cancel-note" onClick={closeCommitteeStatusPanel}>
          <FiX size={13} />
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}
