import { FaExclamationTriangle } from 'react-icons/fa';
import Navbar from '../Navbar';
import Footer from '../Footer';
import Logo from '../Logo';
import { getFooterContent } from '../shared/footerContent';
import { getErrorMessage } from '../../i18n/errorMessages';

export default function PaperDetailError({ theme, lang, dir, t, error, menuOpen, setMenuOpen, hoveredMenu, setHoveredMenu, navScrolled }) {
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
      <br />
      <div className="pd-state-center">
        <span className="pd-error-ico"><FaExclamationTriangle /></span>
        <span className="pd-error-msg">{getErrorMessage(error, lang)}</span>
        <button className="pd-retry-btn" onClick={() => window.location.reload()}>
          {t('retry')}
        </button>
      </div>
      <Footer isAr={lang === 'ar'} footer={getFooterContent(lang)} Logo={Logo} />
    </div>
  );
}
