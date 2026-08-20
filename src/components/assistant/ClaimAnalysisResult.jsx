import { FiClock, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

/* ← عرض موحّد لنتيجة تحليل الادعاءات والأدلة حسب الـ status (قيد المعالجة / فشل / نجح) —
   مستخدم بمكانين: بانل تفاصيل البحث (نتيجة فورية بعد السبمت) وبانل تفاصيل التحليل (من القائمة) */
export default function ClaimAnalysisResult({ data, t, lang }) {
  if (!data) return null;

  const isFailed = data.status === 'failed';
  const isDone = data.status === 'completed' || data.status === 'success' || data.status === 'done';
  const isPending = !isFailed && !isDone; // ← يغطي pending / processing / أي قيمة غير معروفة بعد

  if (isPending) {
    return (
      <div className="no-notes-msg" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: lang === 'ar' ? 'right' : 'left' }}>
        <span style={{ fontSize: 18, lineHeight: 1, display: 'inline-flex' }}><FiClock /></span>
        <div>
          <div style={{ fontWeight: 600 }}>{t('claim_status_pending_title')}</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{t('claim_status_pending_sub')}</div>
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="no-notes-msg" style={{ borderColor: '#EF4444', color: '#EF4444', display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: lang === 'ar' ? 'right' : 'left' }}>
        <span style={{ fontSize: 18, lineHeight: 1, display: 'inline-flex' }}><FiAlertTriangle /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{t('claim_status_failed_title')}</div>
          <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>{t('claim_status_failed_sub')}</div>
          {data.error_message && (
            <details style={{ marginTop: 10 }}>
              <summary style={{ cursor: 'pointer', fontSize: 11, opacity: 0.75, color: 'inherit' }}>
                {t('claim_tech_details')}
              </summary>
              <div style={{ fontSize: 11, marginTop: 6, direction: 'ltr', textAlign: 'left', opacity: 0.75, wordBreak: 'break-word', fontFamily: 'monospace' }}>
                {data.error_message}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  // ── نجح التحليل: نعرض النتيجة فوراً ──
  return (
    <>
      <div className="no-notes-msg" style={{ borderColor: 'var(--ac2)', color: 'var(--ac2)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18, lineHeight: 1, display: 'inline-flex' }}><FiCheckCircle /></span>
        <div style={{ fontWeight: 600 }}>{t('claim_status_done_title')}</div>
      </div>

      <div className="dp-info-grid" style={{ marginTop: 12 }}>
        <div className="dp-info-cell">
          <div className="dp-info-label">{t('claims_count_l')}</div>
          <div className="dp-info-val">{data.claims_count}</div>
        </div>
        <div className="dp-info-cell">
          <div className="dp-info-label">{t('evidence_count_l')}</div>
          <div className="dp-info-val">{data.evidence_count}</div>
        </div>
        <div className="dp-info-cell">
          <div className="dp-info-label">{t('neutral_count_l')}</div>
          <div className="dp-info-val">{data.neutral_count}</div>
        </div>
        <div className="dp-info-cell">
          <div className="dp-info-label">{t('edges_count_l')}</div>
          <div className="dp-info-val">{data.edges_count}</div>
        </div>
        <div className="dp-info-cell">
          <div className="dp-info-label">{t('similarity_threshold_l')}</div>
          <div className="dp-info-val">{data.similarity_threshold}</div>
        </div>
        <div className="dp-info-cell">
          <div className="dp-info-label">{t('top_claims_count_l')}</div>
          <div className="dp-info-val">{data.top_claims_count}</div>
        </div>
      </div>

      <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('claim_summary_l')}</div>
      <div className="dp-abstract">{data.summary || t('no_claims_summary')}</div>

      {data.source_excerpt && (
        <>
          <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('source_excerpt_l')}</div>
          <div className="dp-abstract">{data.source_excerpt}</div>
        </>
      )}

      {data.top_claims?.length > 0 && (
        <>
          <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('top_claims_l')}</div>
          <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 13, lineHeight: 1.8 }}>
            {data.top_claims.map((c, i) => (
              <li key={i}>{typeof c === 'string' ? c : JSON.stringify(c)}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
