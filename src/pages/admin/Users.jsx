import { useEffect, useState, useCallback } from 'react';
import {
  MagnifyingGlass,
  Warning,
  ArrowClockwise,
  PencilSimple,
  CheckCircle,
  EnvelopeSimple,
  Prohibit,
  ArrowCounterClockwise,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import AdminLayout from './AdminLayout';
import {
  getUsers,
  updateUser,
  deleteUser,
  adminVerifyEmail,
  adminResendVerification,
} from '../../api/admin';
import { useAdminLang, adminT } from './adminI18n';

const ROLES = ['admin', 'editor', 'reviewer', 'assistant_editor', 'author', 'reader'];

const ROLE_LABELS = {
  ar: { admin: 'أدمن', editor: 'محرر', reviewer: 'مراجع', assistant_editor: 'مساعد محرر', author: 'باحث', reader: 'قارئ' },
  en: { admin: 'Admin', editor: 'Editor', reviewer: 'Reviewer', assistant_editor: 'Assistant Editor', author: 'Author', reader: 'Reader' },
};

/* ── Edit user modal ── */
function EditUserModal({ user, lang, onClose, onSaved }) {
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

export default function Users() {
  const [lang] = useAdminLang();
  const t = (key) => adminT(lang, key);
  const isAr = lang === 'ar';

  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [ordering, setOrdering] = useState('-date_joined');

  const [editingUser, setEditingUser] = useState(null);
  const [rowBusyId, setRowBusyId] = useState(null);
  const [rowMsg, setRowMsg] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, ordering };
      if (search) params.search = search;
      if (role !== 'all') params.role = role;
      if (activeFilter !== 'all') params.is_active = activeFilter === 'true';
      if (verifiedFilter !== 'all') params.email_verified = verifiedFilter === 'true';

      const data = await getUsers(params);
      if (Array.isArray(data)) {
        setUsers(data);
        setCount(data.length);
        setNextUrl(null);
        setPrevUrl(null);
      } else {
        setUsers(data.results ?? []);
        setCount(data.count ?? null);
        setNextUrl(data.next ?? null);
        setPrevUrl(data.previous ?? null);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [page, ordering, search, role, activeFilter, verifiedFilter]);

  useEffect(() => {
    const tm = setTimeout(fetchUsers, 300);
    return () => clearTimeout(tm);
  }, [fetchUsers]);

  useEffect(() => { setPage(1); }, [search, role, activeFilter, verifiedFilter]);

  const getId = (u) => u.user_id ?? u.id;

  const handleToggleActive = async (u) => {
    const id = getId(u);
    const willDisable = u.is_active;
    if (willDisable && !window.confirm(isAr ? `هل أنت متأكد من تعطيل ${u.full_name || u.email}؟` : `Disable ${u.full_name || u.email}?`)) return;

    setRowBusyId(id);
    setRowMsg(null);
    try {
      if (willDisable) {
        await deleteUser(id);
      } else {
        await updateUser(id, { is_active: true });
      }
      setUsers((prev) => prev.map((x) => (getId(x) === id ? { ...x, is_active: !willDisable } : x)));
    } catch (err) {
      setRowMsg({ id, type: 'error', text: isAr ? 'فشل تنفيذ الإجراء' : 'Action failed' });
    } finally {
      setRowBusyId(null);
    }
  };

  const handleVerifyEmail = async (u) => {
    const id = getId(u);
    setRowBusyId(id);
    try {
      await adminVerifyEmail(id);
      setUsers((prev) => prev.map((x) => (getId(x) === id ? { ...x, email_verified: true } : x)));
    } catch {
      setRowMsg({ id, type: 'error', text: isAr ? 'فشل التوثيق' : 'Verification failed' });
    } finally {
      setRowBusyId(null);
    }
  };

  const handleResend = async (u) => {
    const id = getId(u);
    setRowBusyId(id);
    try {
      await adminResendVerification(id);
      setRowMsg({ id, type: 'success', text: isAr ? 'تم إرسال رابط التوثيق' : 'Verification email sent' });
    } catch {
      setRowMsg({ id, type: 'error', text: isAr ? 'فشل الإرسال' : 'Failed to send' });
    } finally {
      setRowBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-head">
        <div>
          <div className="admin-page-title">{t('users')}</div>
          <div className="admin-page-sub">
            {isAr ? 'إدارة كل مستخدمي المنصة، أدوارهم، وحالة حساباتهم' : 'Manage all platform users, their roles, and account status'}
          </div>
        </div>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <MagnifyingGlass size={15} weight="duotone" />
          <input
            type="text"
            placeholder={t('search_ph')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="admin-select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="all">{isAr ? 'كل الأدوار' : 'All Roles'}</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[lang][r]}</option>)}
        </select>

        <select className="admin-select" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
          <option value="all">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
          <option value="true">{t('active')}</option>
          <option value="false">{t('inactive')}</option>
        </select>

        <select className="admin-select" value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
          <option value="all">{isAr ? 'كل حالات التوثيق' : 'All Verification'}</option>
          <option value="true">{t('verified')}</option>
          <option value="false">{t('not_verified')}</option>
        </select>

        <select className="admin-select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
          <option value="-date_joined">{isAr ? 'الأحدث أولاً' : 'Newest First'}</option>
          <option value="date_joined">{isAr ? 'الأقدم أولاً' : 'Oldest First'}</option>
          <option value="full_name">{isAr ? 'الاسم (أ-ي)' : 'Name (A-Z)'}</option>
        </select>
      </div>

      {loading && (
        <div className="admin-state-center">
          <div className="admin-spinner" />
          <span>{t('loading')}</span>
        </div>
      )}

      {!loading && error && (
        <div className="admin-state-center">
          <Warning size={36} weight="duotone" style={{ color: 'var(--ac)' }} />
          <span className="admin-empty-title">{t('error')}</span>
          <span className="admin-empty-sub">{String(error)}</span>
          <button className="admin-btn admin-btn-primary" onClick={fetchUsers} style={{ marginTop: 6 }}>
            <ArrowClockwise size={14} weight="bold" />
            {t('retry')}
          </button>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="admin-state-center">
          <span className="admin-empty-title">{t('no_results')}</span>
          <span className="admin-empty-sub">{t('no_results_sub')}</span>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('email')}</th>
                  <th>{t('role')}</th>
                  <th>{t('status')}</th>
                  <th>{isAr ? 'التوثيق' : 'Verification'}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const id = getId(u);
                  const busy = rowBusyId === id;
                  const msg = rowMsg?.id === id ? rowMsg : null;
                  return (
                    <tr key={id}>
                      <td>{u.full_name || '—'}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="admin-badge admin-badge-gold">
                          {ROLE_LABELS[lang][u.role] ?? u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${u.is_active ? 'admin-badge-green' : 'admin-badge-red'}`}>
                          <span className="admin-badge-dot" />
                          {u.is_active ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${u.email_verified ? 'admin-badge-blue' : 'admin-badge-gray'}`}>
                          {u.email_verified ? t('verified') : t('not_verified')}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button className="admin-btn admin-btn-sm" onClick={() => setEditingUser(u)} disabled={busy} title={t('edit')}>
                            <PencilSimple size={13} weight="bold" />
                          </button>
                          <button
                            className={`admin-btn admin-btn-sm ${u.is_active ? 'admin-btn-danger' : ''}`}
                            onClick={() => handleToggleActive(u)}
                            disabled={busy}
                            title={u.is_active ? t('inactive') : t('active')}
                          >
                            {u.is_active ? <Prohibit size={13} weight="bold" /> : <ArrowCounterClockwise size={13} weight="bold" />}
                          </button>
                          {!u.email_verified && (
                            <>
                              <button className="admin-btn admin-btn-sm" onClick={() => handleVerifyEmail(u)} disabled={busy} title={t('verified')}>
                                <CheckCircle size={13} weight="bold" />
                              </button>
                              <button className="admin-btn admin-btn-sm" onClick={() => handleResend(u)} disabled={busy} title={isAr ? 'إعادة إرسال' : 'Resend'}>
                                <EnvelopeSimple size={13} weight="bold" />
                              </button>
                            </>
                          )}
                        </div>
                        {msg && <div className={`admin-msg admin-msg-${msg.type}`}>{msg.text}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {(nextUrl || prevUrl) && (
            <div className="admin-pagination">
              <button className="admin-btn admin-btn-sm" disabled={!prevUrl} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                {isAr ? <CaretRight size={14} /> : <CaretLeft size={14} />}
                {t('prev')}
              </button>
              <span style={{ fontSize: 13, color: 'var(--tx2)' }}>
                {count != null ? (isAr ? `${count} مستخدم` : `${count} users`) : ''}
              </span>
              <button className="admin-btn admin-btn-sm" disabled={!nextUrl} onClick={() => setPage((p) => p + 1)}>
                {t('next')}
                {isAr ? <CaretLeft size={14} /> : <CaretRight size={14} />}
              </button>
            </div>
          )}
        </>
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          lang={lang}
          onClose={() => setEditingUser(null)}
          onSaved={(updated) => {
            setUsers((prev) => prev.map((x) => (getId(x) === getId(updated) ? { ...x, ...updated } : x)));
            setEditingUser(null);
          }}
        />
      )}
    </AdminLayout>
  );
}
