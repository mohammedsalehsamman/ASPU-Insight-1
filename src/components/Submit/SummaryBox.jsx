import { CheckCircle } from '@phosphor-icons/react';
import styles from '../../styling/Submit.module.css';

export default function SummaryBox({ roleLabel, rtypeLabel, discLabel, file }) {
  return (
    <div className={styles.summaryBox}>
      <div className={styles.summaryTitle}>ملخص الطلب</div>
      <div className={styles.summaryRow}>
        <span>نوع الناشر</span>
        <strong>{roleLabel}</strong>
      </div>
      <div className={styles.summaryRow}>
        <span>نوع البحث</span>
        <strong>{rtypeLabel}</strong>
      </div>
      <div className={styles.summaryRow}>
        <span>التخصص</span>
        <strong>{discLabel}</strong>
      </div>
      <div className={styles.summaryDivider} />
      <div className={styles.summaryRow}>
        <span>ملف البحث</span>
        {file ? (
          <strong className={styles.summaryOk}>
            <CheckCircle size={14} weight="fill" /> {file.name}
          </strong>
        ) : (
          <span className={styles.summaryMuted}>لم يُرفع بعد</span>
        )}
      </div>
    </div>
  );
}