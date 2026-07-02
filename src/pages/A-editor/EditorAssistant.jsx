import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { getPapers, submitAssistantReport, getAssistantReview } from "../../api/research";
import { EditorAssistantDict, createLocalT } from '../../i18n'; // ← كل الترجمات صارت هون
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import CursorGlow from '../../components/shared/CursorGlow';
import HeroSection from '../../components/shared/HeroSection';
import PapersSection from '../../components/shared/PapersSection';
import DetailPanelShell from '../../components/shared/DetailPanelShell';
import PaperDetailInfo from '../../components/shared/PaperDetailInfo';
import useCurrentUser from '../../components/shared/useCurrentUser';
import useNavScroll from '../../components/shared/useNavScroll';
import { hasAssistantReport } from '../../components/shared/statusHelpers';
import { getFooterContent } from '../../components/shared/footerContent';
import AssistantReportSection from '../../components/assistant/AssistantReportSection';
import "../../styling/EditorAssistant.css"

export default function EditorAssistant() {
  const { theme } = useTheme();
  const { i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useCurrentUser();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePaper, setActivePaper] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const navScrolled = useNavScroll();
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [theme, lang]);

  /* ── Fetch papers from API ── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPapers()
      .then(data => {
        if (!cancelled) {
          setPapers(Array.isArray(data) ? data : data.results ?? []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  /* ── Escape key ── */
  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') {
        if (menuOpen) setMenuOpen(false);
        else if (detailOpen) closeDetail();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen, detailOpen]);

  /* ── Detail panel ── */
  function openDetail(id) {
    const p = papers.find(x => x.id === id);
    if (!p) return;
    setActivePaper(p);
    setDetailOpen(true);
    setNoteEditorOpen(false);
    setNoteText('');
    setSaveError(null);
    setReviewData(null);
    setReviewError(null);
    document.body.style.overflow = 'hidden';

    // ← إذا البحث أصلاً فيه تقرير محفوظ (رجع من getPapers)، منجهزه فوراً
    if (hasAssistantReport(p) && p.assistant_editor_report) {
      setReviewData([{ id: `local-${p.id}`, report: p.assistant_editor_report }]);
    }
  }

  function closeDetail() {
    setDetailOpen(false);
    setActivePaper(null);
    setNoteEditorOpen(false);
    setNoteText('');
    setSaveError(null);
    setReviewData(null);
    setReviewError(null);
    document.body.style.overflow = '';
  }

  /* ── جلب التقرير المخزّن عند الطلب (GET assistant-review) ── */
  async function loadReview() {
    if (!activePaper) return;
    setLoadingReview(true);
    setReviewError(null);
    try {
      const data = await getAssistantReview(activePaper.id);
      const normalized = Array.isArray(data) ? data : data?.results ?? data;
      if ((!normalized || (Array.isArray(normalized) && normalized.length === 0)) && activePaper.assistant_editor_report) {
        setReviewData([{ id: `local-${activePaper.id}`, report: activePaper.assistant_editor_report }]);
      } else {
        setReviewData(normalized);
      }
    } catch (err) {
      setReviewError(err);
      if (activePaper.assistant_editor_report) {
        setReviewData([{ id: `local-${activePaper.id}`, report: activePaper.assistant_editor_report }]);
        setReviewError(null);
      }
    } finally {
      setLoadingReview(false);
    }
  }

  /* ── Save note ── */
  async function saveNote() {
    if (!activePaper || !noteText.trim()) return;

    setSavingNote(true);
    setSaveError(null);

    try {
      const payload = { assistant_report: noteText.trim() };
      await submitAssistantReport(activePaper.id, payload);

      const updatedPaper = {
        ...activePaper,
        assistant_editor_report: noteText.trim(),
        is_reviewed_by_assistant: true,
      };

      setPapers(prev => prev.map(p => (p.id === activePaper.id ? updatedPaper : p)));
      setActivePaper(updatedPaper);
      setReviewData([{ id: `local-${updatedPaper.id}`, report: updatedPaper.assistant_editor_report }]);
      setNoteEditorOpen(false);
      setNoteText('');
    } catch (err) {
      setSaveError(err);
    } finally {
      setSavingNote(false);
    }
  }

  /* ── Filtering ── */
  const filtered = papers.filter(p => {
    if (activeFilter === 'noted' && !hasAssistantReport(p)) return false;
    if (activeFilter === 'pending' && hasAssistantReport(p)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !p.title?.toLowerCase().includes(q) &&
        !p.author_name?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const statPending = papers.filter(p => !hasAssistantReport(p)).length;
  const statNoted = papers.filter(p => hasAssistantReport(p)).length;

  const displayName = currentUser?.full_name || (lang === 'ar' ? 'بدون اسم' : 'Editor');

  // ← الدالة نفسها صارت سطر واحد بس؛ القاموس كامل صار بملف الترجمة i18n.js
  const t = createLocalT(EditorAssistantDict, lang);

  /* ══════════ RENDER ══════════ */
  return (
    <div className={`ea-root theme-${theme} lang-${lang}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <CursorGlow />

      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        hoveredMenu={hoveredMenu}
        setHoveredMenu={setHoveredMenu}
        scrolled={navScrolled}
        Logo={Logo}
      />

      <HeroSection
        lang={lang}
        t={t}
        displayName={displayName}
        papers={papers}
        statPending={statPending}
        statNoted={statNoted}
      />

      <PapersSection
        t={t}
        lang={lang}
        filtered={filtered}
        loading={loading}
        error={error}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenDetail={openDetail}
      />

      <Footer isAr={lang === 'ar'} footer={getFooterContent(lang)} Logo={Logo} />

      {/* ══ DETAIL PANEL ══ */}
      <DetailPanelShell open={detailOpen} onClose={closeDetail} activePaper={activePaper} lang={lang} t={t}>
        {activePaper && (
          <>
            <PaperDetailInfo
              activePaper={activePaper}
              lang={lang}
              t={t}
              isReviewed={hasAssistantReport(activePaper)}
            />

            <AssistantReportSection
              hasReport={hasAssistantReport(activePaper)}
              t={t}
              reviewData={reviewData}
              loadingReview={loadingReview}
              loadReview={loadReview}
              reviewError={reviewError}
              noteEditorOpen={noteEditorOpen}
              setNoteEditorOpen={setNoteEditorOpen}
              noteText={noteText}
              setNoteText={setNoteText}
              savingNote={savingNote}
              saveError={saveError}
              setSaveError={setSaveError}
              saveNote={saveNote}
            />
          </>
        )}
      </DetailPanelShell>
    </div>
  );
}