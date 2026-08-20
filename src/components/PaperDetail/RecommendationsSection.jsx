import RecommendationCard from './RecommendationCard';
import { getErrorMessage } from '../../i18n/errorMessages';

export default function RecommendationsSection({ lang, loading, error, recommendations }) {
  return (
    <div className="pd-detail-card">
      <div className="pd-section-label">
        {lang === 'ar' ? 'أبحاث مشابهة' : 'Similar Papers'}
      </div>

      {loading && (
        <p style={{ fontSize: 13, opacity: 0.7 }}>
          {lang === 'ar' ? 'جارٍ تحميل الأبحاث المشابهة...' : 'Loading similar papers...'}
        </p>
      )}

      {!loading && error && (
        <p style={{ color: '#EF4444', fontSize: 12 }} role="alert">{getErrorMessage(error, lang)}</p>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <p style={{ fontSize: 13, opacity: 0.6 }}>
          {lang === 'ar' ? 'لا توجد أبحاث مشابهة حالياً' : 'No similar papers found'}
        </p>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
