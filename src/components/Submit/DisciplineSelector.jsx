import {
  Robot,
  LockKey,
  Globe,
  DeviceMobile,
  ChartBar,
  Code,
  Shapes,
} from '@phosphor-icons/react';
import styles from '../../styling/Submit.module.css';

const DISCIPLINE_OPTIONS = [
  { value: 'ai', icon: Robot, name: 'ذكاء اصطناعي' },
  { value: 'sec', icon: LockKey, name: 'أمن معلومات' },
  { value: 'net', icon: Globe, name: 'شبكات' },
  { value: 'app', icon: DeviceMobile, name: 'تطوير تطبيقات' },
  { value: 'data', icon: ChartBar, name: 'علم البيانات' },
  { value: 'se', icon: Code, name: 'هندسة برمجيات' },
  { value: 'other', icon: Shapes, name: 'أخرى' },
];

export default function DisciplineSelector({ discipline, setDiscipline }) {
  return (
    <div>
      <div className={styles.filterLabel}>التخصص</div>
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
              <d.icon size={14} weight="duotone" />
            </span>
            <span>{d.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export { DISCIPLINE_OPTIONS };