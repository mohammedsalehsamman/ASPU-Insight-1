import { useState } from 'react';
import { updateUser } from '../../api/admin';
import { adminT } from '../../pages/admin/adminI18n';

export const ROLES = ['admin', 'editor', 'reviewer', 'assistant_editor', 'author', 'reader'];

export const ROLE_LABELS = {
  ar: { admin: 'أدمن', editor: 'محرر', reviewer: 'مراجع', assistant_editor: 'مساعد محرر', author: 'باحث', reader: 'قارئ' },
  en: { admin: 'Admin', editor: 'Editor', reviewer: 'Reviewer', assistant_editor: 'Assistant Editor', author: 'Author', reader: 'Reader' },
};

export default function EditUserModal({ user, lang, onClose, onSaved }) {
  const t = (key) => adminT(lang, key);
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(!!user.is_active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateUser(user.user_id ?? user.id, { role, is_active: isActive });
      onSaved(updated ?? { ...user, role, is_active: isActive });
    } catch (err) {
      const msg = err.response?.data ? Object.values(err.response.data).flat().join(' ') : (lang === 'ar' ? 'فشل الحفظ' : 'Save failed');
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-title">
          {lang === 'ar' ? 'تعديل المستخدم' : 'Edit User'}
        </div>

        <div className="admin-field">
          <label>{user.full_name || user.email}</label>
        </div>

        <div className="admin-field">
          <label>{t('role')}</label>
          <select className="admin-select" value={role} onChange={(e) => setRole(e.target.value)} disabled={saving}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[lang][r]}</option>
            ))}
          </select>
        </div>

        <div className="admin-field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={saving} />
            {t('active')}
          </label>
        </div>

        {error && <p className="admin-msg admin-msg-error">{error}</p>}

        <div className="admin-modal-actions">
          <button className="admin-btn" onClick={onClose} disabled={saving}>{t('cancel')}</button>
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
