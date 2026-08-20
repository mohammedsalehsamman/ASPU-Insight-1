import Navbar from '../Navbar';
import Logo from '../Logo';

export default function PaperDetailSkeleton({ theme, lang, dir, t, menuOpen, setMenuOpen, hoveredMenu, setHoveredMenu, navScrolled }) {
  return (
    <div className={`pd-root theme-${theme} lang-${lang}`} dir={dir}>
      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        hoveredMenu={hoveredMenu}
        setHoveredMenu={setHoveredMenu}
        scrolled={navScrolled}
        Logo={Logo}
      />
      <div className="pd-state-center">
        <div className="pd-spinner" />
        <span>{t('loading')}</span>
      </div>
    </div>
  );
}
