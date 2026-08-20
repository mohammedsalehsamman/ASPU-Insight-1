import { useState, useEffect, useRef } from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import {
  getPapers, getPaper, submitAssistantReport, getAssistantReview, getPlagiarismReport, suggestKeywords,
  getIEEEReports, getIEEEReportDetail, submitIEEECheck, deleteIEEEReport,
  submitClaimEvidenceAnalysis, getClaimEvidenceReports, getClaimEvidenceReportDetail, deleteClaimEvidenceReport,
  getMetadataScore, downloadPaper, 
} from "../../api/research";
import Navbar from '../../components/Navbar';
import Logo from '../../components/Logo';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import "../../styling/EditorAssistant.css"
import { EditorAssistantDict, createLocalT } from "../../i18n";
import useNavScroll from '../../components/shared/useNavScroll';
import { getFooterContent } from '../../components/shared/footerContent';
import HeroSection from '../../components/shared/HeroSection';
import PapersTabList from '../../components/assistant/PapersTabList';
import IeeeReportsTabList from '../../components/assistant/IeeeReportsTabList';
import ClaimsReportsTabList from '../../components/assistant/ClaimsReportsTabList';
import PaperOverview from '../../components/assistant/PaperOverview';
import PlagiarismSection from '../../components/assistant/PlagiarismSection';
import KeywordsSection from '../../components/assistant/KeywordsSection';
import MetadataScoreSection from '../../components/assistant/MetadataScoreSection';
import IeeeCheckSection from '../../components/assistant/IeeeCheckSection';
import ClaimCheckSection from '../../components/assistant/ClaimCheckSection';
import PdfFileSection from '../../components/assistant/PdfFileSection';
import AssistantReportSection from '../../components/assistant/AssistantReportSection';
import IeeeReportDetail from '../../components/assistant/IeeeReportDetail';
import ClaimReportDetail from '../../components/assistant/ClaimReportDetail';

