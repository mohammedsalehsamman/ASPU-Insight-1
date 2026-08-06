import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  SquaresFour,
  Users as UsersIco,
  FileText,
  Gavel,
  GearSix,
  SignOut,
  Moon,
  Sun,
  List,
  X,
} from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../../components/Logo';
import { useAdminLang, adminT } from './adminI18n';
import '../../styling/admin/AdminLayout.css';
import '../../styling/admin/AdminShared.css';

const NAV_ITEMS = [
  { to: '/admin', end: true, icon: SquaresFour, key: 'dashboard' },
  { to: '/admin/users', icon: UsersIco, key: 'users' },
  { to: '/admin/papers', icon: FileText, key: 'papers' },
  { to: '/admin/reviews', icon: Gavel, key: 'reviews' },
  { to: '/admin/settings', icon: GearSix, key: 'settings' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useAdminLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const isAr = lang === 'ar';
  const t = (key) => adminT(lang, key);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className={`admin-root theme-${theme}`} dir={isAr ? 'rtl' : 'ltr'} data-theme={theme}>
      {/* Mobile topbar */}
      <div className="admin-mobile-bar">
        <button className="admin-burger" onClick={() => setSidebarOpen((o) => !o)}>
          {sidebarOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
        </button>
        <div className="admin-mobile-brand">
          <Logo size={26} />
          <span>ASPU Insight</span>
        </div>
      </div>

      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <Logo size={34} />
          <div>
            <div className="admin-brand-name">ASPU Insight</div>
            <div className="admin-brand-sub">{t('admin_panel')}</div>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={19} weight="duotone" />
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <div className="admin-toggle-row">
            <button className={`admin-tpill-btn ${theme === 'light' ? 'on' : ''}`} onClick={() => setTheme('light')}>
              <Sun size={14} weight="bold" />
            </button>
            <button className={`admin-tpill-btn ${theme === 'dark' ? 'on' : ''}`} onClick={() => setTheme('dark')}>
              <Moon size={14} weight="bold" />
            </button>
            <span className="admin-toggle-sep" />
            <button className={`admin-tpill-btn ${lang === 'ar' ? 'on' : ''}`} onClick={() => setLang('ar')}>ع</button>
            <button className={`admin-tpill-btn ${lang === 'en' ? 'on' : ''}`} onClick={() => setLang('en')}>EN</button>
          </div>

          <div className="admin-user-row">
            <div className="admin-user-avatar">{(user?.full_name || 'A').charAt(0).toUpperCase()}</div>
            <div className="admin-user-info">
              <div className="admin-user-name">{user?.full_name || (isAr ? 'مدير النظام' : 'Administrator')}</div>
              <div className="admin-user-email">{user?.email}</div>
            </div>
          </div>

          <button className="admin-logout-btn" onClick={handleLogout}>
            <SignOut size={16} weight="bold" />
            {t('logout')}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-main-inner">{children}</div>
      </main>
    </div>
  );
}
