import { CaretDown } from '@phosphor-icons/react';
import styles from '../../styling/Submit.module.css';

export default function DetailsSection({ openSection, toggleSection, title, setTitle, abstract, setAbstract }) {
  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.sectionTitle}
        onClick={() => toggleSection(1)}
        aria-expanded={openSection === 1}
      >
        <span className={styles.sectionTitleText}>
          تفاصيل البحث
          <span className={styles.sectionSubtitle}>العنوان والخلاصة</span>
        </span>
        <span className={`${styles.chevron} ${openSection === 1 ? styles.open : ''}`}>
          <CaretDown size={14} />
        </span>
      </button>

      {openSection === 1 && (
        <div>
          <div className={styles.inputGroup}>
            <label htmlFor="title">
              عنوان البحث <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="title"
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان البحث كاملاً..."
              required
            />
            <span className={styles.charCount}>{title.length}/150</span>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="abstract">
              الخلاصة (Abstract) <span className={styles.required}>*</span>
            </label>
            <textarea
              id="abstract"
              maxLength={1000}
              rows={6}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="اكتب خلاصة البحث هنا..."
              required
            />
            <span className={styles.charCount}>{abstract.length}/1000</span>
          </div>
        </div>
      )}
    </div>
  );
}