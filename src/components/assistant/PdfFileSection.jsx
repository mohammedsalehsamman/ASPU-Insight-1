import { FiFileText, FiDownload } from 'react-icons/fi';

export default function PdfFileSection({ activePaper, t, handleDownloadPdf }) {
  return (
    <>
      <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('file')}</div>
      {activePaper.pdf_file ? (
        <div className="dp-pdf-block">
          <div className="dp-pdf-bar">
            <div className="dp-pdf-ico">
              <FiFileText size={18} color="var(--ac)" />
            </div>
            <span className="dp-pdf-name">
              {activePaper.pdf_file.split('/').pop()}
            </span>
            <button
              type="button"
              className="dp-pdf-dl"
              onClick={handleDownloadPdf}
            >
              <FiDownload size={12} />
              {t('download')}
            </button>
          </div>
        </div>
      ) : (
        <div className="no-notes-msg">{t('no_file')}</div>
      )}
    </>
  );
}
