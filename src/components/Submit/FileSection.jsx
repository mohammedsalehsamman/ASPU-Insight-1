import { PiUploadSimpleDuotone, PiCaretDown } from 'react-icons/pi';
import styles from '../../styling/Submit.module.css';

export default function FileSection({
  openSection, toggleSection,
  file, fileInputRef, handleFileChange, handleFileDrop,
  dragOver, setDragOver, t,
}) {
  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.sectionTitle}
        onClick={() => toggleSection(3)}
        aria-expanded={openSection === 3}
      >
        <span className={styles.sectionTitleText}>
          {t('file_section_title')}
          <span className={styles.sectionSubtitle}>{t('file_section_subtitle')}</span>
        </span>
        <span className={`${styles.chevron} ${openSection === 3 ? styles.open : ''}`}>
          <PiCaretDown size={14} />
        </span>
      </button>

      {openSection === 3 && (
        <div>
          <div className={styles.inputGroup}>
            <div className={styles.fileUploadZone}>
              <input
                type="file"
                id="file-upload"
                accept=".pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                className={styles.hiddenFileInput}
                required={!file}
              />
              <label
                htmlFor="file-upload"
                className={`${styles.fileLabel} ${dragOver ? styles.dragOver : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
              >
                <div className={styles.uploadIcon}>
                  <PiUploadSimpleDuotone size={32} />
                </div>
                {file ? (
                  <span className={styles.fileName}>
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                ) : (
                  <span>{t('file_drop_text')}</span>
                )}
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
