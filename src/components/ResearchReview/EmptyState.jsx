import { PiWarningDuotone, PiArrowClockwiseBold, PiFilePlusDuotone, PiFilePlusBold, PiArrowLeftBold } from 'react-icons/pi';
import { useTranslation } from 'react-i18next';

export function LoadingState() {
  const { t } = useTranslation();
  return (
    <div className="rr-state-center">
      <div className="rr-spinner" />
      <span>{t('researchReview.loading')}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="rr-state-center">
      <PiWarningDuotone size={36} style={{ color: 'var(--ac)' }} />
      <span className="rr-error-msg">{error}</span>
      <button
        className="reset-btn"
        style={{ width: 'auto', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 7 }}
        onClick={onRetry}
      >
        <PiArrowClockwiseBold size={14} />
        {t('researchReview.retry')}
      </button>
    </div>
  );
}

export default function EmptyState({ hasFilters, onClearFilters, onSubmit }) {
  const { t } = useTranslation();
  const rr = t('researchReview', { returnObjects: true });

  return (
    <div className="rr-state-center">
      <div className="rr-empty-ico">
        <PiFilePlusDuotone size={48} style={{ color: 'var(--ac)', opacity: .7 }} />
      </div>

      {hasFilters ? (
        <>
          <span className="rr-empty-title">{rr.noMatchTitle}</span>
          <span className="rr-empty-sub">{rr.noMatchSub}</span>
          <button
            className="reset-btn"
            style={{ width: 'auto', padding: '9px 22px', marginTop: 4 }}
            onClick={onClearFilters}
          >
            {rr.clearFilters}
          </button>
        </>
      ) : (
        <>
          <span className="rr-empty-title">{rr.noPapersTitle}</span>
          <span className="rr-empty-sub">
            {rr.noPapersSub}
          </span>
          <button className="rr-submit-cta" onClick={onSubmit}>
            <PiFilePlusBold size={16} />
            {rr.submitCta}
            <PiArrowLeftBold size={15} />
          </button>
        </>
      )}
    </div>
  );
}
