import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { getPaper, downloadPaper } from '../api/research';
import { PaperDetailDict, createLocalT } from '../i18n'; 
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import useNavScroll from '../components/shared/useNavScroll';
import { getFooterContent } from '../components/shared/footerContent';
import DeletePaperButton from '../components/DeletePaperButton';
import '../styling/PaperDetail.css';
import {
  FaFileAlt, FaSearch, FaFlagCheckered, FaExclamationTriangle,
  FaLockOpen, FaDownload, FaFolderOpen, FaCheck, FaEdit,
  FaClipboard,
} from 'react-icons/fa';

function getStepDotCls(stepIndex, status) {
  const activeIdx = status === 'pending' ? 1 : 2;
  if (stepIndex === 0) return 'pd-st-dot--done';
  if (stepIndex < activeIdx) return 'pd-st-dot--done';
  if (stepIndex === activeIdx) return 'pd-st-dot--active';
  return 'pd-st-dot--idle';
}

export default function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const t = createLocalT(PaperDetailDict, lang);
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const navScrolled = useNavScroll();

  // ← حالة زر التحميل الفعلي (API /download/)
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [theme, lang]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPaper(id)
      .then((data) => { if (!cancelled) setPaper(data); })
      .catch((err) => { if (!cancelled) setError(err.message || t('default_error')); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  /* ── تحميل ملف البحث عبر الـ API الحقيقي (blob) ── */
  async function handleDownload() {
    if (!paper) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await downloadPaper(paper.id);

      // استخراج اسم الملف من مسار pdf_file إن وجد، وإلا اسم افتراضي
      const fileName = paper.pdf_file
        ? paper.pdf_file.split('/').pop()
        : `paper-${paper.id}.pdf`;

      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err.message || (lang === 'ar' ? 'فشل تحميل الملف' : 'Failed to download file'));
    } finally {
      setDownloading(false);
    }
  }

  const STATUS_CONFIG = {
    pending:  { label: t('status_pending'),  badgeCls: 'pd-sb-pending',  metaCls: 'pd-meta-val--gold' },
    approved: { label: t('status_approved'), badgeCls: 'pd-sb-approved', metaCls: 'pd-meta-val--green' },
    rejected: { label: t('status_rejected'), badgeCls: 'pd-sb-rejected', metaCls: 'pd-meta-val--red' },
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  if (loading) {
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

  if (error) {
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
        <br/>
        <div className="pd-state-center">
          <span className="pd-error-ico"><FaExclamationTriangle /></span>
          <span className="pd-error-msg">{error}</span>
          <button className="pd-retry-btn" onClick={() => window.location.reload()}>
            {t('retry')}
          </button>
        </div>
        <Footer isAr={lang === 'ar'} footer={getFooterContent(lang)} Logo={Logo} />
      </div>
    );
  }

  if (!paper) return null;

  const st = STATUS_CONFIG[paper.status] ?? STATUS_CONFIG.pending;

  const TIMELINE_STEPS = [
    {
      name: t('timeline_submitted'),
      sub: t('timeline_submitted_sub'),
      icon: <FaFileAlt />,
    },
    {
      name: t('timeline_review'),
      sub: t('timeline_review_sub'),
      icon: <FaSearch />,
    },
    {
      name: t('timeline_decision'),
      sub:
        paper.status === 'approved' ? t('timeline_decision_approved')
        : paper.status === 'rejected' ? t('timeline_decision_rejected')
        : t('timeline_decision_pending'),
      icon: <FaFlagCheckered />,
    },
  ];

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

      <div className="pd-page-header">
        <div className="pd-ph-inner">

          <nav className="pd-breadcrumb" aria-label="breadcrumb">
            <Link to="/">{t('breadcrumb_home')}</Link>
            <span className="pd-breadcrumb-sep">›</span>
            <Link to="/papers">{t('breadcrumb_research')}</Link>
            <span className="pd-breadcrumb-sep">›</span>
            <span>{t('breadcrumb_details')}</span>
          </nav>

          <div className="pd-badges">
            <span className={`pd-status-badge ${st.badgeCls}`}>
              <span className="pd-badge-dot" />
              {st.label}
            </span>

            {paper.is_paid_open_access && (
              <span className="pd-oa-badge"><FaLockOpen size={12} /> {t('open_access_badge')}</span>
            )}

            <span className="pd-paper-id"># PAPER-{String(paper.id).padStart(4, '0')}</span>
          </div>

          <h1 className="pd-title">{paper.title}</h1>

          <div className="pd-author-row">
            <div className="pd-author-chip">
              <span className="pd-chip-dot" />
              <span>{t('author_label')}</span>
              <span className="pd-chip-email">{paper.author_name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pd-page-body">

        <div className="pd-main-col">

          <div className="pd-detail-card">
            <div className="pd-section-label">{t('abstract_label')}</div>
            <p className="pd-abstract-text">{paper.abstract}</p>
          </div>

          <div className="pd-detail-card">
            <div className="pd-section-label">{t('file_label')}</div>
            {paper.pdf_file ? (
              <div className="pd-pdf-available">
                <div className="pd-pdf-icon"><FaFileAlt /></div>
                <div className="pd-pdf-info">
                  <div className="pd-pdf-name">{paper.pdf_file}</div>
                  <div className="pd-pdf-sub">{t('pdf_attached_sub')}</div>
                </div>

                <button
                  className="pd-pdf-download-btn"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  <FaDownload size={12} />
                  {downloading
                    ? (lang === 'ar' ? 'جارٍ التحميل...' : 'Downloading...')
                    : t('download')}
                </button>
              </div>
            ) : (
              <div className="pd-pdf-missing">
                <span className="pd-pdf-missing-icon"><FaFolderOpen /></span>
                <span>{t('pdf_missing')}</span>
              </div>
            )}
            {downloadError && (
              <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                {downloadError}
              </p>
            )}
          </div>

          {paper.status === 'rejected' && paper.rejection_reason && (
            <div className="pd-rejection-box">
              <div className="pd-rejection-label">{t('rejection_label')}</div>
              <p className="pd-rejection-text">{paper.rejection_reason}</p>
            </div>
          )}

        </div>

        <div className="pd-side-col">

          <div className="pd-meta-card">
            <div className="pd-section-label">{t('info_label')}</div>

            <div className="pd-meta-row">
              <span className="pd-meta-key">{t('paper_number')}</span>
              <span className="pd-meta-val pd-meta-val--gold">#{paper.id}</span>
            </div>

            <div className="pd-meta-row">
              <span className="pd-meta-key">{t('status_key')}</span>
              <span className={`pd-meta-val ${st.metaCls}`}>{st.label}</span>
            </div>

            <div className="pd-meta-row">
              <span className="pd-meta-key">{t('access_type')}</span>
              <span className="pd-meta-val">
                {paper.is_paid_open_access ? (
                  <span className="pd-oa-indicator pd-oa-yes"><FaLockOpen size={12} /> {t('open_paid')}</span>
                ) : (
                  <span className="pd-oa-indicator pd-oa-no">{t('closed')}</span>
                )}
              </span>
            </div>

            <div className="pd-meta-row">
              <span className="pd-meta-key">{t('author_key')}</span>
              <span className="pd-meta-val pd-meta-val--blue">{paper.author_name}</span>
            </div>

            <div className="pd-meta-row">
              <span className="pd-meta-key">{t('pdf_key')}</span>
              <span className="pd-meta-val">
                {paper.pdf_file ? (
                  <>{t('available')} <FaCheck size={11} /></>
                ) : (
                  t('not_attached')
                )}
              </span>
            </div>
          </div>

          <div className="pd-meta-card">
            <div className="pd-section-label">{t('status_track_label')}</div>
            <div className="pd-status-track">
              {TIMELINE_STEPS.map((step, i) => {
                const dotCls = getStepDotCls(i, paper.status);

                return (
                  <div className="pd-st-step" key={i}>
                    <div className={`pd-st-dot ${dotCls}`}>
                      {dotCls === 'pd-st-dot--done' ? <FaCheck /> : step.icon}
                    </div>
                    <div className="pd-st-info">
                      <div className="pd-st-name">{step.name}</div>
                      <div className="pd-st-sub">{step.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pd-action-card">
            <div className="pd-section-label">{t('actions_label')}</div>

            <button
              className="pd-action-btn pd-btn-secondary"
              onClick={() => navigate(`/papers/${id}/edit`)}
            >
              <span><FaEdit /></span>
              <span>{t('edit_paper')}</span>
            </button>

            <button
              className="pd-action-btn pd-btn-secondary"
              onClick={handleCopyLink}
            >
              <span><FaClipboard /></span>
              <span>{t('copy_link')}</span>
            </button>

            <DeletePaperButton id={id} redirectTo="/papers" />
          </div>

        </div>
      </div>

      <Footer isAr={lang === 'ar'} footer={getFooterContent(lang)} Logo={Logo} />
    </div>
  );
}