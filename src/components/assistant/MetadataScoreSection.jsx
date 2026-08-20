import MetadataScoreResult from './MetadataScoreResult';

export default function MetadataScoreSection({
  t, lang, metadataScoreData, loadingMetadataScore, metadataScoreError, loadMetadataScore,
}) {
  return (
    <>
      <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('metadata_score_l')}</div>
      {!metadataScoreData ? (
        <button
          className="add-note-btn"
          onClick={loadMetadataScore}
          disabled={loadingMetadataScore}
        >
          {loadingMetadataScore ? t('saving') : t('metadata_score_btn')}
        </button>
      ) : (
        <MetadataScoreResult data={metadataScoreData} t={t} lang={lang} />
      )}
      {metadataScoreError && (
        <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
          {t('metadata_score_fail')}
        </p>
      )}
    </>
  );
}
