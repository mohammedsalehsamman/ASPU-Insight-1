import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import {
  getPapers,
  getEditorReviewInitial,
  submitEditorReviewInitial,
  getAvailableReviewers,
  createCommittee,
  // getEditorReviewFinal,      // ⏸ معطّل مؤقتاً — رح يترجع لما تصير اللجنة جاهزة
  // submitEditorReviewFinal,   // ⏸ معطّل مؤقتاً — رح يترجع لما تصير اللجنة جاهزة
} from "../../api/research";
import { EditorDict, createLocalT } from '../../i18n'; // ← كل الترجمات صارت هون
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
import { getFooterContent } from '../../components/shared/footerContent';
import AssistantReportReadOnly from '../../components/editor/AssistantReportReadOnly';
import InitialReviewSection from '../../components/editor/InitialReviewSection';
import CommitteePanel from '../../components/editor/CommitteePanel';
import "../../styling/EditorAssistant.css"

export default function Editor() {
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
  const [decision, setDecision] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [initialReview, setInitialReview] = useState(null);
  const [loadingInitialReview, setLoadingInitialReview] = useState(false);
  const [initialReviewError, setInitialReviewError] = useState(null);
  const [committeePanelOpen, setCommitteePanelOpen] = useState(false);
  const [availableReviewers, setAvailableReviewers] = useState([]);
  const [loadingReviewers, setLoadingReviewers] = useState(false);
  const [reviewersError, setReviewersError] = useState(null);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState([]);
  const [creatingCommittee, setCreatingCommittee] = useState(false);
  const [committeeError, setCommitteeError] = useState(null);
  const [committeeSuccess, setCommitteeSuccess] = useState(false);

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

  /* ── جلب الملاحظات الأولية عند فتح البحث ── */
  async function loadReviews(paperId) {
    setLoadingInitialReview(true);
    setInitialReviewError(null);

    try {
      const data = await getEditorReviewInitial(paperId);
      const normalized = Array.isArray(data)
        ? (data.length > 0 ? data[0] : null)
        : (data ?? null);
      setInitialReview(normalized);
    } catch (err) {
      // 404 = لا يوجد تقرير أولي بعد، هاد مش خطأ حقيقي
      if (err?.response?.status === 404) setInitialReview(null);
      else setInitialReviewError(err);
    } finally {
      setLoadingInitialReview(false);
    }
  }

  /* ── Detail panel ── */
  function openDetail(id) {
    const p = papers.find(x => x.id === id);
    if (!p) return;
    setActivePaper(p);
    setDetailOpen(true);
    resetReviewUI();
    document.body.style.overflow = 'hidden';
    loadReviews(p.id);
  }

  function closeDetail() {
    setDetailOpen(false);
    setActivePaper(null);
    resetReviewUI();
    document.body.style.overflow = '';
  }

  function resetReviewUI() {
    setNoteEditorOpen(false);
    setNoteText('');
    setDecision('');
    setSaveError(null);
    setInitialReview(null);
    setInitialReviewError(null);
    setCommitteePanelOpen(false);
    setAvailableReviewers([]);
    setSelectedReviewerIds([]);
    setReviewersError(null);
    setCommitteeError(null);
    setCommitteeSuccess(false);
  }

  /* ── فتح محرر التقرير الأولي ── */
  function openReviewEditor() {
    setNoteEditorOpen(true);
    setNoteText('');
    setDecision('');
    setSaveError(null);
  }

  function cancelReviewEditor() {
    setNoteEditorOpen(false);
    setNoteText('');
    setDecision('');
    setSaveError(null);
  }

  /* ── إرسال التقرير الأولي (notes + decision) ── */
  async function submitReview() {
    if (!activePaper || !noteText.trim() || !decision) return;

    setSavingNote(true);
    setSaveError(null);

    try {
      const payload = { notes: noteText.trim(), decision };
      const data = await submitEditorReviewInitial(activePaper.id, payload);
      setInitialReview(data ?? payload);

      setNoteEditorOpen(false);
      setNoteText('');
      setDecision('');
    } catch (err) {
      setSaveError(err);
    } finally {
      setSavingNote(false);
    }
  }

  /* ── جلب المراجعين المتاحين لهاد البحث ── */
  async function openCommitteePanel() {
    if (!activePaper) return;
    setCommitteePanelOpen(true);
    setLoadingReviewers(true);
    setReviewersError(null);
    setSelectedReviewerIds([]);
    setCommitteeError(null);
    setCommitteeSuccess(false);

    try {
      const data = await getAvailableReviewers(activePaper.id);
      setAvailableReviewers(Array.isArray(data) ? data : []);
    } catch (err) {
      setReviewersError(err);
    } finally {
      setLoadingReviewers(false);
    }
  }

  function closeCommitteePanel() {
    setCommitteePanelOpen(false);
  }

  function toggleReviewer(userId) {
    setSelectedReviewerIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }

  /* ── إنشاء اللجنة ── */
  async function handleCreateCommittee() {
    if (!activePaper || selectedReviewerIds.length === 0) return;

    setCreatingCommittee(true);
    setCommitteeError(null);

    try {
      const payload = { reviewer_ids: selectedReviewerIds };
      await createCommittee(activePaper.id, payload);
      setCommitteeSuccess(true);
      setCommitteePanelOpen(false);
    } catch (err) {
      setCommitteeError(err);
    } finally {
      setCreatingCommittee(false);
    }
  }

  /* ── Filtering ── */
  const filtered = papers.filter(p => {
    if (activeFilter === 'noted' && !p.is_reviewed_by_assistant) return false;
    if (activeFilter === 'pending' && p.is_reviewed_by_assistant) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !p.title?.toLowerCase().includes(q) &&
        !p.author_name?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const statPending = papers.filter(p => !p.is_reviewed_by_assistant).length;
  const statNoted = papers.filter(p => p.is_reviewed_by_assistant).length;

  const displayName = currentUser?.full_name || (lang === 'ar' ? 'بدون اسم' : 'Editor');

  // ← الدالة نفسها صارت سطر واحد بس؛ القاموس كامل صار بملف الترجمة i18n.js
  const t = createLocalT(EditorDict, lang);

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
              isReviewed={!!activePaper.is_reviewed_by_assistant}
            />

            {/* ══ Editor Report — Initial only (Final مؤجّلة لحد ما تصير اللجنة جاهزة) ══ */}
            <AssistantReportReadOnly activePaper={activePaper} t={t} />

            <InitialReviewSection
              t={t}
              lang={lang}
              loadingInitialReview={loadingInitialReview}
              initialReviewError={initialReviewError}
              initialReview={initialReview}
              noteEditorOpen={noteEditorOpen}
              openReviewEditor={openReviewEditor}
              cancelReviewEditor={cancelReviewEditor}
              noteText={noteText}
              setNoteText={setNoteText}
              decision={decision}
              setDecision={setDecision}
              savingNote={savingNote}
              saveError={saveError}
              submitReview={submitReview}
            />

            <CommitteePanel
              t={t}
              initialReview={initialReview}
              committeePanelOpen={committeePanelOpen}
              openCommitteePanel={openCommitteePanel}
              closeCommitteePanel={closeCommitteePanel}
              loadingReviewers={loadingReviewers}
              reviewersError={reviewersError}
              availableReviewers={availableReviewers}
              selectedReviewerIds={selectedReviewerIds}
              toggleReviewer={toggleReviewer}
              creatingCommittee={creatingCommittee}
              committeeError={committeeError}
              committeeSuccess={committeeSuccess}
              handleCreateCommittee={handleCreateCommittee}
            />
          </>
        )}
      </DetailPanelShell>
    </div>
  );
}