import { FiX, FiMenu, FiMoon, FiSun, FiLogOut } from 'react-icons/fi';
import LogoMark from './LogoMark';

const MENU_NAV_ITEMS = [
  { ar: 'الرئيسية', en: 'HOME', path: '/' },
  { ar: 'الأبحاث', en: 'RESEARCH', path: '/research_review' },
  { ar: 'الباحثون', en: 'RESEARCHERS', path: '/' },
  { ar: 'النزاهة', en: 'INTEGRITY', path: '/' },
  { ar: 'تواصل معنا', en: 'CONTACT', path: '/' },
];

const PREV_NAMES = {
  ar: ['الرئيسية', 'الأبحاث', 'الباحثون', 'النزاهة', 'تواصل معنا'],
  en: ['HOME', 'RESEARCH', 'RESEARCHERS', 'INTEGRITY', 'CONTACT'],
};

/* ← نظام التنقل الخاص بلوحة المحرر: الشريط العلوي + قائمة المورف كاملة السكرين (GSAP) */
export default function EditorMorphNav({
  lang, t, theme, setTheme, setLang,
  navScrolled, menuOpen, openMenu, closeMenu, goTo, handleLogout, navigateHome,
  previewIdx, setPreviewIdx,
  menuRef, menuTopRef, menuLinksRef, menuFootRef,
}) {
  return (
    <>
      {/* ══ MORPH MENU ══ */}
      <div
        className="ea-menu"
        ref={menuRef}
        style={{ clipPath: 'inset(0 0 100% 0)', pointerEvents: 'none' }}
      >
        <div className="menu-top" ref={menuTopRef} style={{ opacity: 0 }}>
          <div className="menu-logo-row">
            <LogoMark />
            <div>
              <div className="menu-ln">ASPU Insight</div>
              <div className="menu-ls">{lang === 'ar' ? 'المجلة الأكاديمية الرقمية' : 'Digital Academic Journal'}</div>
            </div>
          </div>
          <button className="menu-close-btn" onClick={closeMenu}>
            {t('close_l')}
            <FiX size={14} />
          </button>
        </div>

        <div className="menu-body">
          <div className={`menu-links ${previewIdx !== null ? 'has-hover' : ''}`}>
            {MENU_NAV_ITEMS.map((item, i) => (
              <div className="ml-wrap" key={i}>
                <a
                  className={`menu-link${previewIdx === i ? ' hov' : ''}`}
                  href={item.path}
                  ref={el => menuLinksRef.current[i] = el}
                  onMouseEnter={() => setPreviewIdx(i)}
                  onMouseLeave={() => setPreviewIdx(null)}
                  onClick={e => { e.preventDefault(); goTo(item.path); }}
                >
                  <div className="ml-row">
                    <span className="ml-name">{lang === 'ar' ? item.ar : item.en}</span>
                    <span className="ml-num">0{i + 1}</span>
                  </div>
                  <span className="ml-sub">{lang === 'ar' ? 'استعرض' : 'EXPLORE'}</span>
                </a>
              </div>
            ))}
          </div>

          <div className="menu-preview">
            <div className={`preview-inner ${previewIdx !== null ? 'show' : ''}`}>
              <div className="preview-ring">
                <div className="preview-ring-spin" />
                <LogoMark />
              </div>
              <div className="preview-divider" />
              <div className="preview-name">
                {previewIdx !== null ? PREV_NAMES[lang][previewIdx] : 'ASPU'}
              </div>
              <div className="preview-tag">ASPU Insight</div>
            </div>
          </div>
        </div>

        <div className="menu-foot" ref={menuFootRef} style={{ opacity: 0 }}>
          <span className="mf-label">{t('appearance')}</span>
          <div className="menu-tpill">
            <button className={`mtp-btn ${theme === 'dark' ? 'on' : ''}`} onClick={() => setTheme('dark')}><FiMoon size={14} /></button>
            <button className={`mtp-btn ${theme === 'light' ? 'on' : ''}`} onClick={() => setTheme('light')}><FiSun size={14} /></button>
          </div>
          <div className="menu-tpill">
            <button className={`mtp-btn ${lang === 'ar' ? 'on' : ''}`} onClick={() => setLang('ar')}>ع</button>
            <button className={`mtp-btn ${lang === 'en' ? 'on' : ''}`} onClick={() => setLang('en')}>EN</button>
          </div>
          <button className="menu-login-btn" onClick={handleLogout}>{t('logout')} <FiLogOut size={14} /></button>
        </div>
      </div>

      {/* ══ NAVBAR ══ */}
      <nav className={`ea-nav ${navScrolled ? 'scrolled' : ''}`}>
        <a href="/" className="nav-logo" onClick={e => { e.preventDefault(); navigateHome(); }}>
          <LogoMark />
          <div>
            <div className="logo-n">ASPU Insight</div>
            <div className="logo-s">{t('journal')}</div>
          </div>
        </a>
        <div className="nav-space" />
        <button
          className={`nav-menu-btn ${menuOpen ? 'is-open' : ''}`}
          onClick={menuOpen ? closeMenu : openMenu}
        >
          <span className="nmb-label">{t('menu_l')}</span>
          <span className="nmb-icon">
            {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </span>
        </button>
      </nav>
    </>
  );
}