export default function EditorAssistant() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const t = createLocalT(EditorAssistantDict, lang);

  const [activeView, setActiveView] = useState(''); 

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePaper, setActivePaper] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { notify } = useToast();
  const navScrolled = useNavScroll();
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [previewIdx, setPreviewIdx] = useState(null);

  const [decision, setDecision] = useState('APPROVE');
  const [isFormatCompliant, setIsFormatCompliant] = useState(true);
  const [isComplete, setIsComplete] = useState(true);
  const [policyNotes, setPolicyNotes] = useState('');

  const [savingNote, setSavingNote] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [reviewData, setReviewData] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const [plagiarismData, setPlagiarismData] = useState(null);
  const [loadingPlagiarism, setLoadingPlagiarism] = useState(false);
  const [plagiarismError, setPlagiarismError] = useState(null);

  const [keywordsData, setKeywordsData] = useState(null);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [keywordsError, setKeywordsError] = useState(null);

  const [ieeeReports, setIeeeReports] = useState([]);
  const [ieeeReportsLoaded, setIeeeReportsLoaded] = useState(false); 
  const [loadingIeeeReports, setLoadingIeeeReports] = useState(false);
  const [ieeeReportsError, setIeeeReportsError] = useState(null);

  const [activeIeeeReport, setActiveIeeeReport] = useState(null);
  const [ieeeDetailOpen, setIeeeDetailOpen] = useState(false);
  const [loadingIeeeDetail, setLoadingIeeeDetail] = useState(false);
  const [ieeeDetailError, setIeeeDetailError] = useState(null);

  const [ieeeCheckData, setIeeeCheckData] = useState(null);
  const [loadingIeeeCheck, setLoadingIeeeCheck] = useState(false);
  const [ieeeCheckError, setIeeeCheckError] = useState(null);

  const [deletingIeeeId, setDeletingIeeeId] = useState(null);

  const [claimReports, setClaimReports] = useState([]);
  const [claimReportsLoaded, setClaimReportsLoaded] = useState(false); 
  const [loadingClaimReports, setLoadingClaimReports] = useState(false);
  const [claimReportsError, setClaimReportsError] = useState(null);

  const [activeClaimReport, setActiveClaimReport] = useState(null);
  const [claimDetailOpen, setClaimDetailOpen] = useState(false);
  const [loadingClaimDetail, setLoadingClaimDetail] = useState(false);
  const [claimDetailError, setClaimDetailError] = useState(null);

  const [claimAnalysisData, setClaimAnalysisData] = useState(null);
  const [loadingClaimAnalysis, setLoadingClaimAnalysis] = useState(false);
  const [claimAnalysisError, setClaimAnalysisError] = useState(null);

  const [deletingClaimId, setDeletingClaimId] = useState(null);

  const [metadataScoreData, setMetadataScoreData] = useState(null);
  const [loadingMetadataScore, setLoadingMetadataScore] = useState(false);
  const [metadataScoreError, setMetadataScoreError] = useState(null);

  const cgRef = useRef(null);


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

  useEffect(() => {
    if (activeView !== 'ieee' || ieeeReportsLoaded) return;
    let cancelled = false;
    setLoadingIeeeReports(true);
    setIeeeReportsError(null);

    getIEEEReports()
      .then(data => {
        if (!cancelled) {
          setIeeeReports(Array.isArray(data) ? data : data.results ?? []);
          setIeeeReportsLoaded(true);
          setLoadingIeeeReports(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setIeeeReportsError(err);
          notify('error', 'فشل تحميل تقارير IEEE', 'Failed to load IEEE reports');
          setLoadingIeeeReports(false);
        }
      });

    return () => { cancelled = true; };
  }, [activeView, ieeeReportsLoaded]);

  useEffect(() => {
    if (activeView !== 'claims' || claimReportsLoaded) return;
    let cancelled = false;
    setLoadingClaimReports(true);
    setClaimReportsError(null);

    getClaimEvidenceReports()
      .then(data => {
        if (!cancelled) {
          setClaimReports(Array.isArray(data) ? data : data.results ?? []);
          setClaimReportsLoaded(true);
          setLoadingClaimReports(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setClaimReportsError(err);
          notify('error', 'فشل تحميل تحاليل الادعاءات والأدلة', 'Failed to load claim-evidence analyses');
          setLoadingClaimReports(false);
        }
      });

    return () => { cancelled = true; };
  }, [activeView, claimReportsLoaded]);

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

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') {
        if (menuOpen) closeMenu();
        else if (claimDetailOpen) closeClaimDetail();
        else if (ieeeDetailOpen) closeIeeeDetail();
        else if (detailOpen) closeDetail();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen, detailOpen, ieeeDetailOpen, claimDetailOpen]);

  function openMenu() {
    if (menuOpen) return;
    setMenuOpen(true);
  }

  function closeMenu() {
    if (!menuOpen) return;
    setMenuOpen(false);
    setPreviewIdx(null);
  }

  async function openDetail(id) {
    const cached = papers.find(x => x.id === id);
    if (!cached) return;
    closeIeeeDetail(); 
    closeClaimDetail(); 
    setActivePaper(cached); 
    setDetailOpen(true);
    setNoteEditorOpen(false);
    setNoteText('');
    setDecision('APPROVE');
    setIsFormatCompliant(true);
    setIsComplete(true);
    setPolicyNotes('');
    setSaveError(null);
    setReviewData(null);
    setReviewError(null);
    setPlagiarismData(null);
    setPlagiarismError(null);
    setKeywordsData(null);
    setKeywordsError(null);
    setIeeeCheckData(null);
    setIeeeCheckError(null);
    setClaimAnalysisData(null);
    setClaimAnalysisError(null);
    setMetadataScoreData(null);
    setMetadataScoreError(null);
    document.body.style.overflow = 'hidden';

    setLoadingDetail(true);
    try {
      const fresh = await getPaper(id);
      if (fresh) {
        setActivePaper(fresh);
        setPapers(prev => prev.map(x => (x.id === id ? fresh : x)));
      }
    } catch (err) {
      console.error('Failed to refresh paper detail:', err);
      notify('error', 'فشل تحديث تفاصيل البحث', 'Failed to refresh paper details');
    } finally {
      setLoadingDetail(false);
    }
  }

  function closeDetail() {
    setDetailOpen(false);
    setActivePaper(null);
    setNoteEditorOpen(false);
    setNoteText('');
    setDecision('APPROVE');
    setIsFormatCompliant(true);
    setIsComplete(true);
    setPolicyNotes('');
    setSaveError(null);
    setReviewData(null);
    setReviewError(null);
    setPlagiarismData(null);
    setPlagiarismError(null);
    setKeywordsData(null);
    setKeywordsError(null);
    setIeeeCheckData(null);
    setIeeeCheckError(null);
    setClaimAnalysisData(null);
    setClaimAnalysisError(null);
    setMetadataScoreData(null);
    setMetadataScoreError(null);
    document.body.style.overflow = '';
  }

  async function loadReview() {
    if (!activePaper) return;
    setLoadingReview(true);
    setReviewError(null);
    try {
      const data = await getAssistantReview(activePaper.id);
      const normalized = Array.isArray(data)
        ? (data.length > 0 ? data[0] : null)
        : (data ?? null);
      setReviewData(normalized);
      notify('success', 'تم تحميل تقرير مساعد المحرر', 'Assistant report loaded');
    } catch (err) {
      if (err?.response?.status === 404) setReviewData(null);
      else {
        setReviewError(err);
        notify('error', 'فشل تحميل تقرير مساعد المحرر', 'Failed to load the assistant report');
      }
    } finally {
      setLoadingReview(false);
    }
  }

  async function loadPlagiarismReport() {
    if (!activePaper) return;
    setLoadingPlagiarism(true);
    setPlagiarismError(null);
    try {
      const data = await getPlagiarismReport(activePaper.id);
      setPlagiarismData(data);
      notify('success', 'تم تحميل تقرير الانتحال', 'Plagiarism report loaded');
    } catch (err) {
      setPlagiarismError(err);
      notify('error', 'فشل تحميل تقرير الانتحال', 'Failed to load the plagiarism report');
    } finally {
      setLoadingPlagiarism(false);
    }
  }

  async function loadKeywordsSuggestion() {
    if (!activePaper) return;
    setLoadingKeywords(true);
    setKeywordsError(null);
    try {
      const data = await suggestKeywords(activePaper.id);
      setKeywordsData(data);
      notify('success', 'تم تحميل اقتراحات الكلمات المفتاحية', 'Keyword suggestions loaded');
    } catch (err) {
      setKeywordsError(err);
      notify('error', 'فشل تحميل اقتراحات الكلمات المفتاحية', 'Failed to load keyword suggestions');
    } finally {
      setLoadingKeywords(false);
    }
  }

  async function loadMetadataScore() {
    if (!activePaper) return;
    setLoadingMetadataScore(true);
    setMetadataScoreError(null);
    try {
      const data = await getMetadataScore(activePaper.id);
      setMetadataScoreData(data);
      notify('success', 'تم تحميل درجة جودة الميتاداتا', 'Metadata quality score loaded');
    } catch (err) {
      setMetadataScoreError(err);
      notify('error', 'فشل تحميل درجة جودة الميتاداتا', 'Failed to load metadata quality score');
    } finally {
      setLoadingMetadataScore(false);
    }
  }

  async function runIeeeCheck() {
    if (!activePaper?.pdf_file) {
      notify('error', 'يجب إرفاق ملف PDF لتشغيل الفحص', 'A PDF is required to run this check');
      return;
    }
    setLoadingIeeeCheck(true);
    setIeeeCheckError(null);
    try {
      const blob = await downloadPaper(activePaper.id);
      const filename = activePaper.pdf_file.split('/').pop() || 'paper.pdf';
      const file = new File([blob], filename, { type: blob.type || 'application/pdf' });

      const formData = new FormData();
      formData.append('document_file', file);

      const data = await submitIEEECheck(formData);
      setIeeeCheckData(data);
      notify('success', 'تم تشغيل فحص IEEE بنجاح', 'IEEE check completed successfully');
    } catch (err) {
      setIeeeCheckError(err);
      notify('error', 'فشل تشغيل فحص IEEE', 'Failed to run IEEE check');
    } finally {
      setLoadingIeeeCheck(false);
    }
  }

  async function runClaimAnalysis() {
    if (!activePaper?.pdf_file) {
      notify('error', 'يجب إرفاق ملف PDF لتشغيل التحليل', 'A PDF is required to run this analysis');
      return;
    }
    setLoadingClaimAnalysis(true);
    setClaimAnalysisError(null);
    try {
      const blob = await downloadPaper(activePaper.id);
      const filename = activePaper.pdf_file.split('/').pop() || 'paper.pdf';
      const file = new File([blob], filename, { type: blob.type || 'application/pdf' });

      const formData = new FormData();
      formData.append('document_file', file);

      const data = await submitClaimEvidenceAnalysis(formData);
      setClaimAnalysisData(data);
      setClaimReportsLoaded(false);
      notify('success', 'تم تشغيل تحليل الادعاءات والأدلة بنجاح', 'Claim-evidence analysis completed successfully');
    } catch (err) {
      setClaimAnalysisError(err);
      notify('error', 'فشل تشغيل تحليل الادعاءات والأدلة', 'Failed to run claim-evidence analysis');
    } finally {
      setLoadingClaimAnalysis(false);
    }
  }

  async function handleDownloadPdf() {
    if (!activePaper?.pdf_file) {
      notify('error', 'لا يوجد ملف PDF لتنزيله', 'There is no PDF file to download');
      return;
    }
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

  async function saveNote() {
    if (!activePaper || !noteText.trim()) return;

    setSavingNote(true);
    setSaveError(null);

    try {
      const payload = {
        decision,                              
        notes: noteText.trim(),
        is_format_compliant: isFormatCompliant, // boolean
        is_complete: isComplete,                // boolean
        policy_notes: policyNotes.trim(),       // string (يمكن يكون فاضي)
      };

      await submitAssistantReport(activePaper.id, payload);

      // الباك إند بيرجع فقط رسالة تأكيد، فبنبني الكائن المحدث يدوياً
      const updatedPaper = {
        ...activePaper,
        assistant_editor_report: noteText.trim(),
        is_reviewed_by_assistant: true,
      };

      setPapers(prev =>
        prev.map(p => (p.id === activePaper.id ? updatedPaper : p))
      );
      setActivePaper(updatedPaper);
      setNoteEditorOpen(false);
      setNoteText('');
      setPolicyNotes('');
      notify('success', 'تم حفظ تقرير مساعد المحرر بنجاح', 'Assistant report saved successfully');
    } catch (err) {
      setSaveError(err);
      notify('error', 'فشل حفظ تقرير مساعد المحرر', 'Failed to save the assistant report');
    } finally {
      setSavingNote(false);
    }
  }

  /* ── Detail panel (IEEE Reports) ── */
  async function openIeeeDetail(id) {
    closeDetail(); // ← تأكيد إغلاق بانل البحث إذا كان مفتوح
    closeClaimDetail(); // ← تأكيد إغلاق بانل تحليل الادعاءات والأدلة إذا كان مفتوح
    setIeeeDetailOpen(true);
    setActiveIeeeReport(null);
    setIeeeDetailError(null);
    setLoadingIeeeDetail(true);
    document.body.style.overflow = 'hidden';
    try {
      const data = await getIEEEReportDetail(id);
      setActiveIeeeReport(data);
    } catch (err) {
      setIeeeDetailError(err);
      notify('error', 'فشل تحميل تفاصيل تقرير IEEE', 'Failed to load IEEE report details');
    } finally {
      setLoadingIeeeDetail(false);
    }
  }

  function closeIeeeDetail() {
    setIeeeDetailOpen(false);
    setActiveIeeeReport(null);
    setIeeeDetailError(null);
    document.body.style.overflow = '';
  }
  /* ── حذف تقرير IEEE (DELETE ieee/reports/{id}) ── */
  async function handleDeleteIeeeReport(e, id) {
    e.stopPropagation(); // ← منع فتح البانل عند الضغط على زر الحذف
    const confirmMsg = lang === 'ar'
      ? 'هل أنت متأكد من حذف هذا التقرير؟'
      : 'Are you sure you want to delete this report?';
    if (!window.confirm(confirmMsg)) return;

    setDeletingIeeeId(id);
    try {
      await deleteIEEEReport(id);
      setIeeeReports(prev => prev.filter(r => r.id !== id));
      if (activeIeeeReport?.id === id) closeIeeeDetail();
      notify('success', 'تم حذف تقرير IEEE', 'IEEE report deleted');
    } catch (err) {
      notify('error', 'فشل حذف التقرير، حاول مرة أخرى', 'Failed to delete report, please try again');
    } finally {
      setDeletingIeeeId(null);
    }
  }

  /* ── Detail panel (Claim-Evidence Reports) ── */
  async function openClaimDetail(id) {
    closeDetail(); // ← تأكيد إغلاق بانل البحث إذا كان مفتوح
    closeIeeeDetail(); // ← تأكيد إغلاق بانل IEEE إذا كان مفتوح
    setClaimDetailOpen(true);
    setActiveClaimReport(null);
    setClaimDetailError(null);
    setLoadingClaimDetail(true);
    document.body.style.overflow = 'hidden';
    try {
      const data = await getClaimEvidenceReportDetail(id);
      setActiveClaimReport(data);
    } catch (err) {
      setClaimDetailError(err);
      notify('error', 'فشل تحميل تفاصيل التحليل', 'Failed to load analysis details');
    } finally {
      setLoadingClaimDetail(false);
    }
  }

  function closeClaimDetail() {
    setClaimDetailOpen(false);
    setActiveClaimReport(null);
    setClaimDetailError(null);
    document.body.style.overflow = '';
  }

  /* ── حذف تقرير تحليل الادعاءات والأدلة (DELETE claim-evidence/reports/{id}) ── */
  async function handleDeleteClaimReport(e, id) {
    e.stopPropagation(); // ← منع فتح البانل عند الضغط على زر الحذف
    const confirmMsg = lang === 'ar'
      ? 'هل أنت متأكد من حذف هذا التحليل؟'
      : 'Are you sure you want to delete this analysis?';
    if (!window.confirm(confirmMsg)) return;

    setDeletingClaimId(id);
    try {
      await deleteClaimEvidenceReport(id);
      setClaimReports(prev => prev.filter(r => r.id !== id));
      if (activeClaimReport?.id === id) closeClaimDetail();
      notify('success', 'تم حذف التحليل', 'Analysis deleted');
    } catch (err) {
      notify('error', 'فشل حذف التحليل، حاول مرة أخرى', 'Failed to delete analysis, please try again');
    } finally {
      setDeletingClaimId(null);
    }
  }

  /* ── Filtering (Papers) ── */
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

  // ← فلترة تقارير IEEE بنفس صندوق البحث (بالاسم/عنوان البحث)
  const filteredIeee = ieeeReports.filter(r => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !r.original_filename?.toLowerCase().includes(q) &&
        !r.paper_title?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  // ← فلترة تقارير تحليل الادعاءات والأدلة بنفس صندوق البحث (بالاسم/عنوان البحث)
  const filteredClaims = claimReports.filter(r => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !r.original_filename?.toLowerCase().includes(q) &&
        !r.paper_title?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const statPending = papers.filter(p => !p.is_reviewed_by_assistant).length;
  const statNoted = papers.filter(p => p.is_reviewed_by_assistant).length;

  const displayName = user?.full_name || user?.email || (lang === 'ar' ? 'محمد' : 'Mohammad');

  /* ══════════ RENDER ══════════ */
  return (
    <div className={`ea-root theme-${theme} lang-${lang}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Cursor glow */}
      <div className="ea-cg" ref={cgRef} />
      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        hoveredMenu={previewIdx}
        setHoveredMenu={setPreviewIdx}
        scrolled={navScrolled}
        Logo={Logo}
      />

      <HeroSection lang={lang} t={t} displayName={displayName} papers={papers} statPending={statPending} statNoted={statNoted} />

      {/* ══ MAIN LIST (Papers / IEEE Reports / Claim-Evidence Reports) ══ */}
      <div className="main-wrap">
        <div className="sec-head">
          <div className="sec-dot" />
          <span className="sec-title">
            {activeView === 'papers' ? t('submitted') : activeView === 'ieee' ? t('tab_ieee') : t('tab_claims')}
          </span>
          <div className="sec-rule" />
          <div className="sec-count">
            {activeView === 'papers' ? filtered.length : activeView === 'ieee' ? filteredIeee.length : filteredClaims.length}
          </div>
        </div>

        {/* ← تاب التبديل بين الأبحاث وتقارير IEEE وتحليل الادعاءات والأدلة */}
        <div className="filter-bar" style={{ marginBottom: 10 }}>
          <button
            className={`filter-pill ${activeView === 'papers' ? 'active' : ''}`}
            onClick={() => { setActiveView('papers'); setSearchQuery(''); }}
          >
            {t('tab_papers')}
          </button>
          <button
            className={`filter-pill ${activeView === 'ieee' ? 'active' : ''}`}
            onClick={() => { setActiveView('ieee'); setSearchQuery(''); }}
          >
            {t('tab_ieee')}
          </button>
          <button
            className={`filter-pill ${activeView === 'claims' ? 'active' : ''}`}
            onClick={() => { setActiveView('claims'); setSearchQuery(''); }}
          >
            {t('tab_claims')}
          </button>
        </div>

        {activeView === 'papers' ? (
          <PapersTabList
            t={t} lang={lang} filtered={filtered} loading={loading} error={error}
            activeFilter={activeFilter} setActiveFilter={setActiveFilter}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            onOpenDetail={openDetail}
          />
        ) : activeView === 'ieee' ? (
          <IeeeReportsTabList
            t={t} lang={lang} filteredIeee={filteredIeee}
            loadingIeeeReports={loadingIeeeReports} ieeeReportsError={ieeeReportsError}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            onOpenDetail={openIeeeDetail} deletingIeeeId={deletingIeeeId} onDelete={handleDeleteIeeeReport}
          />
        ) : (
          <ClaimsReportsTabList
            t={t} lang={lang} filteredClaims={filteredClaims}
            loadingClaimReports={loadingClaimReports} claimReportsError={claimReportsError}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            onOpenDetail={openClaimDetail} deletingClaimId={deletingClaimId} onDelete={handleDeleteClaimReport}
          />
        )}
      </div>


      {/* ══ DETAIL PANEL (Paper) ══ */}
      <div className={`detail-overlay ${detailOpen ? 'open' : ''}`} onClick={closeDetail} />
      <div className={`detail-panel ${detailOpen ? 'open' : ''}`}>
        {activePaper && (
          <>
            <div className="dp-header">
              <button className="dp-back-btn" onClick={closeDetail}>
                <FiChevronLeft size={14} />
              </button>
              <span className="dp-header-title">{t('details')}</span>
              <span className="dp-dept-tag">
                {activePaper.review_blindness_type === 'double_blind'
                  ? (lang === 'ar' ? 'تحكيم مزدوج' : 'Double Blind')
                  : (lang === 'ar' ? 'تحكيم فردي' : 'Single Blind')}
              </span>
            </div>

            <div className="dp-body">
              <PaperOverview activePaper={activePaper} lang={lang} t={t} />

              <PlagiarismSection
                t={t} lang={lang} plagiarismData={plagiarismData}
                loadingPlagiarism={loadingPlagiarism} plagiarismError={plagiarismError}
                loadPlagiarismReport={loadPlagiarismReport}
              />

              <KeywordsSection
                t={t} keywordsData={keywordsData} loadingKeywords={loadingKeywords}
                keywordsError={keywordsError} loadKeywordsSuggestion={loadKeywordsSuggestion}
              />

              <MetadataScoreSection
                t={t} lang={lang} metadataScoreData={metadataScoreData}
                loadingMetadataScore={loadingMetadataScore} metadataScoreError={metadataScoreError}
                loadMetadataScore={loadMetadataScore}
              />

              <IeeeCheckSection
                t={t} activePaper={activePaper} ieeeCheckData={ieeeCheckData}
                loadingIeeeCheck={loadingIeeeCheck} ieeeCheckError={ieeeCheckError} runIeeeCheck={runIeeeCheck}
              />

              <ClaimCheckSection
                t={t} lang={lang} activePaper={activePaper} claimAnalysisData={claimAnalysisData}
                loadingClaimAnalysis={loadingClaimAnalysis} claimAnalysisError={claimAnalysisError}
                runClaimAnalysis={runClaimAnalysis}
              />

              <PdfFileSection activePaper={activePaper} t={t} handleDownloadPdf={handleDownloadPdf} />

              <AssistantReportSection
                t={t} lang={lang}
                activePaper={activePaper} reviewData={reviewData} loadingReview={loadingReview}
                reviewError={reviewError} loadReview={loadReview}
                noteEditorOpen={noteEditorOpen} setNoteEditorOpen={setNoteEditorOpen}
                noteText={noteText} setNoteText={setNoteText} decision={decision} setDecision={setDecision}
                isFormatCompliant={isFormatCompliant} setIsFormatCompliant={setIsFormatCompliant}
                isComplete={isComplete} setIsComplete={setIsComplete}
                policyNotes={policyNotes} setPolicyNotes={setPolicyNotes}
                savingNote={savingNote} saveError={saveError} setSaveError={setSaveError} saveNote={saveNote}
              />
            </div>
          </>
        )}
      </div>

      <IeeeReportDetail
        t={t} lang={lang} ieeeDetailOpen={ieeeDetailOpen} closeIeeeDetail={closeIeeeDetail}
        loadingIeeeDetail={loadingIeeeDetail} ieeeDetailError={ieeeDetailError} activeIeeeReport={activeIeeeReport}
      />

      <ClaimReportDetail
        t={t} lang={lang} claimDetailOpen={claimDetailOpen} closeClaimDetail={closeClaimDetail}
        loadingClaimDetail={loadingClaimDetail} claimDetailError={claimDetailError} activeClaimReport={activeClaimReport}
      />
    </div>
  );
}
