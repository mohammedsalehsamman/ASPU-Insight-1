import { FaLockOpen, FaFilePdf, FaFolderOpen, FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function PaperCard({ paper, onClick }) {
  const { t } = useTranslation();
  const rr = t('researchReview', { returnObjects: true });
  const statusCls = {
    pending: 'rr-sb-pending',
    approved: 'rr-sb-approved',
    published: 'rr-sb-approved',
    rejected: 'rr-sb-rejected',
  };
  const statusKey = statusCls[paper.status] ? paper.status : 'pending';

  return (
    <div className="rc-paper" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>

      <div className="rcp-top">
        <div className="rcp-tags">
          <span className={`rr-status-badge ${statusCls[statusKey]}`}>
            <span className="rr-badge-dot" />
            {rr.status[statusKey]}
          </span>
          {paper.is_paid_open_access && (
            <span className="rr-oa-badge">
              <FaLockOpen size={11} /> {rr.openAccessBadge}
            </span>
          )}
        </div>
        <span className="rr-paper-id">#{paper.id}</span>
      </div>

      <h3 className="rcp-title">{paper.title}</h3>

      <p className="rcp-excerpt">{paper.abstract}</p>

      <div className="rcp-meta">
        <span className="rcp-author">{paper.author_name}</span>
        <span className="rcp-sep">•</span>
        <span>ASPU</span>
      </div>

      <div className="rr-card-footer">
        <span className="rr-pdf-indicator">
          {paper.pdf_file
            ? <><FaFilePdf size={14} /> {rr.pdfAvailable}</>
            : <><FaFolderOpen size={14} /> {rr.noPdf}</>}
        </span>
        <span className="rr-view-more">
          {rr.viewMore}
          <FaArrowLeft size={13} />
        </span>
      </div>
    </div>
  );
}
