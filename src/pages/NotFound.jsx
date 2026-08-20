import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiHome, FiSearch } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import useNavScroll from '../components/shared/useNavScroll';
import { getFooterContent } from '../components/shared/footerContent';
import '../styling/NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const navScrolled = useNavScroll();
  const content = t('notFound', { returnObjects: true });

  return (
    <div className={`not-found-root theme-${theme} lang-${lang}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        hoveredMenu={hoveredMenu}
        setHoveredMenu={setHoveredMenu}
        scrolled={navScrolled}
        Logo={Logo}
      />

      <main className="not-found-main">
        <div className="not-found-mark" aria-hidden="true">404</div>
        <div className="not-found-copy">
          <span className="not-found-kicker">{content.kicker}</span>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
          <div className="not-found-actions">
            <button type="button" className="not-found-primary" onClick={() => navigate('/')}>
              <FiHome size={16} />
              {content.home}
            </button>
            <button type="button" className="not-found-secondary" onClick={() => navigate('/research_review')}>
              <FiSearch size={16} />
              {content.research}
            </button>
          </div>
          <button type="button" className="not-found-back" onClick={() => navigate(-1)}>
            <FiArrowLeft size={15} />
            {content.back}
          </button>
        </div>
      </main>

      <Footer isAr={lang === 'ar'} footer={getFooterContent(lang)} Logo={Logo} />
    </div>
  );
}
