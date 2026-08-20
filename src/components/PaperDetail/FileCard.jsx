import { FaFileAlt, FaDownload, FaFolderOpen } from 'react-icons/fa';
import { getErrorMessage } from '../../i18n/errorMessages';

export default function FileCard({ paper, lang, t, downloading, downloadError, onDownload }) {
  return (
    <div className="pd-detail-card">
      <div className="pd-section-label">{t('file_label')}</div>
      {paper.pdf_file ? (
        <div className="pd-pdf-available">
          <div className="pd-pdf-icon"><FaFileAlt /></div>
          <div className="pd-pdf-info">
            <div className="pd-pdf-name">{paper.pdf_file}</div>
            <div className="pd-pdf-sub">{t('pdf_attached_sub')}</div>
          </div>

          <button
            className="pd-pdf-download-btn"
            onClick={onDownload}
            disabled={downloading}
          >
            <FaDownload size={12} />
            {downloading
              ? (lang === 'ar' ? 'جارٍ التحميل...' : 'Downloading...')
              : t('download')}
          </button>
        </div>
      ) : (
        <div className="pd-pdf-missing">
          <span className="pd-pdf-missing-icon"><FaFolderOpen /></span>
          <span>{t('pdf_missing')}</span>
        </div>
      )}
      {downloadError && (
        <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
          {getErrorMessage(downloadError, lang)}
        </p>
      )}
    </div>
  );
}
