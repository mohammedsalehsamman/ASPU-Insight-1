import { Link } from 'react-router-dom';
import { FaLockOpen } from 'react-icons/fa';

export default function PageHeader({ paper, status, t }) {
  return (
    <div className="pd-page-header">
      <div className="pd-ph-inner">

        <nav className="pd-breadcrumb" aria-label="breadcrumb">
          <Link to="/">{t('breadcrumb_home')}</Link>
          <span className="pd-breadcrumb-sep">›</span>
          <Link to="/papers">{t('breadcrumb_research')}</Link>
          <span className="pd-breadcrumb-sep">›</span>
          <span>{t('breadcrumb_details')}</span>
        </nav>

        <div className="pd-badges">
          <span className={`pd-status-badge ${status.badgeCls}`}>
            <span className="pd-badge-dot" />
            {status.label}
          </span>

          {paper.is_paid_open_access && (
            <span className="pd-oa-badge"><FaLockOpen size={12} /> {t('open_access_badge')}</span>
          )}

          <span className="pd-paper-id"># PAPER-{String(paper.id).padStart(4, '0')}</span>
        </div>

        <h1 className="pd-title">{paper.title}</h1>

        <div className="pd-author-row">
          <div className="pd-author-chip">
            <span className="pd-chip-dot" />
            <span>{t('author_label')}</span>
            <span className="pd-chip-email">{paper.author_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
