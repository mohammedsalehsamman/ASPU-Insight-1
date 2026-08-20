export default function KeywordsSection({
  t, keywordsData, loadingKeywords, keywordsError, loadKeywordsSuggestion,
}) {
  return (
    <>
      <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('kw_l')}</div>
      {!keywordsData ? (
        <button className="add-note-btn" onClick={loadKeywordsSuggestion} disabled={loadingKeywords}>
          {loadingKeywords ? t('saving') : t('kw_load_btn')}
        </button>
      ) : keywordsData.keywords?.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          {keywordsData.keywords.map((kw, i) => (
            <span key={i} style={{
              background: 'var(--surf2)',
              border: '1px solid var(--bd)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              color: 'var(--ac)',
            }}>{kw}</span>
          ))}
        </div>
      ) : (
        <div className="no-notes-msg">
          {keywordsData.note || t('kw_none')}
        </div>
      )}
      {keywordsError && (
        <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
          {t('kw_fail')}
        </p>
      )}
    </>
  );
}
