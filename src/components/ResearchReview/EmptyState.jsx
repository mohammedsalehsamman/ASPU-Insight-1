import { Warning, ArrowClockwise, FilePlus, ArrowLeft } from '@phosphor-icons/react';

export function LoadingState() {
  return (
    <div className="rr-state-center">
      <div className="rr-spinner" />
      <span>جاري التحميل…</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="rr-state-center">
      <Warning size={36} weight="duotone" style={{ color: 'var(--ac)' }} />
      <span className="rr-error-msg">{error}</span>
      <button
        className="reset-btn"
        style={{ width: 'auto', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 7 }}
        onClick={onRetry}
      >
        <ArrowClockwise size={14} weight="bold" />
        إعادة المحاولة
      </button>
    </div>
  );
}

export default function EmptyState({ hasFilters, onClearFilters, onSubmit }) {
  return (
    <div className="rr-state-center">
      <div className="rr-empty-ico">
        <FilePlus size={48} weight="duotone" style={{ color: 'var(--ac)', opacity: .7 }} />
      </div>

      {hasFilters ? (
        <>
          <span className="rr-empty-title">لا توجد أبحاث تطابق معايير البحث</span>
          <span className="rr-empty-sub">جرّب تغيير الفلاتر أو مسح نص البحث</span>
          <button
            className="reset-btn"
            style={{ width: 'auto', padding: '9px 22px', marginTop: 4 }}
            onClick={onClearFilters}
          >
            مسح الفلاتر
          </button>
        </>
      ) : (
        <>
          <span className="rr-empty-title">لا توجد أبحاث منشورة بعد</span>
          <span className="rr-empty-sub">
            كن أول من ينشر بحثه على ASPU Insight
          </span>
          <button className="rr-submit-cta" onClick={onSubmit}>
            <FilePlus size={16} weight="bold" />
            نشر بحث جديد
            <ArrowLeft size={15} weight="bold" />
          </button>
        </>
      )}
    </div>
  );
}