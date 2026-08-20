import React, { useState, useRef, useEffect } from 'react';
import { createPaper } from '../api/research';
import { getProfile } from '../api/auth';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../i18n/errorMessages';
import { SubmitDict, createLocalT } from '../i18n';
import styles from '../styling/Submit.module.css';
import Navbar from '../components/Navbar.jsx';
import Logo from '../components/Logo.jsx';
import { PiCaretDown, PiClipboardText } from 'react-icons/pi';
import PublisherInfo, { ROLE_KEYS } from '../components/Submit/PublisherInfo';
import StepsList from '../components/Submit/StepsList';
import RtypeSelector, { RTYPE_OPTIONS } from '../components/Submit/RtypeSelector';
import DisciplineSelector, { DISCIPLINE_OPTIONS } from '../components/Submit/DisciplineSelector';
import DetailsSection from '../components/Submit/DetailsSection';
import FileSection from '../components/Submit/FileSection';
import SummaryBox from '../components/Submit/SummaryBox';
import ActionRow from '../components/Submit/ActionRow';
import SuccessOverlay from '../components/Submit/SuccessOverlay';

const Submit = () => {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const t = createLocalT(SubmitDict, lang);
  const { showError } = useToast();

  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [successRef, setSuccessRef] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const [openSection, setOpenSection] = useState(1);
  const [publisher, setPublisher] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [rtype, setRtype] = useState('technical');
  const [discipline, setDiscipline] = useState('ai');
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ✅ جلب بيانات المستخدم الحالي وتحديد الناشر تلقائياً من role
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setPublisher(data.role || '');
      } catch (err) {
        console.error(err);
        showError(err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fileInputRef = useRef(null);

  const toggleSection = (n) => setOpenSection((cur) => (cur === n ? null : n));

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const trimmed = keywordInput.trim();
      if (trimmed && !keywords.includes(trimmed)) {
        setKeywords([...keywords, trimmed]);
        setKeywordInput('');
      }
    }
  };

  const handleRemoveKeyword = (indexToRemove) => {
    setKeywords(keywords.filter((_, index) => index !== indexToRemove));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !abstract || !file) {
      setError(t('err_required'));
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('abstract', abstract);
    formData.append('pdf_file', file);
    formData.append('keywords', keywords.join(','));
    formData.append('publisher', publisher);
    formData.append('rtype', rtype);
    // ✅ الباك بيطلب اسم الحقل "specialization" (كان "discipline")
    formData.append('specialization', discipline);

    try {
      const response = await createPaper(formData);
      setSuccessRef(response.reference_id || response.id || 'ASPU-' + Math.floor(Math.random() * 90000 + 10000));
      setShowSuccess(true);
      handleReset();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, lang) || t('err_generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setAbstract('');
    setKeywords([]);
    setFile(null);
    setOpenSection(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const roleLabel = t(ROLE_KEYS[publisher]) || publisher || '';
  const rtypeLabel = t(RTYPE_OPTIONS.find((r) => r.value === rtype)?.labelKey) || '';
  const discLabel = t(DISCIPLINE_OPTIONS.find((d) => d.value === discipline)?.nameKey) || '';

  return (
    <div className={styles.pageContainer} dir={isAr ? 'rtl' : 'ltr'} lang={lang}>
      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        hoveredMenu={hoveredMenu}
        setHoveredMenu={setHoveredMenu}
        scrolled={scrolled}
        Logo={Logo}
      />

      {/* ══ الهيرو ══ */}
      <header className={styles.heroHeader}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroInner}>
          <nav className={`${styles.rr} ${styles.breadcrumb}`} aria-label="Breadcrumb">
            <a href="/">{t('breadcrumb_home')}</a>
            <span className={styles.crumbSep}>›</span>
            <a href="/research_review">{t('breadcrumb_research')}</a>
            <span className={styles.crumbSep}>›</span>
            <span>{t('breadcrumb_current')}</span>
          </nav>
          <h1 className={`${styles.bb} ${styles.formTitle} ${styles.heroTitle}`}>
            {t('hero_title_l1')}
            <br />
            {t('hero_title_l2')}
          </h1>
          <p className={styles.formSubtitle}>
            {t('hero_sub')}
          </p>
        </div>
      </header>

      <div className={`${styles.formCard} ${styles.formCardWide}`}>
        <div className={styles.layoutGrid}>
          {/* ══ الشريط الجانبي ══ */}
          <aside className={styles.sidebarCol}>
            <button
              type="button"
              className={styles.filterToggle}
              onClick={() => setSidebarMobileOpen((v) => !v)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><PiClipboardText size={15} /> {t('sidebar_toggle')}</span>
              <span className={`${styles.ftArrow} ${sidebarMobileOpen ? styles.open : ''}`}>
                <PiCaretDown size={16} />
              </span>
            </button>

            <div className={`${styles.sidebar} ${sidebarMobileOpen ? styles.mobileOpen : ''}`}>
              <PublisherInfo profile={profile} profileLoading={profileLoading} t={t} />
              <StepsList openSection={openSection} t={t} />
              <RtypeSelector rtype={rtype} setRtype={setRtype} t={t} />
              <DisciplineSelector discipline={discipline} setDiscipline={setDiscipline} t={t} />
            </div>
          </aside>

          {/* ══ الفورم الرئيسي ══ */}
          <div className={styles.contentCol}>
            {error && <div className={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.mainForm}>

              <DetailsSection
                openSection={openSection}
                toggleSection={toggleSection}
                title={title}
                setTitle={setTitle}
                abstract={abstract}
                setAbstract={setAbstract}
                t={t}
              />


              <FileSection
                openSection={openSection}
                toggleSection={toggleSection}
                file={file}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                handleFileDrop={handleFileDrop}
                dragOver={dragOver}
                setDragOver={setDragOver}
                t={t}
              />

              <SummaryBox
                roleLabel={roleLabel}
                rtypeLabel={rtypeLabel}
                discLabel={discLabel}
                file={file}
                t={t}
              />

              <ActionRow loading={loading} handleReset={handleReset} t={t} />

            </form>
          </div>
        </div>
      </div>

      {/* شاشة النجاح المنبثقة (Overlay) */}
      {showSuccess && (
        <SuccessOverlay successRef={successRef} onClose={() => setShowSuccess(false)} t={t} />
      )}
    </div>
  );
};

export default Submit;