import { FaLockOpen, FaFilePdf, FaFolderOpen, FaArrowLeft } from 'react-icons/fa';

const STATUS_CONFIG = {
  pending:  { ar: 'قيد المراجعة', cls: 'rr-sb-pending'  },
  approved: { ar: 'منشور',        cls: 'rr-sb-approved' },
  rejected: { ar: 'مرفوض',        cls: 'rr-sb-rejected' },
};

export default function PaperCard({ paper, onClick }) {
  const st = STATUS_CONFIG[paper.status] ?? STATUS_CONFIG.pending;

  return (
    <div className="rc-paper" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>

      <div className="rcp-top">
        <div className="rcp-tags">
          <span className={`rr-status-badge ${st.cls}`}>
            <span className="rr-badge-dot" />
            {st.ar}
          </span>
          {paper.is_paid_open_access && (
            <span className="rr-oa-badge">
              <FaLockOpen size={11} /> مفتوح
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
            ? <><FaFilePdf size={14} /> PDF متوفر</>
            : <><FaFolderOpen size={14} /> لا يوجد PDF</>}
        </span>
        <span className="rr-view-more">
          عرض التفاصيل
          <FaArrowLeft size={13} />
        </span>
      </div>
    </div>
  );
}