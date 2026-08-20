import { scoreColor } from './assistantConstants';

/* ← عرض نتيجة درجة جودة الميتاداتا (title/abstract/keywords/author_info...الخ) —
   الشكل: درجة كلية بارزة + حالة + تفصيل كل بند (label/score/weight/message) + توصيات */
export default function MetadataScoreResult({ data, t, lang }) {
  if (!data) return null;

  const overall = data.overall_score ?? 0;

  return (
    <>
      {/* الدرجة الكلية + الحالة */}
      <div
        className="no-notes-msg"
        style={{
          borderColor: scoreColor(overall),
          color: scoreColor(overall),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>{overall}%</span>
          <span style={{ fontSize: 12, opacity: 0.85 }}>{t('metadata_overall_l')}</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          {t('metadata_status_l')}: {data.status_display || data.status}
        </span>
      </div>

      {/* تفصيل كل بند */}
      {data.breakdown?.length > 0 && (
        <>
          <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('metadata_breakdown_l')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.breakdown.map((b, i) => (
              <div key={b.dimension ?? i} className="dp-info-cell" style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: lang === 'ar' ? 'right' : 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{b.label}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, opacity: 0.6 }}>{t('metadata_weight_l')}: {b.weight}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: scoreColor(b.score) }}>{b.score}%</span>
                  </span>
                </div>
                {b.message && (
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{b.message}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* التوصيات */}
      <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('recommendations_l')}</div>
      {data.recommendations?.length > 0 ? (
        <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 13, lineHeight: 1.8 }}>
          {data.recommendations.map((rec, i) => (
            <li key={i}>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</li>
          ))}
        </ul>
      ) : (
        <div className="no-notes-msg">{t('metadata_no_recommendations')}</div>
      )}
    </>
  );
}
