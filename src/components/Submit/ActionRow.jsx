import { PiArrowLeftBold } from 'react-icons/pi';
import styles from '../../styling/Submit.module.css';

export default function ActionRow({ loading, handleReset, t }) {
  return (
    <div className={styles.actionRow}>
      <div className={styles.actionInfo}>
        <div className={styles.actionTitle}>{t('action_title')}</div>
        <div className={styles.actionSub}>{t('action_sub')}</div>
      </div>
      <div className={styles.actionBtns}>
        <button type="button" onClick={handleReset} className={styles.resetBtn} disabled={loading}>
          {t('reset_btn')}
        </button>
        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? t('submitting') : (
            <>
              {t('submit_btn')}{' '}
              <span className={styles.arrow}>
                <PiArrowLeftBold size={16} />
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
