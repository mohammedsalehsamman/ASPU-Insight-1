import styles from '../../styling/Submit.module.css';

const STEPS = [
  { num: 1, labelKey: 'step1_label', descKey: 'step1_desc' },
  { num: 2, labelKey: 'step2_label', descKey: 'step2_desc' },
];

export default function StepsList({ openSection, t }) {
  return (
    <div>
      <div className={styles.filterLabel}>{t('steps_label')}</div>
      <div className={styles.stepsList}>
        {STEPS.map((s) => {
          const state =
            s.num === openSection ? styles.active : s.num < openSection ? styles.done : '';
          return (
            <div className={`${styles.step} ${state}`} key={s.num}>
              <div className={styles.stepCircle}>{s.num}</div>
              <div>
                <div className={styles.stepLabel}>{t(s.labelKey)}</div>
                <div className={styles.stepDesc}>{t(s.descKey)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { STEPS };
