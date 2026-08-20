import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getPaper, downloadPaper, getRecommendations } from '../api/research';
import { PaperDetailDict, createLocalT } from '../i18n';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import useNavScroll from '../components/shared/useNavScroll';
import { getFooterContent } from '../components/shared/footerContent';
import '../styling/PaperDetail.css';
import PaperDetailSkeleton from '../components/PaperDetail/PaperDetailSkeleton';
import PaperDetailError from '../components/PaperDetail/PaperDetailError';
import PageHeader from '../components/PaperDetail/PageHeader';
import FileCard from '../components/PaperDetail/FileCard';
import RecommendationsSection from '../components/PaperDetail/RecommendationsSection';
import InfoCard from '../components/PaperDetail/InfoCard';
import StatusTimeline from '../components/PaperDetail/StatusTimeline';
import ActionsCard from '../components/PaperDetail/ActionsCard';

export default function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { lang } = useLanguage();
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

  // ← حالة الأبحاث المشابهة (recommendations)
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPaper(id)
      .then((data) => { if (!cancelled) setPaper(data); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  /* ── جلب الأبحاث المشابهة (GET /recommendations/) ── */
  useEffect(() => {
    let cancelled = false;
    setLoadingRecommendations(true);
    setRecommendationsError(null);

    getRecommendations(id)
      .then((data) => {
        if (!cancelled) {
          setRecommendations(Array.isArray(data) ? data : data?.results ?? []);
          setLoadingRecommendations(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setRecommendationsError(err);
          setLoadingRecommendations(false);
        }
      });

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
      setDownloadError(err);
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
  const navProps = { menuOpen, setMenuOpen, hoveredMenu, setHoveredMenu, navScrolled };

  if (loading) {
    return <PaperDetailSkeleton theme={theme} lang={lang} dir={dir} t={t} {...navProps} />;
  }

  if (error) {
    return <PaperDetailError theme={theme} lang={lang} dir={dir} t={t} error={error} {...navProps} />;
  }

  if (!paper) return null;

  const st = STATUS_CONFIG[paper.status] ?? STATUS_CONFIG.pending;

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

      <PageHeader paper={paper} status={st} t={t} />

      <div className="pd-page-body">

        <div className="pd-main-col">
          <div className="pd-detail-card">
            <div className="pd-section-label">{t('abstract_label')}</div>
            <p className="pd-abstract-text">{paper.abstract}</p>
          </div>

          <FileCard
            paper={paper}
            lang={lang}
            t={t}
            downloading={downloading}
            downloadError={downloadError}
            onDownload={handleDownload}
          />

          <RecommendationsSection
            lang={lang}
            loading={loadingRecommendations}
            error={recommendationsError}
            recommendations={recommendations}
          />

          {paper.status === 'rejected' && paper.rejection_reason && (
            <div className="pd-rejection-box">
              <div className="pd-rejection-label">{t('rejection_label')}</div>
              <p className="pd-rejection-text">{paper.rejection_reason}</p>
            </div>
          )}
        </div>

        <div className="pd-side-col">
          <InfoCard paper={paper} status={st} t={t} />
          <StatusTimeline paper={paper} t={t} />
          <ActionsCard
            id={id}
            t={t}
            onEdit={() => navigate(`/papers/${id}/edit`)}
            onCopyLink={handleCopyLink}
          />
        </div>
      </div>

      <Footer isAr={lang === 'ar'} footer={getFooterContent(lang)} Logo={Logo} />
    </div>
  );
}
