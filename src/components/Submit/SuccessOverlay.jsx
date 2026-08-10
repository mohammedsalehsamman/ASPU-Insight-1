import { CheckCircle } from '@phosphor-icons/react';
import styles from '../../styling/Submit.module.css';

export default function SuccessOverlay({ successRef, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.overlayCard}>
        <div className={styles.successCheck}>
          <CheckCircle size={36} weight="fill" />
        </div>
        <h3>تم تقديم البحث بنجاح!</h3>
        <p>تم تسجيل البحث في نظام ASPU Insight بنجاح وجاري تحويله إلى نظام مراجعة الذكاء الاصطناعي.</p>
        <button onClick={onClose} className={styles.closeOverlayBtn}>
          موافق
        </button>
      </div>
    </div>
  );
}