import styles from '../../styling/Submit.module.css';

const RTYPE_OPTIONS = [
  { value: 'technical', labelKey: 'rtype_technical', badgeKey: 'rtype_badge_both', badgeClass: 'rbBoth' },
  { value: 'master', labelKey: 'rtype_master', badgeKey: 'rtype_badge_student', badgeClass: 'rbStu' },
  { value: 'phd', labelKey: 'rtype_phd', badgeKey: 'rtype_badge_student', badgeClass: 'rbStu' },
];

export default function RtypeSelector({ rtype, setRtype, t }) {
  return (
    <div>
      <div className={styles.filterLabel}>{t('rtype_label')}</div>
      <div className={styles.rtypeGrid}>
        {RTYPE_OPTIONS.map((r) => (
          <label
            key={r.value}
            className={`${styles.rtypeItem} ${rtype === r.value ? styles.selected : ''}`}
          >
            <input
              type="radio"
              name="rtype"
              value={r.value}
              checked={rtype === r.value}
              onChange={() => setRtype(r.value)}
            />
            <span className={styles.rtypeText}>{t(r.labelKey)}</span>
            <span className={`${styles.rtypeBadge} ${styles[r.badgeClass]}`}>{t(r.badgeKey)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export { RTYPE_OPTIONS };
