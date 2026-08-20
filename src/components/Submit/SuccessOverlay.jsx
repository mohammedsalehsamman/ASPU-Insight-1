import { PiCheckCircleFill } from 'react-icons/pi';
import styles from '../../styling/Submit.module.css';

export default function SuccessOverlay({ successRef, onClose, t }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.overlayCard}>
        <div className={styles.successCheck}>
          <PiCheckCircleFill size={36} />
        </div>
        <h3>{t('success_title')}</h3>
        <p>{t('success_msg')}</p>
        <button onClick={onClose} className={styles.closeOverlayBtn}>
          {t('success_ok')}
        </button>
      </div>
    </div>
  );
}
