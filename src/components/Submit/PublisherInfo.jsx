import { User } from '@phosphor-icons/react';
import styles from '../../styling/Submit.module.css';

const ROLE_LABELS = {
  author: 'باحث',
  reviewer: 'مراجع',
  editor: 'محرر',
};

export default function PublisherInfo({ profile, profileLoading }) {
  const roleLabel = ROLE_LABELS[profile?.role] || profile?.role || '';

  return (
    <div>
      <div className={styles.filterLabel}>الناشر</div>
      <div className={styles.discItem} style={{ cursor: 'default' }}>
        <span className={styles.discIco}>
          <User size={14} weight="duotone" />
        </span>
        <span>
          {profileLoading
            ? 'جارٍ التحميل...'
            : `${profile?.full_name || '—'} (${roleLabel})`}
        </span>
      </div>
    </div>
  );
}

export { ROLE_LABELS };