import { PiCheckCircleFill } from 'react-icons/pi';
import styles from '../../styling/Submit.module.css';

export default function SummaryBox({ roleLabel, rtypeLabel, discLabel, file, t }) {
  return (
    <div className={styles.summaryBox}>
      <div className={styles.summaryTitle}>{t('summary_title')}</div>
      <div className={styles.summaryRow}>
        <span>{t('summary_publisher_type')}</span>
        <strong>{roleLabel}</strong>
      </div>
      <div className={styles.summaryRow}>
        <span>{t('summary_research_type')}</span>
        <strong>{rtypeLabel}</strong>
      </div>
      <div className={styles.summaryRow}>
        <span>{t('summary_discipline')}</span>
        <strong>{discLabel}</strong>
      </div>
      <div className={styles.summaryDivider} />
      <div className={styles.summaryRow}>
        <span>{t('summary_file')}</span>
        {file ? (
          <strong className={styles.summaryOk}>
            <PiCheckCircleFill size={14} /> {file.name}
          </strong>
        ) : (
          <span className={styles.summaryMuted}>{t('summary_not_uploaded')}</span>
        )}
      </div>
    </div>
  );
}
