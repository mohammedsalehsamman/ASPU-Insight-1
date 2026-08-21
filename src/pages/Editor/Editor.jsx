import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import '../../styling/EditorAssistant.css';
import {
  getPapers,
  getEditorReviewInitial,
  submitEditorReviewInitial,
  getAvailableReviewers,
  createCommittee,
  getCommitteeStatus,
  publishPaper, // ⚠ لازم تكون مضافة بـ ../../api/research.js — شوف الملاحظة تحت
  submitEditorReviewFinal,
  getAssistantReview,
  downloadPaper,
} from "../../api/research";
import { EditorDict, createLocalT } from "../../i18n";
import useCurrentUser from '../../components/shared/useCurrentUser';
import useNavScroll from '../../components/shared/useNavScroll';
import { getStatus } from '../../components/shared/statusHelpers';
import Navbar from '../../components/Navbar';
import Logo from '../../components/Logo';
import { useToast } from '../../context/ToastContext';
import HeroSection from '../../components/shared/HeroSection';
import PapersSection from '../../components/shared/PapersSection';
import DetailPanelShell from '../../components/shared/DetailPanelShell';
import PaperOverviewSection from '../../components/editor/PaperOverviewSection';
import AssistantReportReadOnly from '../../components/editor/AssistantReportReadOnly';
import InitialReviewSection from '../../components/editor/InitialReviewSection';
import ReviewEditorForm from '../../components/editor/ReviewEditorForm';
import FinalDecisionForm from '../../components/editor/FinalDecisionForm';
import CommitteeStatusPanel from '../../components/editor/CommitteeStatusPanel';
import CommitteePanel from '../../components/editor/CommitteePanel';
import { REQUIRED_PRIMARY_COUNT } from '../../components/editor/editorConstants';
import { FiCheckCircle } from 'react-icons/fi';
import { getErrorMessage } from '../../i18n/errorMessages';

/* ══════════════════
   عدد الاحتياطيين اللي بيقترحهم زر "الاقتراح الذكي" (اختياري بالباك،
   بس منّا منقترح 2 كقيمة افتراضية معقولة)
══════════════════ */
const SUGGESTED_SUBSTITUTE_COUNT = 2;

/* ══════════════════
   HELPER — رسالة خطأ قابلة للعرض من أي شكل يرجعه الباك (DRF)
══════════════════ */
function extractErrorMessage(err, lang) {
  return getErrorMessage(err, lang);
}

/* ══════════════════
   HELPER — اقتراح لجنة ذكي (محلي بالكامل، بدون أي API إضافي)
   بيحاول ينوّع الأساسيين حسب المؤسسة (institution) قدر الإمكان،
   وبعدين ياخذ عدد ثابت من الباقي كاحتياطي.
   بيرجّع { primary: [], substitute: [] } (مصفوفات user objects)
══════════════════ */
function buildSmartCommitteeSuggestion(reviewers) {
  if (!Array.isArray(reviewers) || reviewers.length === 0) {
    return { primary: [], substitute: [] };
  }

  // Fisher–Yates shuffle على نسخة عن القائمة (ما منعدّل الأصل)
  const pool = [...reviewers];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // تجميع حسب المؤسسة لتعظيم التنويع بين الأساسيين
  const byInstitution = {};
  pool.forEach(r => {
    const key = (r.institution || 'unknown').trim().toLowerCase();
    (byInstitution[key] ??= []).push(r);
  });
  const institutions = Object.keys(byInstitution);

  const primary = [];
  let round = 0;
  while (primary.length < REQUIRED_PRIMARY_COUNT) {
    let addedAny = false;
    for (const inst of institutions) {
      if (primary.length >= REQUIRED_PRIMARY_COUNT) break;
      const candidate = byInstitution[inst][round];
      if (candidate) {
        primary.push(candidate);
        addedAny = true;
      }
    }
    round++;
    if (!addedAny) break; // ما فيه مرشحين كفاية لإكمال العدد
  }

  const primaryIds = new Set(primary.map(r => r.user_id));
  const remaining = pool.filter(r => !primaryIds.has(r.user_id));
  const substitute = remaining.slice(0, SUGGESTED_SUBSTITUTE_COUNT);

  return { primary, substitute };
}

