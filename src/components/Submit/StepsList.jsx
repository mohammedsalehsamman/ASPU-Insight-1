import styles from '../../styling/Submit.module.css';

const STEPS = [
  { num: 1, label: 'تفاصيل البحث', desc: 'العنوان والخلاصة' },
  { num: 2, label: 'ملف البحث', desc: 'رفع ملف PDF' },
];

export default function StepsList({ openSection }) {
  return (
    <div>
      <div className={styles.filterLabel}>خطوات النشر</div>
      <div className={styles.stepsList}>
        {STEPS.map((s) => {
          const state =
            s.num === openSection ? styles.active : s.num < openSection ? styles.done : '';
          return (
            <div className={`${styles.step} ${state}`} key={s.num}>
              <div className={styles.stepCircle}>{s.num}</div>
              <div>
                <div className={styles.stepLabel}>{s.label}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { STEPS };