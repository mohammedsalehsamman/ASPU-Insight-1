import '../styling/Navbar.css';
import { isAuthenticated, logout } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { FiX, FiMoon, FiSun } from 'react-icons/fi';

// ══ MENU ITEMS — ثابتة وتظهر دائماً بالترتيب الكامل ══
const MENU_ITEMS = [
  { key: "home", num: "01", href: "/" },
  { key: "research", num: "02", href: "/research_review" },
  { key: "submit", num: "04", href: "/submit" },
  { key: "profile", num: "05", href: "/Profile" },
];

export default function Navbar({
  menuOpen,
  setMenuOpen,
  hoveredMenu,
  setHoveredMenu,
  scrolled,
  Logo,
}) {
  const loggedIn = isAuthenticated();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const shared = t('shared', { returnObjects: true });
  const common = t('auth.common', { returnObjects: true });
  const menuT = t('menu', { returnObjects: true });
  const navT = t('nav', { returnObjects: true });
  const lang = i18n.language || 'ar';
  const isAr = lang === 'ar';
  const { theme, setTheme } = useTheme();

  const setLang = (l) => {
    i18n.changeLanguage(l);
    document.documentElement.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', l);
  };

  // القائمة كاملة دائماً بدون حذف أي عنصر — الحماية صارت عبر ProtectedRoute
  const visibleMenuItems = MENU_ITEMS;

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <div className={`aspu-menu${menuOpen ? " open" : ""}`}>
        <div className={`aspu-menu-top${menuOpen ? " visible" : ""}`}>
          <div className="aspu-menu-logo-row">
            <Logo size={36} />
            <div>
              <div className="aspu-menu-ln">ASPU Insight</div>
              <div className="aspu-menu-ls">
                {shared.logoTagline}
              </div>
            </div>
          </div>
          <button className="aspu-menu-close-btn" onClick={() => setMenuOpen(false)}>
            {navT.close}
            <FiX size={14} strokeWidth={2.4} />
          </button>
        </div>

        <div className="aspu-menu-body">
          <div className={`aspu-menu-links${hoveredMenu !== null ? " has-hover" : ""}`}>
            {visibleMenuItems.map((item, i) => (
              <div key={item.key} className="aspu-ml-wrap">
                <a
                  className={[
                    "aspu-menu-link",
                    menuOpen ? "entering" : "",
                    hoveredMenu === i ? "hov" : "",
                  ].filter(Boolean).join(" ")}
                  style={{ transitionDelay: menuOpen ? `${i * 0.07}s` : "0s" }}
                  href={item.href}
                  onMouseEnter={() => setHoveredMenu(i)}
                  onMouseLeave={() => setHoveredMenu(null)}
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="aspu-ml-row">
                    <span className="aspu-ml-name">{menuT[item.key]}</span>
                    <span className="aspu-ml-num">{item.num}</span>
                  </div>
                  <span className="aspu-ml-sub">{menuT.explore}</span>
                </a>
              </div>
            ))}
          </div>

          <div className="aspu-menu-preview">
            <div className={`aspu-preview-inner${hoveredMenu !== null ? " show" : ""}`}>
              <div className="aspu-preview-ring">
                <div className="aspu-preview-ring-spin" />
                <Logo size={52} />
              </div>
              <div className="aspu-preview-divider" />
              <div className="aspu-preview-name">
                {hoveredMenu !== null ? menuT[visibleMenuItems[hoveredMenu].key] : "ASPU"}
              </div>
              <div className="aspu-preview-tag">ASPU Insight</div>
            </div>
          </div>
        </div>

        <div className={`aspu-menu-foot${menuOpen ? " visible" : ""}`}>
          <span className="aspu-mf-label">{menuT.appearance}</span>
          <div className="aspu-menu-tpill">
            <button
              className={`aspu-mtp-btn${theme === "dark" ? " on" : ""}`}
              onClick={() => setTheme("dark")}
            >
              <FiMoon size={14} />
            </button>
            <button
              className={`aspu-mtp-btn${theme === "light" ? " on" : ""}`}
              onClick={() => setTheme("light")}
            >
              <FiSun size={14} />
            </button>
          </div>
          <div className="aspu-menu-tpill">
            <button
              className={`aspu-mtp-btn${lang === 'ar' ? ' on' : ''}`}
              onClick={() => setLang('ar')}
            >
              ع
            </button>
            <button
              className={`aspu-mtp-btn${lang === 'en' ? ' on' : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>
          {loggedIn ? (
            <button className="aspu-menu-login-btn" onClick={handleLogout}>
              {common.logout}
            </button>
          ) : (
            <a href="/Auth" className="aspu-menu-login-btn" onClick={() => setMenuOpen(false)}>
              {menuT.login}
            </a>
          )}
        </div>
      </div>

      <nav className={`aspu-nav${scrolled ? " scrolled" : ""}`}>
        <a href="/" className="aspu-nav-logo">
          <Logo size={38} />
          <div>
            <div className="aspu-logo-n">ASPU Insight</div>
            <div className="aspu-logo-s">
              {shared.secondaryLogoTagline}
            </div>
          </div>
        </a>
        <div className="aspu-nav-space" />
        <button
          className={`aspu-nav-menu-btn${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen(true)}
        >
          <span className="aspu-nmb-label">{navT.menu}</span>
          <div className="aspu-nmb-lines">
            <div className="aspu-nmb-line l1" />
            <div className="aspu-nmb-line l2" />
            <div className="aspu-nmb-line l3" />
          </div>
        </button>
      </nav>
    </>
  );
}