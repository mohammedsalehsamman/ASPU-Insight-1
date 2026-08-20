import {
  PiRobotDuotone,
  PiLockKeyDuotone,
  PiGlobeDuotone,
  PiDeviceMobileDuotone,
  PiChartBarDuotone,
  PiCodeDuotone,
  PiShapesDuotone,
} from 'react-icons/pi';
import styles from '../../styling/Submit.module.css';

const DISCIPLINE_OPTIONS = [
  { value: 'ai', icon: PiRobotDuotone, nameKey: 'disc_ai' },
  { value: 'sec', icon: PiLockKeyDuotone, nameKey: 'disc_sec' },
  { value: 'net', icon: PiGlobeDuotone, nameKey: 'disc_net' },
  { value: 'app', icon: PiDeviceMobileDuotone, nameKey: 'disc_app' },
  { value: 'data', icon: PiChartBarDuotone, nameKey: 'disc_data' },
  { value: 'se', icon: PiCodeDuotone, nameKey: 'disc_se' },
  { value: 'other', icon: PiShapesDuotone, nameKey: 'disc_other' },
];

export default function DisciplineSelector({ discipline, setDiscipline, t }) {
  return (
    <div>
      <div className={styles.filterLabel}>{t('discipline_label')}</div>
      <div className={styles.discGrid}>
        {DISCIPLINE_OPTIONS.map((d) => (
          <label key={d.value} className={styles.discItem}>
            <input
              type="radio"
              name="discipline"
              value={d.value}
              checked={discipline === d.value}
              onChange={() => setDiscipline(d.value)}
            />
            <span className={styles.discIco}>
              <d.icon size={14} />
            </span>
            <span>{t(d.nameKey)}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export { DISCIPLINE_OPTIONS };