/* ══════════════════
   MAIN COMPONENT
══════════════════ */
export default function Editor() {
  const { theme } = useTheme();
  const { lang } = useLanguage();
  const t = createLocalT(EditorDict, lang);

  // ← API state بدل INITIAL_PAPERS
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ← المستخدم الحالي (يُقرأ من بيانات تسجيل الدخول المخزّنة)
  const currentUser = useCurrentUser();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePaper, setActivePaper] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const { notify } = useToast();
  const navScrolled = useNavScroll();

  // ← محرر التقرير الأولي فقط (notes + decision)
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [decision, setDecision] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ← الملاحظات الأولية (GET editor-review/initial)
  const [initialReview, setInitialReview] = useState(null);
  const [loadingInitialReview, setLoadingInitialReview] = useState(false);
  const [initialReviewError, setInitialReviewError] = useState(null);

  // ← تقرير مساعد المحرر (GET assistant-review)
  const [assistantReview, setAssistantReview] = useState(null);
  const [loadingAssistantReview, setLoadingAssistantReview] = useState(false);
  const [assistantReviewError, setAssistantReviewError] = useState(null);

  // ← لجنة التحكيم (تظهر فقط إذا decision === SEND_TO_COMMITTEE)
  // ✅ FIX: الباك بيتوقع تمييز صريح بين أعضاء أساسيين (primary_users — بالضبط 3)
  //   وأعضاء احتياطيين (substitute_users — عدد حر)، بالإضافة لـ blinding_type.
  const [committeePanelOpen, setCommitteePanelOpen] = useState(false);
  const [availableReviewers, setAvailableReviewers] = useState([]);
  const [loadingReviewers, setLoadingReviewers] = useState(false);
  const [reviewersError, setReviewersError] = useState(null);
  const [primaryReviewerIds, setPrimaryReviewerIds] = useState([]);
  const [substituteReviewerIds, setSubstituteReviewerIds] = useState([]);
  const [blindingType, setBlindingType] = useState('single_blind');
  const [creatingCommittee, setCreatingCommittee] = useState(false);
  const [committeeError, setCommitteeError] = useState(null);
  const [committeeSuccess, setCommitteeSuccess] = useState(false);

  // ← الاقتراح الذكي للجنة (محلي فقط — ما بيتصل بأي API، بيعبّي الحالة الموجودة فوق)
  const [suggesting, setSuggesting] = useState(false);
  const [lastSuggestionApplied, setLastSuggestionApplied] = useState(false);

  // ← حالة اللجنة الكاملة (أعضاء + ردود + قرارات) — تُعرض بعد الإرسال للجنة
  const [committeeStatusOpen, setCommitteeStatusOpen] = useState(false);
  const [committeeStatus, setCommitteeStatus] = useState(null);
  const [loadingCommitteeStatus, setLoadingCommitteeStatus] = useState(false);
  const [committeeStatusError, setCommitteeStatusError] = useState(null);

  // ← فيما إذا في لجنة موجودة أصلاً لهاد البحث (null = لسا ما تحقق)
  const [committeeExists, setCommitteeExists] = useState(null);
  const [checkingCommittee, setCheckingCommittee] = useState(false);

  // ← قرار المحرر النهائي (بيظهر فقط بعد ما يصير في تحكيم فعلي من اللجنة)
  const [finalDecision, setFinalDecision] = useState('');
  const [finalNoteText, setFinalNoteText] = useState('');
  const [languageReviewPassed, setLanguageReviewPassed] = useState(false);
  const [citationCheckPassed, setCitationCheckPassed] = useState(false);
  const [publisherPermissionObtained, setPublisherPermissionObtained] = useState(false);
  const [submittingFinalDecision, setSubmittingFinalDecision] = useState(false);
  const [finalDecisionError, setFinalDecisionError] = useState(null);
  const [finalReview, setFinalReview] = useState(null);

  // ← نشر البحث
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const cgRef = useRef(null);

  /* ── Theme + lang are applied to <html> globally by ThemeContext/LanguageContext ── */

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
          notify('error', 'فشل تحميل الأبحاث', 'Failed to load papers');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  /* ── Cursor glow ── */
  useEffect(() => {
    const el = cgRef.current;
    if (!el || window.matchMedia('(pointer:coarse)').matches) { if (el) el.style.display = 'none'; return; }
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    const move = e => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', move, { passive: true });
    let raf;
    const loop = () => {
      cx += (mx - cx) * 0.1; cy += (my - cy) * 0.1;
      el.style.left = cx + 'px'; el.style.top = cy + 'px';
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
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

  /* ── فحص وجود لجنة أصلاً لما يصير عنا initialReview بقرار SEND_TO_COMMITTEE
        هاد بيحدد أي زر يطلع تحت (تعيين / عرض حالة) بدل ما الاثنين يطلعوا مع بعض دايماً ── */
  useEffect(() => {
    if (activePaper && initialReview?.decision === 'SEND_TO_COMMITTEE') {
      checkCommitteeExists(activePaper.id);
    } else {
      setCommitteeExists(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePaper?.id, initialReview?.decision]);

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
      if (err?.response?.status === 404) setInitialReview(null);
      else setInitialReviewError(err);
    } finally {
      setLoadingInitialReview(false);
    }
  }

  /* ── جلب تقرير مساعد المحرر عند فتح البحث ── */
  async function loadAssistantReview(paperId) {
    setLoadingAssistantReview(true);
    setAssistantReviewError(null);

    try {
      const data = await getAssistantReview(paperId);
      const normalized = Array.isArray(data)
        ? (data.length > 0 ? data[0] : null)
        : (data ?? null);
      setAssistantReview(normalized);
    } catch (err) {
      if (err?.response?.status === 404) setAssistantReview(null);
      else setAssistantReviewError(err);
    } finally {
      setLoadingAssistantReview(false);
    }
  }

  /* ── Detail panel ── */
  function openDetail(id) {
    const p = papers.find(x => x.id === id);
    if (!p) return;
    setActivePaper(p);
    setDetailOpen(true);
    resetReviewUI(p);
    document.body.style.overflow = 'hidden';
    loadReviews(p.id);
    loadAssistantReview(p.id);
  }

  function closeDetail() {
    setDetailOpen(false);
    setActivePaper(null);
    resetReviewUI(null);
    document.body.style.overflow = '';
  }

  function resetReviewUI(paper) {
    setNoteEditorOpen(false);
    setNoteText('');
    setDecision('');
    setSaveError(null);
    setInitialReview(null);
    setInitialReviewError(null);
    // ← تصفير تقرير مساعد المحرر
    setAssistantReview(null);
    setLoadingAssistantReview(false);
    setAssistantReviewError(null);
    // ← تصفير حالة اللجنة
    setCommitteePanelOpen(false);
    setAvailableReviewers([]);
    setPrimaryReviewerIds([]);
    setSubstituteReviewerIds([]);
    // الافتراضي: نفس نوع تحكيم البحث نفسه (single_blind / double_blind)
    setBlindingType(paper?.review_blindness_type === 'double_blind' ? 'double_blind' : 'single_blind');
    setReviewersError(null);
    setCommitteeError(null);
    setCommitteeSuccess(false);
    setSuggesting(false);
    setLastSuggestionApplied(false);
    // ← تصفير حالة عرض اللجنة الكاملة
    setCommitteeStatusOpen(false);
    setCommitteeStatus(null);
    setLoadingCommitteeStatus(false);
    setCommitteeStatusError(null);
    // ← تصفير حالة معرفة وجود اللجنة من عدمه
    setCommitteeExists(null);
    setCheckingCommittee(false);
    // ← تصفير قرار المحرر النهائي
    setFinalDecision('');
    setFinalNoteText('');
    setLanguageReviewPassed(false);
    setCitationCheckPassed(false);
    setPublisherPermissionObtained(false);
    setSubmittingFinalDecision(false);
    setFinalDecisionError(null);
    setFinalReview(null);
    // ← تصفير حالة النشر
    setPublishing(false);
    setPublishError(null);
    setPublishSuccess(false);
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
      const payload = {
        notes: noteText.trim(),
        decision, // "REVISION_REQUIRED" | "SEND_TO_COMMITTEE"
      };

      const data = await submitEditorReviewInitial(activePaper.id, payload);
      setInitialReview(data ?? payload);
      notify('success', 'تم إرسال التقرير بنجاح', 'Report submitted successfully');

      setNoteEditorOpen(false);
      setNoteText('');
      setDecision('');
    } catch (err) {
      setSaveError(err);
      notify('error', extractErrorMessage(err, lang), 'Failed to submit report');
    } finally {
      setSavingNote(false);
    }
  }

  /* ── فحص فيما إذا في لجنة مشكّلة أصلاً لهاد البحث
        بنستخدم نفس getCommitteeStatus؛ 404 يعني "ما في لجنة بعد" (مش خطأ حقيقي) ── */
  async function checkCommitteeExists(paperId) {
    setCheckingCommittee(true);
    try {
      const data = await getCommitteeStatus(paperId);
      const exists = !!(data && (data.id || data.editor_name || (data.members && data.members.length > 0)));
      setCommitteeExists(exists);
      if (exists) setCommitteeStatus(data); // ← تخزين مسبق، بيترفتش بعدين لو المستخدم فتح البانل فعلياً
    } catch (err) {
      // أي خطأ (404 أو غيره) بحالة الفحص هاد → منعتبر ما في لجنة بعد، بلاش نعلّق الواجهة
      setCommitteeExists(false);
    } finally {
      setCheckingCommittee(false);
    }
  }

  /* ── جلب المراجعين المتاحين لهاد البحث ── */
  async function openCommitteePanel() {
    if (!activePaper) return;
    setCommitteePanelOpen(true);
    setLoadingReviewers(true);
    setReviewersError(null);
    setPrimaryReviewerIds([]);
    setSubstituteReviewerIds([]);
    setBlindingType(activePaper.review_blindness_type === 'double_blind' ? 'double_blind' : 'single_blind');
    setCommitteeError(null);
    setCommitteeSuccess(false);
    setLastSuggestionApplied(false);

    try {
      const data = await getAvailableReviewers(activePaper.id);
      setAvailableReviewers(Array.isArray(data) ? data : []);
    } catch (err) {
      setReviewersError(err);
      notify('error', 'فشل تحميل المحكّمين المتاحين', 'Failed to load available reviewers');
    } finally {
      setLoadingReviewers(false);
    }
  }

  function closeCommitteePanel() {
    setCommitteePanelOpen(false);
  }

  function setReviewerRole(userId, role) {
    setPrimaryReviewerIds(prev => prev.filter(id => id !== userId));
    setSubstituteReviewerIds(prev => prev.filter(id => id !== userId));
    if (role === 'primary') {
      setPrimaryReviewerIds(prev => [...prev, userId]);
    } else if (role === 'substitute') {
      setSubstituteReviewerIds(prev => [...prev, userId]);
    }
    setLastSuggestionApplied(false);
  }

  function getReviewerRole(userId) {
    if (primaryReviewerIds.includes(userId)) return 'primary';
    if (substituteReviewerIds.includes(userId)) return 'substitute';
    return 'none';
  }

  function suggestCommitteeSmart() {
    if (!availableReviewers || availableReviewers.length === 0) return;

    setSuggesting(true);
    setCommitteeError(null);

    try {
      const { primary, substitute } = buildSmartCommitteeSuggestion(availableReviewers);
      setPrimaryReviewerIds(primary.map(r => r.user_id));
      setSubstituteReviewerIds(substitute.map(r => r.user_id));
      setLastSuggestionApplied(true);
      notify('success', 'تم تطبيق الاقتراح الذكي للجنة', 'Smart committee suggestion applied');
    } finally {
      setSuggesting(false);
    }
  }

  /* ── إنشاء اللجنة ── */
  async function handleCreateCommittee() {
    if (!activePaper) return;
    if (primaryReviewerIds.length !== REQUIRED_PRIMARY_COUNT) return;

    setCreatingCommittee(true);
    setCommitteeError(null);

    try {
      const payload = {
        primary_users: primaryReviewerIds,
        substitute_users: substituteReviewerIds,
        blinding_type: blindingType,
      };
      await createCommittee(activePaper.id, payload);
      setCommitteeSuccess(true);
      setCommitteeExists(true);
      setCommitteePanelOpen(false);
      notify('success', 'تم إنشاء اللجنة بنجاح', 'Committee created successfully');
    } catch (err) {
      setCommitteeError(err);
      notify('error', extractErrorMessage(err, lang), 'Failed to create committee');
    } finally {
      setCreatingCommittee(false);
    }
  }

  /* ── فتح/جلب حالة اللجنة الكاملة (أعضاء + ردود + قرارات) ── */
  async function openCommitteeStatusPanel() {
    if (!activePaper) return;
    setCommitteeStatusOpen(true);
    setLoadingCommitteeStatus(true);
    setCommitteeStatusError(null);
    try {
      const data = await getCommitteeStatus(activePaper.id);
      setCommitteeStatus(data);
      notify('success', 'تم تحميل حالة اللجنة', 'Committee status loaded');
    } catch (err) {
      setCommitteeStatusError(err);
      notify('error', extractErrorMessage(err, lang), 'Failed to load committee status');
    } finally {
      setLoadingCommitteeStatus(false);
    }
  }

  function closeCommitteeStatusPanel() {
    setCommitteeStatusOpen(false);
  }

  /* ── إرسال قرار المحرر النهائي (بعد رجوع تحكيم اللجنة) ── */
  async function submitFinalDecision() {
    if (!activePaper || !finalDecision || !finalNoteText.trim()) return;
    if (finalDecision === 'ACCEPT' && !(languageReviewPassed && citationCheckPassed && publisherPermissionObtained)) return;

    setSubmittingFinalDecision(true);
    setFinalDecisionError(null);

    try {
      const payload = {
        notes: finalNoteText.trim(),
        decision: finalDecision, // "ACCEPT" | "REJECT" | "REVISION_REQUIRED"
        language_review_passed: languageReviewPassed,
        citation_check_passed: citationCheckPassed,
        publisher_permission_obtained: publisherPermissionObtained,
      };
      const data = await submitEditorReviewFinal(activePaper.id, payload);
      setFinalReview(data ?? payload);
      notify('success', 'تم حفظ القرار النهائي بنجاح', 'Final decision saved successfully');
    } catch (err) {
      setFinalDecisionError(err);
      notify('error', extractErrorMessage(err, lang), 'Failed to submit final decision');
    } finally {
      setSubmittingFinalDecision(false);
    }
  }

  /* ── نشر البحث ── */
  async function handlePublishPaper() {
    if (!activePaper) return;

    setPublishing(true);
    setPublishError(null);
    setPublishSuccess(false);

    try {
      await publishPaper(activePaper.id);
      setPublishSuccess(true);
      notify('success', 'تم نشر البحث بنجاح', 'Paper published successfully');
    } catch (err) {
      setPublishError(extractErrorMessage(err, lang));
      notify('error', extractErrorMessage(err, lang), 'Failed to publish paper');
    } finally {
      setPublishing(false);
    }
  }

  /* ── تحميل ملف الـ PDF عبر الـ API الموثّق (blob) بدل رابط /media/ الخام ── */
  async function handleDownloadPdf() {
    if (!activePaper?.pdf_file) return;
    try {
      const blob = await downloadPaper(activePaper.id);
      const filename = activePaper.pdf_file.split('/').pop() || 'paper.pdf';
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify('success', 'تم تنزيل ملف البحث', 'Paper downloaded successfully');
    } catch (err) {
      console.error(err);
      notify('error', 'فشل تنزيل ملف البحث', 'Failed to download paper');
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

  /* ══════════ RENDER ══════════ */
  return (
    <div className={`ea-root theme-${theme} lang-${lang}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Cursor glow */}
      <div className="ea-cg" ref={cgRef} />

      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        hoveredMenu={hoveredMenu}
        setHoveredMenu={setHoveredMenu}
        scrolled={navScrolled}
        Logo={Logo}
      />

      <HeroSection lang={lang} t={t} displayName={displayName} papers={papers} statPending={statPending} statNoted={statNoted} />

      <PapersSection
        t={t} lang={lang} filtered={filtered} loading={loading} error={error}
        errorMessage={error ? extractErrorMessage(error, lang) : null}
        activeFilter={activeFilter} setActiveFilter={setActiveFilter}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        onOpenDetail={openDetail}
      />


      {/* ══ DETAIL PANEL ══ */}
      <DetailPanelShell open={detailOpen} onClose={closeDetail} activePaper={activePaper} lang={lang} t={t}>
        {activePaper && (
          <>
            <PaperOverviewSection
              activePaper={activePaper} lang={lang} t={t}
              getStatus={getStatus} handleDownloadPdf={handleDownloadPdf}
            />

            <AssistantReportReadOnly
              t={t} lang={lang} extractErrorMessage={extractErrorMessage}
              loadingAssistantReview={loadingAssistantReview}
              assistantReviewError={assistantReviewError}
              assistantReview={assistantReview}
            />

            <InitialReviewSection
              t={t} lang={lang} extractErrorMessage={extractErrorMessage}
              loadingInitialReview={loadingInitialReview}
              initialReviewError={initialReviewError}
              initialReview={initialReview}
            />

            {initialReview?.decision === 'SEND_TO_COMMITTEE' && (
              <FinalDecisionForm
                t={t} lang={lang} extractErrorMessage={extractErrorMessage}
                checkingCommittee={checkingCommittee} committeeExists={committeeExists}
                committeeStatusOpen={committeeStatusOpen} openCommitteeStatusPanel={openCommitteeStatusPanel}
                committeePanelOpen={committeePanelOpen} committeeSuccess={committeeSuccess}
                openCommitteePanel={openCommitteePanel}
                committeeStatus={committeeStatus}
                finalDecision={finalDecision} setFinalDecision={setFinalDecision}
                finalNoteText={finalNoteText} setFinalNoteText={setFinalNoteText}
                languageReviewPassed={languageReviewPassed} setLanguageReviewPassed={setLanguageReviewPassed}
                citationCheckPassed={citationCheckPassed} setCitationCheckPassed={setCitationCheckPassed}
                publisherPermissionObtained={publisherPermissionObtained} setPublisherPermissionObtained={setPublisherPermissionObtained}
                submittingFinalDecision={submittingFinalDecision} finalDecisionError={finalDecisionError}
                finalReview={finalReview} submitFinalDecision={submitFinalDecision}
                publishing={publishing} publishSuccess={publishSuccess} publishError={publishError}
                handlePublishPaper={handlePublishPaper}
              />
            )}

            {committeeSuccess && (
              <p style={{ color: '#22C55E', fontSize: 13, marginTop: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiCheckCircle size={15} />
                {t('committee_success')}
              </p>
            )}

            <CommitteeStatusPanel
              t={t} lang={lang} extractErrorMessage={extractErrorMessage}
              committeeStatusOpen={committeeStatusOpen} closeCommitteeStatusPanel={closeCommitteeStatusPanel}
              loadingCommitteeStatus={loadingCommitteeStatus} committeeStatusError={committeeStatusError}
              committeeStatus={committeeStatus}
            />

            <CommitteePanel
              t={t} lang={lang} extractErrorMessage={extractErrorMessage}
              committeePanelOpen={committeePanelOpen} closeCommitteePanel={closeCommitteePanel}
              loadingReviewers={loadingReviewers} reviewersError={reviewersError} availableReviewers={availableReviewers}
              getReviewerRole={getReviewerRole} setReviewerRole={setReviewerRole}
              primaryReviewerIds={primaryReviewerIds} blindingType={blindingType} setBlindingType={setBlindingType}
              suggesting={suggesting} lastSuggestionApplied={lastSuggestionApplied} suggestCommitteeSmart={suggestCommitteeSmart}
              creatingCommittee={creatingCommittee} committeeError={committeeError} handleCreateCommittee={handleCreateCommittee}
            />

            <ReviewEditorForm
              t={t} lang={lang} extractErrorMessage={extractErrorMessage}
              initialReview={initialReview} noteEditorOpen={noteEditorOpen}
              openReviewEditor={openReviewEditor} cancelReviewEditor={cancelReviewEditor}
              noteText={noteText} setNoteText={setNoteText} decision={decision} setDecision={setDecision}
              savingNote={savingNote} saveError={saveError} submitReview={submitReview}
            />
          </>
        )}
      </DetailPanelShell>
    </div>
  );
}
