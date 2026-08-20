import { FaLockOpen, FaCheck } from 'react-icons/fa';

export default function InfoCard({ paper, status, t }) {
  return (
    <div className="pd-meta-card">
      <div className="pd-section-label">{t('info_label')}</div>

      <div className="pd-meta-row">
        <span className="pd-meta-key">{t('paper_number')}</span>
        <span className="pd-meta-val pd-meta-val--gold">#{paper.id}</span>
      </div>

      <div className="pd-meta-row">
        <span className="pd-meta-key">{t('status_key')}</span>
        <span className={`pd-meta-val ${status.metaCls}`}>{status.label}</span>
      </div>

      <div className="pd-meta-row">
        <span className="pd-meta-key">{t('access_type')}</span>
        <span className="pd-meta-val">
          {paper.is_paid_open_access ? (
            <span className="pd-oa-indicator pd-oa-yes"><FaLockOpen size={12} /> {t('open_paid')}</span>
          ) : (
            <span className="pd-oa-indicator pd-oa-no">{t('closed')}</span>
          )}
        </span>
      </div>

      <div className="pd-meta-row">
        <span className="pd-meta-key">{t('author_key')}</span>
        <span className="pd-meta-val pd-meta-val--blue">{paper.author_name}</span>
      </div>

      <div className="pd-meta-row">
        <span className="pd-meta-key">{t('pdf_key')}</span>
        <span className="pd-meta-val">
          {paper.pdf_file ? (
            <>{t('available')} <FaCheck size={11} /></>
          ) : (
            t('not_attached')
          )}
        </span>
      </div>
    </div>
  );
}
