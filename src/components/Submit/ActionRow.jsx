import { ArrowLeft } from '@phosphor-icons/react';
import styles from '../../styling/Submit.module.css';

export default function ActionRow({ loading, handleReset }) {
  return (
    <div className={styles.actionRow}>
      <div className={styles.actionInfo}>
        <div className={styles.actionTitle}>هل أنت جاهز للإرسال؟</div>
        <div className={styles.actionSub}>سيتم مراجعة البحث من قبل النظام والمحررين</div>
      </div>
      <div className={styles.actionBtns}>
        <button type="button" onClick={handleReset} className={styles.resetBtn} disabled={loading}>
          إعادة تعيين
        </button>
        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'جاري الإرسال...' : (
            <>
              تقديم البحث للمراجعة{' '}
              <span className={styles.arrow}>
                <ArrowLeft size={16} weight="bold" />
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}