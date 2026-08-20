import { useEffect, useState, useCallback } from 'react';
import {
  PiPencilSimpleBold,
  PiCheckCircleBold,
  PiEnvelopeSimpleBold,
  PiProhibitBold,
  PiArrowCounterClockwiseBold,
} from 'react-icons/pi';
import AdminLayout from './AdminLayout';
import {
  getUsers,
  updateUser,
  deleteUser,
  adminVerifyEmail,
  adminResendVerification,
} from '../../api/admin';
import { useAdminLang, adminT } from './adminI18n';
import { getErrorMessage } from '../../i18n/errorMessages';
import StateCenter from '../../components/admin/StateCenter';
import Pagination from '../../components/admin/Pagination';
import SearchBox from '../../components/admin/SearchBox';
import EditUserModal, { ROLES, ROLE_LABELS } from '../../components/admin/EditUserModal';

export default function Users() {
  const [lang] = useAdminLang();
  const t = (key, vars) => adminT(lang, key, vars);
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
      setError(getErrorMessage(err, lang));
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
    if (willDisable && !window.confirm(t('disable_confirm', { name: u.full_name || u.email }))) return;

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
      setRowMsg({ id, type: 'error', text: t('action_failed') });
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
      setRowMsg({ id, type: 'error', text: t('verification_failed') });
    } finally {
      setRowBusyId(null);
    }
  };

  const handleResend = async (u) => {
    const id = getId(u);
    setRowBusyId(id);
    try {
      await adminResendVerification(id);
      setRowMsg({ id, type: 'success', text: t('verification_sent') });
    } catch {
      setRowMsg({ id, type: 'error', text: t('send_failed') });
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
            {t('users_page_sub')}
          </div>
        </div>
      </div>

      <div className="admin-filter-bar">
        <SearchBox value={search} onChange={setSearch} placeholder={t('search_ph')} />

        <select className="admin-select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="all">{t('all_roles')}</option>
          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[lang][r]}</option>)}
        </select>

        <select className="admin-select" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
          <option value="all">{t('all_statuses')}</option>
          <option value="true">{t('active')}</option>
          <option value="false">{t('inactive')}</option>
        </select>

        <select className="admin-select" value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)}>
          <option value="all">{t('all_verification')}</option>
          <option value="true">{t('verified')}</option>
          <option value="false">{t('not_verified')}</option>
        </select>

        <select className="admin-select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
          <option value="-date_joined">{t('newest_first')}</option>
          <option value="date_joined">{t('oldest_first')}</option>
          <option value="full_name">{t('name_asc')}</option>
        </select>
      </div>

      <StateCenter loading={loading} error={error} onRetry={fetchUsers} isEmpty={users.length === 0} t={t} />

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
                  <th>{t('verification_col')}</th>
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
                            <PiPencilSimpleBold size={13} />
                          </button>
                          <button
                            className={`admin-btn admin-btn-sm ${u.is_active ? 'admin-btn-danger' : ''}`}
                            onClick={() => handleToggleActive(u)}
                            disabled={busy}
                            title={u.is_active ? t('inactive') : t('active')}
                          >
                            {u.is_active ? <PiProhibitBold size={13} /> : <PiArrowCounterClockwiseBold size={13} />}
                          </button>
                          {!u.email_verified && (
                            <>
                              <button className="admin-btn admin-btn-sm" onClick={() => handleVerifyEmail(u)} disabled={busy} title={t('verified')}>
                                <PiCheckCircleBold size={13} />
                              </button>
                              <button className="admin-btn admin-btn-sm" onClick={() => handleResend(u)} disabled={busy} title={t('resend')}>
                                <PiEnvelopeSimpleBold size={13} />
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

          <Pagination
            isAr={isAr}
            t={t}
            hasPrev={!!prevUrl}
            hasNext={!!nextUrl}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
            countLabel={count != null ? t('users_count', { count }) : ''}
          />
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
