import styles from '../../styling/Submit.module.css';

const RTYPE_OPTIONS = [
  { value: 'technical', label: 'بحث علمي / تقني', badge: 'للجميع', badgeClass: 'rbBoth' },
  { value: 'master', label: "رسالة ماجستير", badge: 'طالب', badgeClass: 'rbStu' },
  { value: 'phd', label: 'رسالة دكتوراه', badge: 'طالب', badgeClass: 'rbStu' },
];

export default function RtypeSelector({ rtype, setRtype }) {
  return (
    <div>
      <div className={styles.filterLabel}>نوع البحث</div>
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
            <span className={styles.rtypeText}>{r.label}</span>
            <span className={`${styles.rtypeBadge} ${styles[r.badgeClass]}`}>{r.badge}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export { RTYPE_OPTIONS };