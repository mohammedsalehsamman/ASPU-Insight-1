import { PiUserDuotone } from 'react-icons/pi';
import styles from '../../styling/Submit.module.css';

const ROLE_KEYS = {
  author: 'role_author',
  reviewer: 'role_reviewer',
  editor: 'role_editor',
};

export default function PublisherInfo({ profile, profileLoading, t }) {
  const roleLabel = t(ROLE_KEYS[profile?.role]) || profile?.role || '';

  return (
    <div>
      <div className={styles.filterLabel}>{t('publisher_label')}</div>
      <div className={styles.discItem} style={{ cursor: 'default' }}>
        <span className={styles.discIco}>
          <PiUserDuotone size={14} />
        </span>
        <span>
          {profileLoading
            ? t('loading')
            : `${profile?.full_name || '—'} (${roleLabel})`}
        </span>
      </div>
    </div>
  );
}

export { ROLE_KEYS };
