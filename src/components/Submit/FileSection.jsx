import { UploadSimple, CaretDown } from '@phosphor-icons/react';
import styles from '../../styling/Submit.module.css';

export default function FileSection({
  openSection, toggleSection,
  file, fileInputRef, handleFileChange, handleFileDrop,
  dragOver, setDragOver,
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
          ملف البحث
          <span className={styles.sectionSubtitle}>رفع ملف PDF</span>
        </span>
        <span className={`${styles.chevron} ${openSection === 3 ? styles.open : ''}`}>
          <CaretDown size={14} />
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
                  <UploadSimple size={32} weight="duotone" />
                </div>
                {file ? (
                  <span className={styles.fileName}>
                    {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                ) : (
                  <span>اسحب ملف البحث بصيغة PDF أو انقر للاختيار</span>
                )}
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}