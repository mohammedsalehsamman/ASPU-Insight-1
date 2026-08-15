import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  getPapers, getPaper, submitAssistantReport, getAssistantReview, getPlagiarismReport, suggestKeywords,
  getIEEEReports, getIEEEReportDetail, submitIEEECheck, deleteIEEEReport,
  submitClaimEvidenceAnalysis, getClaimEvidenceReports, getClaimEvidenceReportDetail, deleteClaimEvidenceReport,
  getMetadataScore, downloadPaper, // ⚠ لازم تكون مضافة بـ ../../api/research.js — شوف الملاحظة تحت
} from "../../api/research";
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import "../../styling/EditorAssistant.css"

/* ══════════════════
   SVG LOGO
══════════════════ */
const LogoSVG = () => (
  <svg width="38" height="38" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#0D0F12" />
    <circle cx="20" cy="19" r="14" fill="none" stroke="#C4A55A" strokeWidth="0.6" opacity="0.5" />
    <path d="M14,22 Q14,14 20,12 Q26,14 26,22 Q26,28 20,29 Q14,28 14,22 Z" fill="#141820" stroke="#C4A55A" strokeWidth="0.9" />
    <line x1="20" y1="12" x2="20" y2="29" stroke="#C4A55A" strokeWidth="1" />
    <polygon points="20,13 16.5,20 23.5,20" fill="#C4A55A" />
    <line x1="16.4" y1="20" x2="13" y2="24" stroke="#5A8FA0" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="17.5" y1="20" x2="15" y2="25" stroke="#6FA07A" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
    <line x1="20" y1="20" x2="20" y2="26" stroke="#C4A55A" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="22.5" y1="20" x2="25" y2="25" stroke="#8B6030" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
    <line x1="23.6" y1="20" x2="27" y2="24" stroke="#7A5A30" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="20" cy="13" r="1.5" fill="#E8D090" />
  </svg>
);

/* ══════════════════
   STATUS MAP  ← متوافق مع API values
══════════════════ */
const STATUS_MAP = {
  pending: { ar: 'بانتظار المراجعة', en: 'Pending Review', cls: 'status-pending' },
  under_review: { ar: 'قيد المراجعة', en: 'Under Review', cls: 'status-pending' },
  plagiarism_failed: { ar: 'فشل فحص الانتحال', en: 'Plagiarism Failed', cls: 'status-rejected' },
  plagiarism_passed: { ar: 'اجتاز فحص الانتحال', en: 'Plagiarism Passed', cls: 'status-noted' },
  accepted: { ar: 'مقبول', en: 'Accepted', cls: 'status-done' },
  rejected: { ar: 'مرفوض', en: 'Rejected', cls: 'status-rejected' },
  noted: { ar: 'تمت الملاحظة', en: 'Notes Added', cls: 'status-noted' },
};

const getStatus = (paper) => {
  // إذا راجعه مساعد المحرر → noted
  if (paper.is_reviewed_by_assistant || paper.assistant_editor_report) return STATUS_MAP['noted'];
  return STATUS_MAP[paper.status] ?? { ar: paper.status, en: paper.status, cls: 'status-pending' };
};

/* ══════════════════
   خريطة قرار مساعد المحرر (assistant-review.decision) — APPROVE | REJECT
══════════════════ */
const ASSISTANT_DECISION_MAP = {
  APPROVE: { ar: 'قبول', en: 'Approve', cls: 'status-done' },
  REJECT: { ar: 'رفض', en: 'Reject', cls: 'status-rejected' },
};

// ← حالة تقرير الـ IEEE (status العام: pending / completed / failed...الخ) — عرض عام لأي قيمة غير معروفة
const IEEE_STATUS_CLS = {
  pending: 'status-pending',
  completed: 'status-done',
  failed: 'status-rejected',
};

// ← حالة تقرير تحليل الادعاءات والأدلة (نفس فلسفة IEEE_STATUS_CLS)
const CLAIM_STATUS_CLS = {
  pending: 'status-pending',
  completed: 'status-done',
  failed: 'status-rejected',
};

const PREV_NAMES = {
  ar: ['الرئيسية', 'الأبحاث', 'الباحثون', 'النزاهة', 'تواصل معنا'],
  en: ['HOME', 'RESEARCH', 'RESEARCHERS', 'INTEGRITY', 'CONTACT'],
};

/* ══════════════════
   HELPER — بيرجع لون حسب الدرجة (أخضر/أصفر/أحمر) — مستخدم بعرض
   درجة جودة الميتاداتا وبنودها الفرعية
══════════════════ */
function scoreColor(score) {
  if (score >= 70) return 'var(--ac2)';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

/* ══════════════════
   MAIN COMPONENT
══════════════════ */
export default function EditorAssistant() {
  const { theme: globalTheme, setTheme } = useTheme();
  const { user } = useAuth();
  const [theme, setThemeState] = useState(globalTheme || 'light');
  const [lang, setLangState] = useState('ar');

  // ← تبديل بين تاب "الأبحاث المقدمة" وتاب "تقارير فحص IEEE" وتاب "تحليل الادعاءات والأدلة"
  const [activeView, setActiveView] = useState('ieee'); // 'papers' | 'ieee' | 'claims'

  // ← API state بدل INITIAL_PAPERS
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePaper, setActivePaper] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [previewIdx, setPreviewIdx] = useState(null);

  // ← حقول تقرير مساعد المحرر (تطابق الـ backend schema: decision/notes/is_format_compliant/is_complete/policy_notes)
  const [decision, setDecision] = useState('APPROVE');
  const [isFormatCompliant, setIsFormatCompliant] = useState(true);
  const [isComplete, setIsComplete] = useState(true);
  const [policyNotes, setPolicyNotes] = useState('');

  // ← حالة حفظ التقرير
  const [savingNote, setSavingNote] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ← حالة عرض المراجعات المخزّنة (GET assistant-review)
  const [reviewData, setReviewData] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // ← حالة تقرير فحص الانتحال (GET plagiarism-report)
  const [plagiarismData, setPlagiarismData] = useState(null);
  const [loadingPlagiarism, setLoadingPlagiarism] = useState(false);
  const [plagiarismError, setPlagiarismError] = useState(null);

  // ← حالة اقتراح الكلمات المفتاحية (POST keywords/suggest)
  const [keywordsData, setKeywordsData] = useState(null);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [keywordsError, setKeywordsError] = useState(null);

  // ══ IEEE Reports tab state ══
  const [ieeeReports, setIeeeReports] = useState([]);
  const [ieeeReportsLoaded, setIeeeReportsLoaded] = useState(false); // ← تحميل كسول أول مرة بس
  const [loadingIeeeReports, setLoadingIeeeReports] = useState(false);
  const [ieeeReportsError, setIeeeReportsError] = useState(null);

  const [activeIeeeReport, setActiveIeeeReport] = useState(null);
  const [ieeeDetailOpen, setIeeeDetailOpen] = useState(false);
  const [loadingIeeeDetail, setLoadingIeeeDetail] = useState(false);
  const [ieeeDetailError, setIeeeDetailError] = useState(null);

  // ══ IEEE check state (من داخل بانل تفاصيل البحث) ══
  const [ieeeCheckData, setIeeeCheckData] = useState(null);
  const [loadingIeeeCheck, setLoadingIeeeCheck] = useState(false);
  const [ieeeCheckError, setIeeeCheckError] = useState(null);

  // ══ حذف تقرير IEEE من الكارد ══
  const [deletingIeeeId, setDeletingIeeeId] = useState(null);

  // ══ Claim-Evidence Reports tab state (تحليل الادعاءات والأدلة) ══
  const [claimReports, setClaimReports] = useState([]);
  const [claimReportsLoaded, setClaimReportsLoaded] = useState(false); // ← تحميل كسول أول مرة بس
  const [loadingClaimReports, setLoadingClaimReports] = useState(false);
  const [claimReportsError, setClaimReportsError] = useState(null);

  const [activeClaimReport, setActiveClaimReport] = useState(null);
  const [claimDetailOpen, setClaimDetailOpen] = useState(false);
  const [loadingClaimDetail, setLoadingClaimDetail] = useState(false);
  const [claimDetailError, setClaimDetailError] = useState(null);

  // ══ Claim-Evidence analysis state (من داخل بانل تفاصيل البحث) ══
  const [claimAnalysisData, setClaimAnalysisData] = useState(null);
  const [loadingClaimAnalysis, setLoadingClaimAnalysis] = useState(false);
  const [claimAnalysisError, setClaimAnalysisError] = useState(null);

  // ══ حذف تقرير Claim-Evidence من الكارد ══
  const [deletingClaimId, setDeletingClaimId] = useState(null);

  // ══ ✅ جديد: درجة جودة الميتاداتا (GET metadata-score) — من داخل بانل تفاصيل البحث ══
  const [metadataScoreData, setMetadataScoreData] = useState(null);
  const [loadingMetadataScore, setLoadingMetadataScore] = useState(false);
  const [metadataScoreError, setMetadataScoreError] = useState(null);

  const menuRef = useRef(null);
  const menuTopRef = useRef(null);
  const menuLinksRef = useRef([]);
  const menuFootRef = useRef(null);
  const cgRef = useRef(null);

  /* ── Theme / Lang applied to root ── */
  useEffect(() => {
    setThemeState(globalTheme || 'light');
  }, [globalTheme]);

  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

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

  /* ── Fetch IEEE reports lazily عند أول ما نفتح التاب ── */
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
          setLoadingIeeeReports(false);
        }
      });

    return () => { cancelled = true; };
  }, [activeView, ieeeReportsLoaded]);

  /* ── Fetch Claim-Evidence reports lazily عند أول ما نفتح التاب ── */
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
          setLoadingClaimReports(false);
        }
      });

    return () => { cancelled = true; };
  }, [activeView, claimReportsLoaded]);

  /* ── Scroll nav ── */
  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
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
        if (menuOpen) closeMenu();
        else if (claimDetailOpen) closeClaimDetail();
        else if (ieeeDetailOpen) closeIeeeDetail();
        else if (detailOpen) closeDetail();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen, detailOpen, ieeeDetailOpen, claimDetailOpen]);

  /* ── Shared menu state ── */
  function openMenu() {
    if (menuOpen) return;
    setMenuOpen(true);
  }

  function closeMenu() {
    if (!menuOpen) return;
    setMenuOpen(false);
    setPreviewIdx(null);
  }

  /* ── Detail panel (Papers) ── */
  async function openDetail(id) {
    const cached = papers.find(x => x.id === id);
    if (!cached) return;
    closeIeeeDetail(); // ← تأكيد إغلاق بانل IEEE إذا كان مفتوح
    closeClaimDetail(); // ← تأكيد إغلاق بانل تحليل الادعاءات والأدلة إذا كان مفتوح
    setActivePaper(cached); // ← فتح فوري بالبيانات المخزّنة، ثم نحدّثها بأحدث نسخة تحت
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

    // ← جلب نسخة حديثة من البحث بدل الاعتماد على القائمة المخزّنة عند تحميل الصفحة —
    // بدونها، ملف PDF مرفوع حديثاً (أو أي حقل آخر تغيّر) ما كان يظهر إلا بعد إعادة تحميل الصفحة كاملة.
    setLoadingDetail(true);
    try {
      const fresh = await getPaper(id);
      if (fresh) {
        setActivePaper(fresh);
        setPapers(prev => prev.map(x => (x.id === id ? fresh : x)));
      }
    } catch (err) {
      console.error('Failed to refresh paper detail:', err);
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

  /* ── جلب التقرير المخزّن عند الطلب (GET assistant-review) ── */
  async function loadReview() {
    if (!activePaper) return;
    setLoadingReview(true);
    setReviewError(null);
    try {
      const data = await getAssistantReview(activePaper.id);
      // ✅ الباك بيرجّع كائن واحد مش مصفوفة/paginated — منطبّع القيمة لكائن وحيد أو null
      const normalized = Array.isArray(data)
        ? (data.length > 0 ? data[0] : null)
        : (data ?? null);
      setReviewData(normalized);
    } catch (err) {
      // 404 = لا يوجد تقرير بعد، هاد مش خطأ حقيقي
      if (err?.response?.status === 404) setReviewData(null);
      else setReviewError(err);
    } finally {
      setLoadingReview(false);
    }
  }

  /* ── جلب تقرير فحص الانتحال (GET plagiarism-report) ── */
  async function loadPlagiarismReport() {
    if (!activePaper) return;
    setLoadingPlagiarism(true);
    setPlagiarismError(null);
    try {
      const data = await getPlagiarismReport(activePaper.id);
      setPlagiarismData(data);
    } catch (err) {
      setPlagiarismError(err);
    } finally {
      setLoadingPlagiarism(false);
    }
  }

  /* ── جلب اقتراح الكلمات المفتاحية (POST keywords/suggest) ── */
  async function loadKeywordsSuggestion() {
    if (!activePaper) return;
    setLoadingKeywords(true);
    setKeywordsError(null);
    try {
      const data = await suggestKeywords(activePaper.id);
      setKeywordsData(data);
    } catch (err) {
      setKeywordsError(err);
    } finally {
      setLoadingKeywords(false);
    }
  }

  /* ── ✅ جديد: جلب درجة جودة الميتاداتا (GET metadata-score) ──
     الباك بيرجع overall_score + sub_scores + breakdown (تفصيلي لكل بند مع الدرجة والوزن ورسالة)
     + recommendations + status، زي مثال الـ response يلي شفناه بالـ Postman */
  async function loadMetadataScore() {
    if (!activePaper) return;
    setLoadingMetadataScore(true);
    setMetadataScoreError(null);
    try {
      const data = await getMetadataScore(activePaper.id);
      setMetadataScoreData(data);
    } catch (err) {
      setMetadataScoreError(err);
    } finally {
      setLoadingMetadataScore(false);
    }
  }

  /* ── تشغيل فحص IEEE على ملف البحث الحالي (POST ieee/check) ── */
  async function runIeeeCheck() {
    if (!activePaper?.pdf_file) return;
    setLoadingIeeeCheck(true);
    setIeeeCheckError(null);
    try {
      // نجيب ملف الـ PDF المرفوع مسبقاً عبر الـ API الموثّق (مش رابط /media/ الخام) ونعيد رفعه كـ document_file
      const blob = await downloadPaper(activePaper.id);
      const filename = activePaper.pdf_file.split('/').pop() || 'paper.pdf';
      const file = new File([blob], filename, { type: blob.type || 'application/pdf' });

      const formData = new FormData();
      formData.append('document_file', file);

      const data = await submitIEEECheck(formData);
      setIeeeCheckData(data);
    } catch (err) {
      setIeeeCheckError(err);
    } finally {
      setLoadingIeeeCheck(false);
    }
  }

  /* ── تشغيل تحليل الادعاءات والأدلة على ملف البحث الحالي (POST claim-evidence/analyze) ── */
  async function runClaimAnalysis() {
    if (!activePaper?.pdf_file) return;
    setLoadingClaimAnalysis(true);
    setClaimAnalysisError(null);
    try {
      // نفس منطق فحص IEEE: نجيب ملف الـ PDF عبر الـ API الموثّق ونرفعه كـ document_file
      const blob = await downloadPaper(activePaper.id);
      const filename = activePaper.pdf_file.split('/').pop() || 'paper.pdf';
      const file = new File([blob], filename, { type: blob.type || 'application/pdf' });

      const formData = new FormData();
      formData.append('document_file', file);

      const data = await submitClaimEvidenceAnalysis(formData);
      setClaimAnalysisData(data);
      // ← نخلي تاب "تحليل الادعاءات والأدلة" يعيد التحميل لما نفتحه، عشان يطلع فيه التحليل الجديد
      setClaimReportsLoaded(false);
    } catch (err) {
      setClaimAnalysisError(err);
    } finally {
      setLoadingClaimAnalysis(false);
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
    } catch (err) {
      console.error(err);
    }
  }

  /* ── Save note (payload يطابق تماماً schema الـ backend) ── */
  async function saveNote() {
    if (!activePaper || !noteText.trim()) return;

    setSavingNote(true);
    setSaveError(null);

    try {
      const payload = {
        decision,                              // "APPROVE" | "REJECT"
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
    } catch (err) {
      setSaveError(err);
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
    } catch (err) {
      alert(lang === 'ar' ? 'فشل حذف التقرير، حاول مرة أخرى' : 'Failed to delete report, please try again');
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
    } catch (err) {
      alert(lang === 'ar' ? 'فشل حذف التحليل، حاول مرة أخرى' : 'Failed to delete analysis, please try again');
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

  const t = key => {
    const map = {
      total: { ar: 'إجمالي الأبحاث', en: 'Total Papers' },
      pending: { ar: 'بانتظار المراجعة', en: 'Pending Review' },
      noted: { ar: 'تمت مراجعتها', en: 'Reviewed' },
      submitted: { ar: 'الأبحاث المقدَّمة', en: 'Submitted Papers' },
      all: { ar: 'الكل', en: 'All' },
      search_ph: { ar: 'ابحث بالعنوان أو الكاتب...', en: 'Search by title or author...' },
      no_results: { ar: 'لا توجد نتائج', en: 'No results found' },
      no_sub: { ar: 'جرّب تغيير الفلتر أو البحث بكلمة أخرى', en: 'Try changing the filter or search keyword' },
      loading: { ar: 'جارٍ التحميل...', en: 'Loading...' },
      error: { ar: 'خطأ في تحميل البيانات', en: 'Failed to load papers' },
      details: { ar: 'تفاصيل البحث', en: 'Paper Details' },
      ref_id: { ar: 'الرقم المرجعي', en: 'Reference ID' },
      author: { ar: 'الباحث', en: 'Author' },
      submitted_d: { ar: 'نوع المراجعة', en: 'Review Type' },
      status_l: { ar: 'الحالة', en: 'Status' },
      abstract: { ar: 'الملخص', en: 'Abstract' },
      file: { ar: 'ملف البحث', en: 'Research File' },
      download: { ar: 'تحميل', en: 'Download' },
      no_file: { ar: 'لا يوجد ملف مرفق', en: 'No file attached' },
      notes_l: { ar: 'تقرير مساعد المحرر', en: 'Editor Report' },
      no_notes: { ar: 'لا يوجد تقرير بعد', en: 'No report yet' },
      add_note: { ar: 'أضف تقريرك', en: 'Add Your Report' },
      note_ph: { ar: 'اكتب تقريرك هنا...', en: 'Write your report here...' },
      cancel: { ar: 'إلغاء', en: 'Cancel' },
      save_note: { ar: 'حفظ التقرير', en: 'Save Report' },
      saving: { ar: 'جارٍ الحفظ...', en: 'Saving...' },
      save_fail: { ar: 'فشل حفظ التقرير، حاول مرة أخرى', en: 'Failed to save report, please try again' },
      plagiarism: { ar: 'درجة الانتحال', en: 'Plagiarism Score' },
      keywords: { ar: 'الكلمات المفتاحية', en: 'AI Keywords' },
      open_access: { ar: 'وصول مفتوح مدفوع', en: 'Paid Open Access' },
      yes: { ar: 'نعم', en: 'Yes' },
      no: { ar: 'لا', en: 'No' },
      appearance: { ar: 'المظهر', en: 'Appearance' },
      logout: { ar: 'تسجيل الخروج', en: 'Logout' },
      menu_l: { ar: 'القائمة', en: 'Menu' },
      close_l: { ar: 'إغلاق', en: 'Close' },
      journal: { ar: 'المجلة الأكاديمية', en: 'Academic Journal' },
      role: { ar: 'مساعد المحرر', en: 'Assistant Editor' },
      welcome_ar: 'مرحباً،',
      welcome_en: 'Welcome back,',
      papers_await_ar: 'بانتظار مراجعتك',
      papers_await_en: 'await your review',
      sub_ar: 'هنا كل الأبحاث المُقدَّمة حديثاً. اضغط على أي بحث لتطلع على تفاصيله وتضيف تقريرك.',
      sub_en: 'All recently submitted papers are listed below. Click any paper to view details and add your report.',
      plag_report_l: { ar: 'تقرير فحص الانتحال', en: 'Plagiarism Report' },
      plag_load_btn: { ar: 'عرض تقرير الانتحال', en: 'Load Plagiarism Report' },
      plag_pending: { ar: 'التقرير قيد الإنشاء، حاول لاحقاً', en: 'Report is being generated, try again later' },
      plag_total: { ar: 'نسبة التشابه الكلية', en: 'Total Similarity' },
      plag_internal: { ar: 'تشابه داخلي', en: 'Internal Similarity' },
      plag_external: { ar: 'تشابه خارجي', en: 'External Similarity' },
      plag_human: { ar: 'يتطلب مراجعة بشرية', en: 'Requires Human Review' },
      plag_fail: { ar: 'فشل تحميل تقرير الانتحال، حاول مرة أخرى', en: 'Failed to load plagiarism report, please try again' },
      kw_l: { ar: 'اقتراح كلمات مفتاحية', en: 'Keyword Suggestions' },
      kw_load_btn: { ar: 'اقترح كلمات مفتاحية', en: 'Suggest Keywords' },
      kw_none: { ar: 'لا توجد اقتراحات متاحة حالياً', en: 'No suggestions available right now' },
      kw_fail: { ar: 'فشل تحميل الكلمات المفتاحية', en: 'Failed to load keyword suggestions' },
      decision_l: { ar: 'القرار', en: 'Decision' },
      approve: { ar: 'قبول (APPROVE)', en: 'Approve' },
      reject: { ar: 'رفض (REJECT)', en: 'Reject' },
      format_ok_l: { ar: 'الفورمات مطابق للمعايير', en: 'Format is compliant' },
      complete_l: { ar: 'البحث مكتمل', en: 'Paper is complete' },
      policy_notes_l: { ar: 'ملاحظات السياسات (اختياري)', en: 'Policy Notes (optional)' },
      policy_ph: { ar: 'اكتب أي ملاحظات متعلقة بسياسات النشر...', en: 'Any policy-related notes...' },
      assistant_l: { ar: 'مساعد المحرر', en: 'Assistant' },
      assistant_notes_l: { ar: 'ملاحظات مساعد المحرر', en: "Assistant's Notes" },
      reviewed_at_l: { ar: 'تاريخ المراجعة', en: 'Reviewed At' },
      suggested_reviewers_l: { ar: 'المحكّمون المقترحون', en: 'Suggested Reviewers' },
      recommended_decision_l: { ar: 'القرار الموصى به', en: 'Recommended Decision' },
      ieee_report_l: { ar: 'تقرير IEEE', en: 'IEEE Report' },

      // ══ IEEE tab ══
      tab_papers: { ar: 'الأبحاث المقدَّمة', en: 'Submitted Papers' },
      tab_ieee: { ar: 'تقارير فحص IEEE', en: 'IEEE Check Reports' },
      ieee_search_ph: { ar: 'ابحث باسم الملف أو عنوان البحث...', en: 'Search by filename or paper title...' },
      ieee_loading: { ar: 'جارٍ تحميل التقارير...', en: 'Loading reports...' },
      ieee_error: { ar: 'خطأ في تحميل تقارير IEEE', en: 'Failed to load IEEE reports' },
      ieee_empty: { ar: 'لا توجد تقارير', en: 'No reports found' },
      ieee_empty_sub: { ar: 'لسا ما في تقارير فحص IEEE مضافة', en: 'No IEEE check reports yet' },
      ieee_details: { ar: 'تفاصيل تقرير IEEE', en: 'IEEE Report Details' },
      ieee_filename: { ar: 'اسم الملف', en: 'File Name' },
      ieee_paper_title: { ar: 'عنوان البحث', en: 'Paper Title' },
      ieee_lang: { ar: 'اللغة المكتشفة', en: 'Detected Language' },
      ieee_pages: { ar: 'عدد الصفحات', en: 'Total Pages' },
      ieee_created: { ar: 'تاريخ الإنشاء', en: 'Created At' },
      overall_score: { ar: 'الدرجة الكلية', en: 'Overall Score' },
      citation_match: { ar: 'تطابق الاستشهادات', en: 'Citation Matching' },
      format_score_l: { ar: 'درجة الفورمات', en: 'Format Score' },
      crossref_score_l: { ar: 'درجة CrossRef', en: 'CrossRef Score' },
      crossref_checked_l: { ar: 'مراجع تم فحصها بـ CrossRef', en: 'CrossRef Checked' },
      crossref_verified_l: { ar: 'مراجع تم التحقق منها', en: 'CrossRef Verified' },
      missing_cit: { ar: 'استشهادات ناقصة', en: 'Missing Citations' },
      unused_ref: { ar: 'مراجع غير مستخدمة', en: 'Unused References' },
      total_cit: { ar: 'إجمالي الاستشهادات', en: 'Total Citations' },
      total_ref: { ar: 'إجمالي المراجع', en: 'Total References' },
      ieee_summary: { ar: 'ملخص التقرير', en: 'Report Summary' },
      recommendations_l: { ar: 'التوصيات', en: 'Recommendations' },
      references_l: { ar: 'قائمة المراجع', en: 'References List' },
      ieee_fail: { ar: 'فشل تحميل تفاصيل التقرير، حاول مرة أخرى', en: 'Failed to load report details, please try again' },
      ieee_check_l: { ar: 'فحص IEEE', en: 'IEEE Check' },
      ieee_check_btn: { ar: 'تشغيل فحص IEEE', en: 'Run IEEE Check' },
      ieee_check_fail: { ar: 'فشل تشغيل فحص IEEE، حاول مرة أخرى', en: 'Failed to run IEEE check, please try again' },
      ieee_check_no_pdf: { ar: 'يجب إرفاق ملف PDF بالبحث لتشغيل هذا الفحص', en: 'A PDF must be attached to this paper before running this check' },

      // ══ Claim-Evidence tab (تحليل الادعاءات والأدلة) ══
      tab_claims: { ar: 'تحليل الادعاءات والأدلة', en: 'Claim-Evidence Analysis' },
      claim_search_ph: { ar: 'ابحث باسم الملف أو عنوان البحث...', en: 'Search by filename or paper title...' },
      claim_loading: { ar: 'جارٍ تحميل التحاليل...', en: 'Loading analyses...' },
      claim_error: { ar: 'خطأ في تحميل تحاليل الادعاءات والأدلة', en: 'Failed to load claim-evidence analyses' },
      claim_empty: { ar: 'لا توجد تحاليل', en: 'No analyses found' },
      claim_empty_sub: { ar: 'لسا ما في تحاليل ادعاءات وأدلة مضافة', en: 'No claim-evidence analyses yet' },
      claim_details: { ar: 'تفاصيل تحليل الادعاءات والأدلة', en: 'Claim-Evidence Analysis Details' },
      claim_check_l: { ar: 'تحليل الادعاءات والأدلة', en: 'Claim-Evidence Analysis' },
      claim_check_btn: { ar: 'تشغيل تحليل الادعاءات والأدلة', en: 'Run Claim-Evidence Analysis' },
      claim_check_fail: { ar: 'فشل تشغيل التحليل، حاول مرة أخرى', en: 'Failed to run analysis, please try again' },
      claim_check_no_pdf: { ar: 'يجب إرفاق ملف PDF بالبحث لتشغيل هذا الفحص', en: 'A PDF must be attached to this paper before running this check' },
      claims_count_l: { ar: 'عدد الادعاءات', en: 'Claims Count' },
      evidence_count_l: { ar: 'عدد الأدلة', en: 'Evidence Count' },
      neutral_count_l: { ar: 'عدد المحايدة', en: 'Neutral Count' },
      edges_count_l: { ar: 'عدد الروابط', en: 'Edges Count' },
      similarity_threshold_l: { ar: 'حد التشابه', en: 'Similarity Threshold' },
      top_claims_count_l: { ar: 'عدد أهم الادعاءات', en: 'Top Claims Count' },
      top_claims_l: { ar: 'أهم الادعاءات', en: 'Top Claims' },
      source_excerpt_l: { ar: 'مقتطف من المصدر', en: 'Source Excerpt' },
      claim_summary_l: { ar: 'ملخص التحليل', en: 'Analysis Summary' },
      processing_time_l: { ar: 'زمن المعالجة (ثانية)', en: 'Processing Time (s)' },
      claim_created: { ar: 'تاريخ الإنشاء', en: 'Created At' },
      claim_fail: { ar: 'فشل تحميل تفاصيل التحليل، حاول مرة أخرى', en: 'Failed to load analysis details, please try again' },
      analysis_results_l: { ar: 'نتائج التحليل', en: 'Analysis Results' },
      claim_status_pending_title: { ar: 'التحليل قيد المعالجة', en: 'Analysis in progress' },
      claim_status_pending_sub: { ar: 'الخدمة عم تشتغل على الملف حالياً، رجاءً حاول تحديث النتيجة بعد شوي.', en: 'The file is currently being processed. Please check back shortly.' },
      claim_status_failed_title: { ar: 'فشل تحليل الملف', en: 'File analysis failed' },
      claim_status_failed_sub: { ar: 'صار في مشكلة تقنية أثناء تشغيل التحليل على هالملف. جرّب ترفع الملف من جديد، وإذا استمرت المشكلة بلّغ فريق التطوير.', en: 'A technical issue occurred while analyzing this file. Try re-uploading it, and contact the dev team if the issue persists.' },
      claim_status_done_title: { ar: 'التحليل مكتمل', en: 'Analysis complete' },
      claim_tech_details: { ar: 'تفاصيل تقنية (للمطوّرين)', en: 'Technical details (for developers)' },
      no_claims_summary: { ar: 'لا يوجد ملخص لهالتحليل', en: 'No summary for this analysis' },

      // ══ ✅ جديد: درجة جودة الميتاداتا (metadata-score) ══
      metadata_score_l: { ar: 'درجة جودة الميتاداتا', en: 'Metadata Quality Score' },
      metadata_score_btn: { ar: 'عرض درجة جودة الميتاداتا', en: 'Show Metadata Score' },
      metadata_score_fail: { ar: 'فشل تحميل درجة جودة الميتاداتا، حاول مرة أخرى', en: 'Failed to load metadata score, please try again' },
      metadata_overall_l: { ar: 'الدرجة الكلية', en: 'Overall Score' },
      metadata_status_l: { ar: 'الحالة', en: 'Status' },
      metadata_breakdown_l: { ar: 'تفاصيل الدرجة حسب البند', en: 'Score Breakdown' },
      metadata_weight_l: { ar: 'الوزن', en: 'Weight' },
      metadata_no_recommendations: { ar: 'لا توجد ملاحظات، الميتاداتا بحالة جيدة', en: 'No notes — metadata looks good' },
    };
    return (map[key]?.[lang]) ?? (map[key]) ?? key;
  };

  /* ── عرض موحّد لنتيجة تحليل الادعاءات والأدلة حسب الـ status (قيد المعالجة / فشل / نجح) ──
     مستخدم بمكانين: بانل تفاصيل البحث (نتيجة فورية بعد السبمت) وبانل تفاصيل التحليل (من القائمة) */
  function renderClaimAnalysisResult(data) {
    if (!data) return null;

    const isFailed = data.status === 'failed';
    const isDone = data.status === 'completed' || data.status === 'success' || data.status === 'done';
    const isPending = !isFailed && !isDone; // ← يغطي pending / processing / أي قيمة غير معروفة بعد

    if (isPending) {
      return (
        <div className="no-notes-msg" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>⏳</span>
          <div>
            <div style={{ fontWeight: 600 }}>{t('claim_status_pending_title')}</div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{t('claim_status_pending_sub')}</div>
          </div>
        </div>
      );
    }

    if (isFailed) {
      return (
        <div className="no-notes-msg" style={{ borderColor: '#EF4444', color: '#EF4444', display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{t('claim_status_failed_title')}</div>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>{t('claim_status_failed_sub')}</div>
            {data.error_message && (
              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: 'pointer', fontSize: 11, opacity: 0.75, color: 'inherit' }}>
                  {t('claim_tech_details')}
                </summary>
                <div style={{ fontSize: 11, marginTop: 6, direction: 'ltr', textAlign: 'left', opacity: 0.75, wordBreak: 'break-word', fontFamily: 'monospace' }}>
                  {data.error_message}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    // ── نجح التحليل: نعرض النتيجة فوراً ──
    return (
      <>
        <div className="no-notes-msg" style={{ borderColor: 'var(--ac2)', color: 'var(--ac2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>✅</span>
          <div style={{ fontWeight: 600 }}>{t('claim_status_done_title')}</div>
        </div>

        <div className="dp-info-grid" style={{ marginTop: 12 }}>
          <div className="dp-info-cell">
            <div className="dp-info-label">{t('claims_count_l')}</div>
            <div className="dp-info-val">{data.claims_count}</div>
          </div>
          <div className="dp-info-cell">
            <div className="dp-info-label">{t('evidence_count_l')}</div>
            <div className="dp-info-val">{data.evidence_count}</div>
          </div>
          <div className="dp-info-cell">
            <div className="dp-info-label">{t('neutral_count_l')}</div>
            <div className="dp-info-val">{data.neutral_count}</div>
          </div>
          <div className="dp-info-cell">
            <div className="dp-info-label">{t('edges_count_l')}</div>
            <div className="dp-info-val">{data.edges_count}</div>
          </div>
          <div className="dp-info-cell">
            <div className="dp-info-label">{t('similarity_threshold_l')}</div>
            <div className="dp-info-val">{data.similarity_threshold}</div>
          </div>
          <div className="dp-info-cell">
            <div className="dp-info-label">{t('top_claims_count_l')}</div>
            <div className="dp-info-val">{data.top_claims_count}</div>
          </div>
        </div>

        <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('claim_summary_l')}</div>
        <div className="dp-abstract">{data.summary || t('no_claims_summary')}</div>

        {data.source_excerpt && (
          <>
            <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('source_excerpt_l')}</div>
            <div className="dp-abstract">{data.source_excerpt}</div>
          </>
        )}

        {data.top_claims?.length > 0 && (
          <>
            <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('top_claims_l')}</div>
            <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 13, lineHeight: 1.8 }}>
              {data.top_claims.map((c, i) => (
                <li key={i}>{typeof c === 'string' ? c : JSON.stringify(c)}</li>
              ))}
            </ul>
          </>
        )}
      </>
    );
  }

  /* ── ✅ جديد: عرض نتيجة درجة جودة الميتاداتا (title/abstract/keywords/author_info...الخ) ──
     الشكل: درجة كلية بارزة + حالة + تفصيل كل بند (label/score/weight/message) + توصيات */
  function renderMetadataScoreResult(data) {
    if (!data) return null;

    const overall = data.overall_score ?? 0;

    return (
      <>
        {/* الدرجة الكلية + الحالة */}
        <div
          className="no-notes-msg"
          style={{
            borderColor: scoreColor(overall),
            color: scoreColor(overall),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>{overall}%</span>
            <span style={{ fontSize: 12, opacity: 0.85 }}>{t('metadata_overall_l')}</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600 }}>
            {t('metadata_status_l')}: {data.status_display || data.status}
          </span>
        </div>

        {/* تفصيل كل بند */}
        {data.breakdown?.length > 0 && (
          <>
            <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('metadata_breakdown_l')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.breakdown.map((b, i) => (
                <div key={b.dimension ?? i} className="dp-info-cell" style={{ display: 'flex', flexDirection: 'column', gap: 4, textAlign: lang === 'ar' ? 'right' : 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{b.label}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, opacity: 0.6 }}>{t('metadata_weight_l')}: {b.weight}</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: scoreColor(b.score) }}>{b.score}%</span>
                    </span>
                  </div>
                  {b.message && (
                    <div style={{ fontSize: 12, opacity: 0.75 }}>{b.message}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* التوصيات */}
        <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('recommendations_l')}</div>
        {data.recommendations?.length > 0 ? (
          <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 13, lineHeight: 1.8 }}>
            {data.recommendations.map((rec, i) => (
              <li key={i}>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</li>
            ))}
          </ul>
        ) : (
          <div className="no-notes-msg">{t('metadata_no_recommendations')}</div>
        )}
      </>
    );
  }

  const footerData = {
    brand: lang === 'ar'
      ? 'مجلة رقمية أكاديمية تسلط الضوء على أبحاث الطلبة وإنجازاتهم في جامعة الشام الخاصة.'
      : 'A digital academic journal spotlighting student research at Al-Sham Private University.',
    cols: [
      {
        title: lang === 'ar' ? 'الأبحاث' : 'Research',
        links: [
          { label: lang === 'ar' ? 'آخر الإضافات' : 'Latest', path: '/' },
          { label: lang === 'ar' ? 'الأكثر تقييماً' : 'Top Rated', path: '/research_review' },
          { label: lang === 'ar' ? 'حسب التخصص' : 'By Discipline', path: '/research_review' },
          { label: lang === 'ar' ? 'الأرشيف' : 'Archive', path: '/research_review' },
        ],
      },
      {
        title: lang === 'ar' ? 'للطلبة' : 'Students',
        links: [
          { label: lang === 'ar' ? 'تقديم بحث' : 'Submit Paper', path: '/submit' },
          { label: lang === 'ar' ? 'إرشادات النشر' : 'Guidelines', path: '/submit' },
          { label: lang === 'ar' ? 'فحص التشابه' : 'Similarity Check', path: '/EditorAssistant' },
        ],
      },
      {
        title: lang === 'ar' ? 'للأساتذة' : 'Faculty',
        links: [
          { label: lang === 'ar' ? 'لوحة المراجعة' : 'Review Panel', path: '/EditorAssistant' },
          { label: lang === 'ar' ? 'تقارير النزاهة' : 'Integrity Reports', path: '/EditorAssistant' },
          { label: lang === 'ar' ? 'إدارة اللجنة' : 'Committee', path: '/Editor' },
        ],
      },
    ],
    copy: lang === 'ar' ? '© 2025 ASPU Insight — جامعة الشام الخاصة' : '© 2025 ASPU Insight — Al-Sham Private University',
    sub: lang === 'ar' ? 'مشروع تخرج · 2025–2026' : 'Graduation Project · 2025–2026',
  };

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

      {/* ══ HERO ══ */}
      <section className="ea-hero">
        <div className="hero-grid" />
        <div className="orb o1" /><div className="orb o2" />
        <div className="hero-wm">{lang === 'ar' ? 'مراجعة' : 'Review'}</div>

        <div className="hero-inner">
          <div className="role-badge">
            {t('role')}
            <span className="badge-active">● ACTIVE</span>
          </div>
          <h1 className="hero-title">
            {lang === 'ar' ? (
              <>{t('welcome_ar')} <span className="ht-gold">{user?.full_name || user?.email || 'محمد'}.</span><br />
                <span className="ht-blue">{statPending} {lang === 'ar' ? 'بحثاً' : 'papers'}</span> {t('papers_await_ar')}</>
            ) : (
              <>{t('welcome_en')} <span className="ht-gold">{user?.full_name || user?.email || 'Mohammad'}.</span><br />
                <span className="ht-blue">{statPending} papers</span> {t('papers_await_en')}</>
            )}
          </h1>
          <p className="hero-sub">{lang === 'ar' ? t('sub_ar') : t('sub_en')}</p>
          <div className="hero-stats">
            <div className="hstat">
              <span className="hstat-n">{papers.length}</span>
              <span className="hstat-l">{t('total')}</span>
            </div>
            <div className="hstat">
              <span className="hstat-n">{statPending}</span>
              <span className="hstat-l">{t('pending')}</span>
            </div>
            <div className="hstat">
              <span className="hstat-n">{statNoted}</span>
              <span className="hstat-l">{t('noted')}</span>
            </div>
          </div>
        </div>
      </section>

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
          <>
            <div className="filter-bar">
              {[
                { key: 'all', label: t('all') },
                { key: 'pending', label: t('pending') },
                { key: 'noted', label: t('noted') },
              ].map(f => (
                <button
                  key={f.key}
                  className={`filter-pill ${activeFilter === f.key ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f.key)}
                >{f.label}</button>
              ))}
              <div className="filter-space" />
              <div className="search-mini">
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="6.5" cy="6.5" r="5" /><line x1="10.5" y1="10.5" x2="14" y2="14" />
                </svg>
                <input
                  type="text"
                  placeholder={t('search_ph')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="papers-grid">
              {/* Loading state */}
              {loading && (
                <div className="empty-state">
                  <div className="empty-ico">⏳</div>
                  <div className="empty-title">{t('loading')}</div>
                </div>
              )}

              {/* Error state */}
              {!loading && error && (
                <div className="empty-state">
                  <div className="empty-ico">⚠️</div>
                  <div className="empty-title">{t('error')}</div>
                  <p className="empty-sub">{error.message}</p>
                </div>
              )}

              {/* Empty results */}
              {!loading && !error && filtered.length === 0 && (
                <div className="empty-state">
                  <div className="empty-ico">🔍</div>
                  <div className="empty-title">{t('no_results')}</div>
                  <p className="empty-sub">{t('no_sub')}</p>
                </div>
              )}

              {/* Papers */}
              {!loading && !error && filtered.map((p, i) => {
                const s = getStatus(p);
                return (
                  <div
                    key={p.id}
                    className="paper-card"
                    style={{ animationDelay: `${i * 0.05}s` }}
                    onClick={() => openDetail(p.id)}
                  >
                    <div className="pc-meta">
                      <span className="pc-dept">
                        {p.review_blindness_type === 'double_blind'
                          ? (lang === 'ar' ? 'تحكيم مزدوج' : 'Double Blind')
                          : (lang === 'ar' ? 'تحكيم فردي' : 'Single Blind')}
                      </span>
                      <span className="pc-date">
                        {p.is_paid_open_access
                          ? (lang === 'ar' ? '🔓 مفتوح' : '🔓 Open Access')
                          : (lang === 'ar' ? '🔒 مقيّد' : '🔒 Restricted')}
                      </span>
                    </div>

                    <div className="pc-num">RES-{String(p.id).padStart(3, '0')}</div>
                    <h3 className="pc-title">{p.title}</h3>

                    <div className="pc-author">
                      <div className="pc-author-dot" />
                      {p.author_name}
                    </div>

                    <p className="pc-summary">{p.abstract}</p>

                    <div className="pc-foot">
                      <span className={`pc-status ${s.cls}`}>
                        <span className="pc-status-dot" />
                        {lang === 'ar' ? s.ar : s.en}
                      </span>
                      <span className="pc-arrow">
                        <svg width="12" height="12" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                          <path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : activeView === 'ieee' ? (
          <>
            <div className="filter-bar">
              <div className="filter-space" />
              <div className="search-mini">
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="6.5" cy="6.5" r="5" /><line x1="10.5" y1="10.5" x2="14" y2="14" />
                </svg>
                <input
                  type="text"
                  placeholder={t('ieee_search_ph')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="papers-grid">
              {loadingIeeeReports && (
                <div className="empty-state">
                  <div className="empty-ico">⏳</div>
                  <div className="empty-title">{t('ieee_loading')}</div>
                </div>
              )}

              {!loadingIeeeReports && ieeeReportsError && (
                <div className="empty-state">
                  <div className="empty-ico">⚠️</div>
                  <div className="empty-title">{t('ieee_error')}</div>
                  <p className="empty-sub">{ieeeReportsError.message}</p>
                </div>
              )}

              {!loadingIeeeReports && !ieeeReportsError && filteredIeee.length === 0 && (
                <div className="empty-state">
                  <div className="empty-ico">📄</div>
                  <div className="empty-title">{t('ieee_empty')}</div>
                  <p className="empty-sub">{t('ieee_empty_sub')}</p>
                </div>
              )}

              {!loadingIeeeReports && !ieeeReportsError && filteredIeee.map((r, i) => {
                const cls = IEEE_STATUS_CLS[r.status] ?? 'status-pending';
                return (
                  <div
                    key={r.id}
                    className="paper-card"
                    style={{ animationDelay: `${i * 0.05}s`, position: 'relative' }}
                    onClick={() => openIeeeDetail(r.id)}
                  >
                    <button
                      className="pc-delete-btn"
                      onClick={(e) => handleDeleteIeeeReport(e, r.id)}
                      disabled={deletingIeeeId === r.id}
                      title={lang === 'ar' ? 'حذف التقرير' : 'Delete report'}
                    >
                      {deletingIeeeId === r.id ? '⏳' : '✕'}
                    </button>

                    <div className="pc-meta">
                      <span className="pc-dept">
                        {r.detected_language ? r.detected_language.toUpperCase() : (lang === 'ar' ? 'غير محدد' : 'N/A')}
                      </span>
                      <span className="pc-date">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en') : ''}
                      </span>
                    </div>

                    <div className="pc-num">IEEE-{String(r.id).padStart(3, '0')}</div>
                    <h3 className="pc-title">{r.paper_title || r.original_filename}</h3>

                    <div className="pc-author">
                      <div className="pc-author-dot" />
                      {r.original_filename}
                    </div>

                    <p className="pc-summary">
                      {r.summary || (lang === 'ar' ? 'لا يوجد ملخص بعد' : 'No summary yet')}
                    </p>

                    <div className="pc-foot">
                      <span className={`pc-status ${cls}`}>
                        <span className="pc-status-dot" />
                        {r.status_display || r.status}
                      </span>
                      <span className="pc-arrow">
                        <svg width="12" height="12" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                          <path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="filter-bar">
              <div className="filter-space" />
              <div className="search-mini">
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="6.5" cy="6.5" r="5" /><line x1="10.5" y1="10.5" x2="14" y2="14" />
                </svg>
                <input
                  type="text"
                  placeholder={t('claim_search_ph')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="papers-grid">
              {loadingClaimReports && (
                <div className="empty-state">
                  <div className="empty-ico">⏳</div>
                  <div className="empty-title">{t('claim_loading')}</div>
                </div>
              )}

              {!loadingClaimReports && claimReportsError && (
                <div className="empty-state">
                  <div className="empty-ico">⚠️</div>
                  <div className="empty-title">{t('claim_error')}</div>
                  <p className="empty-sub">{claimReportsError.message}</p>
                </div>
              )}

              {!loadingClaimReports && !claimReportsError && filteredClaims.length === 0 && (
                <div className="empty-state">
                  <div className="empty-ico">🧩</div>
                  <div className="empty-title">{t('claim_empty')}</div>
                  <p className="empty-sub">{t('claim_empty_sub')}</p>
                </div>
              )}

              {!loadingClaimReports && !claimReportsError && filteredClaims.map((r, i) => {
                const cls = CLAIM_STATUS_CLS[r.status] ?? 'status-pending';
                return (
                  <div
                    key={r.id}
                    className="paper-card"
                    style={{ animationDelay: `${i * 0.05}s`, position: 'relative' }}
                    onClick={() => openClaimDetail(r.id)}
                  >
                    <button
                      className="pc-delete-btn"
                      onClick={(e) => handleDeleteClaimReport(e, r.id)}
                      disabled={deletingClaimId === r.id}
                      title={lang === 'ar' ? 'حذف التحليل' : 'Delete analysis'}
                    >
                      {deletingClaimId === r.id ? '⏳' : '✕'}
                    </button>

                    <div className="pc-meta">
                      <span className="pc-dept">
                        {r.detected_language ? r.detected_language.toUpperCase() : (lang === 'ar' ? 'غير محدد' : 'N/A')}
                      </span>
                      <span className="pc-date">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en') : ''}
                      </span>
                    </div>

                    <div className="pc-num">CLM-{String(r.id).padStart(3, '0')}</div>
                    <h3 className="pc-title">{r.paper_title || r.original_filename}</h3>

                    <div className="pc-author">
                      <div className="pc-author-dot" />
                      {r.original_filename}
                    </div>

                    <p className="pc-summary">
                      {r.summary || (lang === 'ar' ? 'لا يوجد ملخص بعد' : 'No summary yet')}
                    </p>

                    <div className="pc-foot">
                      <span className={`pc-status ${cls}`}>
                        <span className="pc-status-dot" />
                        {r.status_display || r.status}
                      </span>
                      <span className="pc-arrow">
                        <svg width="12" height="12" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                          <path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Footer isAr={lang === 'ar'} footer={footerData} Logo={Logo} />

      {/* ══ DETAIL PANEL (Paper) ══ */}
      <div className={`detail-overlay ${detailOpen ? 'open' : ''}`} onClick={closeDetail} />
      <div className={`detail-panel ${detailOpen ? 'open' : ''}`}>
        {activePaper && (
          <>
            <div className="dp-header">
              <button className="dp-back-btn" onClick={closeDetail}>
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                  <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="dp-header-title">{t('details')}</span>
              <span className="dp-dept-tag">
                {activePaper.review_blindness_type === 'double_blind'
                  ? (lang === 'ar' ? 'تحكيم مزدوج' : 'Double Blind')
                  : (lang === 'ar' ? 'تحكيم فردي' : 'Single Blind')}
              </span>
            </div>

            <div className="dp-body">
              <h2 className="dp-title">{activePaper.title}</h2>

              <div className="dp-author-row">
                <div className="dp-avatar">
                  {activePaper.author_name?.charAt(0).toUpperCase()}
                </div>
                <div className="dp-author-info">
                  <div className="dp-author-name">{activePaper.author_name}</div>
                  <div className="dp-author-meta">
                    {activePaper.review_blindness_type === 'double_blind'
                      ? (lang === 'ar' ? 'تحكيم مزدوج' : 'Double Blind Review')
                      : (lang === 'ar' ? 'تحكيم فردي' : 'Single Blind Review')}
                  </div>
                </div>
              </div>

              <div className="dp-info-grid">
                {[
                  { label: t('ref_id'), val: `RES-${String(activePaper.id).padStart(3, '0')}` },
                  { label: t('status_l'), val: lang === 'ar' ? getStatus(activePaper).ar : getStatus(activePaper).en, color: activePaper.is_reviewed_by_assistant ? 'var(--ac2)' : '#F59E0B' },
                  { label: t('plagiarism'), val: activePaper.plagiarism_score != null ? `${activePaper.plagiarism_score}%` : (lang === 'ar' ? 'غير محدد' : 'N/A') },
                  { label: t('open_access'), val: activePaper.is_paid_open_access ? t('yes') : t('no') },
                ].map((cell, i) => (
                  <div className="dp-info-cell" key={i}>
                    <div className="dp-info-label">{cell.label}</div>
                    <div className="dp-info-val" style={cell.color ? { color: cell.color } : {}}>{cell.val}</div>
                  </div>
                ))}
              </div>

              {/* AI Keywords (تابع البحث نفسه إن وُجدت) */}
              {activePaper.ai_keywords?.length > 0 && (
                <>
                  <div className="dp-sec-label">{t('keywords')}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    {activePaper.ai_keywords.map((kw, i) => (
                      <span key={i} style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        color: 'var(--ac)',
                      }}>{kw}</span>
                    ))}
                  </div>
                </>
              )}

              <div className="dp-sec-label">{t('abstract')}</div>
              <div className="dp-abstract">{activePaper.abstract}</div>

              {/* Plagiarism Report */}
              <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('plag_report_l')}</div>
              {!plagiarismData ? (
                <button className="add-note-btn" onClick={loadPlagiarismReport} disabled={loadingPlagiarism}>
                  {loadingPlagiarism ? t('saving') : t('plag_load_btn')}
                </button>
              ) : plagiarismData.status === 'pending' ? (
                <div className="no-notes-msg">{t('plag_pending')}</div>
              ) : (
                <div className="dp-info-grid">
                  <div className="dp-info-cell">
                    <div className="dp-info-label">{t('plag_total')}</div>
                    <div className="dp-info-val">{plagiarismData.total_similarity_score}%</div>
                  </div>
                  <div className="dp-info-cell">
                    <div className="dp-info-label">{t('plag_internal')}</div>
                    <div className="dp-info-val">{plagiarismData.internal_similarity_score}%</div>
                  </div>
                  <div className="dp-info-cell">
                    <div className="dp-info-label">{t('plag_external')}</div>
                    <div className="dp-info-val">{plagiarismData.external_similarity_score}%</div>
                  </div>
                  <div className="dp-info-cell">
                    <div className="dp-info-label">{t('plag_human')}</div>
                    <div className="dp-info-val">{plagiarismData.requires_human_review ? t('yes') : t('no')}</div>
                  </div>
                </div>
              )}
              {plagiarismError && (
                <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                  {t('plag_fail')}
                </p>
              )}

              {/* Keyword Suggestions */}
              <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('kw_l')}</div>
              {!keywordsData ? (
                <button className="add-note-btn" onClick={loadKeywordsSuggestion} disabled={loadingKeywords}>
                  {loadingKeywords ? t('saving') : t('kw_load_btn')}
                </button>
              ) : keywordsData.keywords?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  {keywordsData.keywords.map((kw, i) => (
                    <span key={i} style={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '20px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      color: 'var(--ac)',
                    }}>{kw}</span>
                  ))}
                </div>
              ) : (
                <div className="no-notes-msg">
                  {keywordsData.note || t('kw_none')}
                </div>
              )}
              {keywordsError && (
                <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                  {t('kw_fail')}
                </p>
              )}

              {/* ✅ جديد: Metadata Quality Score — جنب باقي الفحوصات (الانتحال/الكلمات المفتاحية/IEEE/الادعاءات والأدلة) */}
              <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('metadata_score_l')}</div>
              {!metadataScoreData ? (
                <button
                  className="add-note-btn"
                  onClick={loadMetadataScore}
                  disabled={loadingMetadataScore}
                >
                  {loadingMetadataScore ? t('saving') : t('metadata_score_btn')}
                </button>
              ) : (
                renderMetadataScoreResult(metadataScoreData)
              )}
              {metadataScoreError && (
                <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                  {t('metadata_score_fail')}
                </p>
              )}

              {/* IEEE Check */}
              <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('ieee_check_l')}</div>
              {!ieeeCheckData ? (
                <>
                  <button
                    className="add-note-btn"
                    onClick={runIeeeCheck}
                    disabled={loadingIeeeCheck || !activePaper.pdf_file}
                  >
                    {loadingIeeeCheck ? t('saving') : t('ieee_check_btn')}
                  </button>
                  {!activePaper.pdf_file && (
                    <p className="dp-hint-msg">{t('ieee_check_no_pdf')}</p>
                  )}
                </>
              ) : ieeeCheckData.status === 'error' ? (
                <div className="no-notes-msg" style={{ color: '#EF4444' }}>
                  {ieeeCheckData.summary || t('ieee_check_fail')}
                </div>
              ) : ieeeCheckData.status === 'pending' ? (
                <div className="no-notes-msg">{t('plag_pending')}</div>
              ) : (
                <div className="dp-info-grid">
                  <div className="dp-info-cell">
                    <div className="dp-info-label">{t('overall_score')}</div>
                    <div className="dp-info-val">{ieeeCheckData.overall_score}%</div>
                  </div>
                  <div className="dp-info-cell">
                    <div className="dp-info-label">{t('citation_match')}</div>
                    <div className="dp-info-val">{ieeeCheckData.citation_matching_score}%</div>
                  </div>
                  <div className="dp-info-cell">
                    <div className="dp-info-label">{t('format_score_l')}</div>
                    <div className="dp-info-val">{ieeeCheckData.format_score}%</div>
                  </div>
                  <div className="dp-info-cell">
                    <div className="dp-info-label">{t('crossref_score_l')}</div>
                    <div className="dp-info-val">{ieeeCheckData.crossref_score}%</div>
                  </div>
                </div>
              )}
              {ieeeCheckError && (
                <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                  {t('ieee_check_fail')}
                </p>
              )}

              {/* Claim-Evidence Analysis (تحليل الادعاءات والأدلة) — جنب إخواته IEEE / الانتحال / الكلمات المفتاحية */}
              <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('claim_check_l')}</div>
              {!claimAnalysisData ? (
                <button
                  className="add-note-btn"
                  onClick={runClaimAnalysis}
                  disabled={loadingClaimAnalysis || !activePaper.pdf_file}
                >
                  {loadingClaimAnalysis ? t('saving') : t('claim_check_btn')}
                </button>
              ) : (
                renderClaimAnalysisResult(claimAnalysisData)
              )}
              {!claimAnalysisData && !activePaper.pdf_file && (
                <p className="dp-hint-msg">{t('claim_check_no_pdf')}</p>
              )}
              {claimAnalysisError && (
                <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                  {t('claim_check_fail')}
                </p>
              )}

              {/* PDF File */}
              <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('file')}</div>
              {activePaper.pdf_file ? (
                <div className="dp-pdf-block">
                  <div className="dp-pdf-bar">
                    <div className="dp-pdf-ico">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--ac)" strokeWidth="1.8">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="dp-pdf-name">
                      {activePaper.pdf_file.split('/').pop()}
                    </span>
                    <button
                      type="button"
                      className="dp-pdf-dl"
                      onClick={handleDownloadPdf}
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                        <path d="M8 2v8M4 10l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t('download')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-notes-msg">{t('no_file')}</div>
              )}

              {/* Editor Report */}
              <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('notes_l')}</div>
              {!activePaper.is_reviewed_by_assistant ? (
                <div className="no-notes-msg">{t('no_notes')}</div>
              ) : reviewData ? (
                <>
                  <div className="dp-author-row">
                    <div className="dp-avatar">
                      {reviewData.assistant?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="dp-author-info">
                      <div className="dp-author-name">{reviewData.assistant?.full_name || t('assistant_l')}</div>
                      <div className="dp-author-meta">{reviewData.assistant?.email}</div>
                    </div>
                    {reviewData.decision && (
                      <span
                        className={`pc-status ${ASSISTANT_DECISION_MAP[reviewData.decision]?.cls || 'status-pending'}`}
                        style={{ marginInlineStart: 'auto' }}
                      >
                        <span className="pc-status-dot" />
                        {ASSISTANT_DECISION_MAP[reviewData.decision]
                          ? (lang === 'ar' ? ASSISTANT_DECISION_MAP[reviewData.decision].ar : ASSISTANT_DECISION_MAP[reviewData.decision].en)
                          : reviewData.decision}
                      </span>
                    )}
                  </div>

                  <div className="dp-info-grid">
                    {[
                      { label: t('format_ok_l'), val: reviewData.is_format_compliant ? t('yes') : t('no') },
                      { label: t('complete_l'), val: reviewData.is_complete ? t('yes') : t('no') },
                      {
                        label: t('reviewed_at_l'),
                        val: reviewData.reviewed_at
                          ? new Date(reviewData.reviewed_at).toLocaleString(lang === 'ar' ? 'ar' : 'en')
                          : '—',
                      },
                      ...(reviewData.recommended_decision ? [{
                        label: t('recommended_decision_l'),
                        val: ASSISTANT_DECISION_MAP[reviewData.recommended_decision]
                          ? (lang === 'ar' ? ASSISTANT_DECISION_MAP[reviewData.recommended_decision].ar : ASSISTANT_DECISION_MAP[reviewData.recommended_decision].en)
                          : reviewData.recommended_decision,
                      }] : []),
                    ].map((cell, i) => (
                      <div className="dp-info-cell" key={i}>
                        <div className="dp-info-label">{cell.label}</div>
                        <div className="dp-info-val">{cell.val}</div>
                      </div>
                    ))}
                  </div>

                  <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('assistant_notes_l')}</div>
                  <div className="dp-notes-wrap">
                    <div className="note-item">
                      <div className="note-body">{reviewData.notes || t('no_notes')}</div>
                    </div>
                  </div>

                  {reviewData.policy_notes && (
                    <>
                      <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('policy_notes_l')}</div>
                      <div className="dp-notes-wrap">
                        <div className="note-item">
                          <div className="note-body">{reviewData.policy_notes}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {reviewData.suggested_reviewers?.length > 0 && (
                    <>
                      <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('suggested_reviewers_l')}</div>
                      <div className="dp-notes-wrap">
                        {reviewData.suggested_reviewers.map((rev, i) => (
                          <div className="note-item" key={rev?.id ?? rev?.user_id ?? i}>
                            <div className="note-body">
                              {typeof rev === 'string'
                                ? rev
                                : (rev?.full_name ?? rev?.name ?? rev?.email ?? JSON.stringify(rev))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {reviewData.ieee_report && (
                    <>
                      <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('ieee_report_l')}</div>
                      <div className="dp-notes-wrap">
                        {typeof reviewData.ieee_report === 'object' ? (
                          <div className="dp-info-grid">
                            {Object.entries(reviewData.ieee_report)
                              .filter(([, v]) => v !== null && v !== undefined && v !== '')
                              .map(([k, v]) => (
                                <div className="dp-info-cell" key={k}>
                                  <div className="dp-info-label">{k.replace(/_/g, ' ')}</div>
                                  <div className="dp-info-val">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="note-item">
                            <div className="note-body">{String(reviewData.ieee_report)}</div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <button className="add-note-btn" onClick={loadReview} disabled={loadingReview}>
                  {loadingReview ? t('saving') : (lang === 'ar' ? 'عرض التقرير' : 'View Report')}
                </button>
              )}
              {reviewError && (
                <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                  {lang === 'ar' ? 'فشل تحميل التقرير، حاول مرة أخرى' : 'Failed to load report, please try again'}
                </p>
              )}

              {!activePaper.is_reviewed_by_assistant && !noteEditorOpen && (
                <button className="add-note-btn" onClick={() => { setNoteEditorOpen(true); setSaveError(null); }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="3" x2="8" y2="13" /><line x1="3" y1="8" x2="13" y2="8" />
                  </svg>
                  {t('add_note')}
                </button>
              )}

              {noteEditorOpen && (
                <div className="note-editor open">
                  <div className="dp-sec-label" style={{ marginTop: 4 }}>{t('decision_l')}</div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <button
                      type="button"
                      className={`filter-pill ${decision === 'APPROVE' ? 'active' : ''}`}
                      onClick={() => setDecision('APPROVE')}
                      disabled={savingNote}
                    >
                      {t('approve')}
                    </button>
                    <button
                      type="button"
                      className={`filter-pill ${decision === 'REJECT' ? 'active' : ''}`}
                      onClick={() => setDecision('REJECT')}
                      disabled={savingNote}
                    >
                      {t('reject')}
                    </button>
                  </div>

                  <textarea
                    className="note-textarea"
                    placeholder={t('note_ph')}
                    rows={4}
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    autoFocus
                    disabled={savingNote}
                  />

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={isFormatCompliant}
                      onChange={e => setIsFormatCompliant(e.target.checked)}
                      disabled={savingNote}
                    />
                    {t('format_ok_l')}
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={isComplete}
                      onChange={e => setIsComplete(e.target.checked)}
                      disabled={savingNote}
                    />
                    {t('complete_l')}
                  </label>

                  <div className="dp-sec-label" style={{ marginTop: 12 }}>{t('policy_notes_l')}</div>
                  <textarea
                    className="note-textarea"
                    placeholder={t('policy_ph')}
                    rows={2}
                    value={policyNotes}
                    onChange={e => setPolicyNotes(e.target.value)}
                    disabled={savingNote}
                  />

                  <div className="note-editor-btns">
                    <button
                      className="btn-cancel-note"
                      onClick={() => {
                        setNoteEditorOpen(false);
                        setNoteText('');
                        setDecision('APPROVE');
                        setIsFormatCompliant(true);
                        setIsComplete(true);
                        setPolicyNotes('');
                        setSaveError(null);
                      }}
                      disabled={savingNote}
                    >
                      {t('cancel')}
                    </button>
                    <button
                      className="btn-save-note"
                      onClick={saveNote}
                      disabled={savingNote || !noteText.trim()}
                    >
                      {savingNote ? t('saving') : t('save_note')}
                    </button>
                  </div>
                  {saveError && (
                    <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                      {t('save_fail')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ══ DETAIL PANEL (IEEE Report) ══ */}
      <div className={`detail-overlay ${ieeeDetailOpen ? 'open' : ''}`} onClick={closeIeeeDetail} />
      <div className={`detail-panel ${ieeeDetailOpen ? 'open' : ''}`}>
        {ieeeDetailOpen && (
          <>
            <div className="dp-header">
              <button className="dp-back-btn" onClick={closeIeeeDetail}>
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                  <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="dp-header-title">{t('ieee_details')}</span>
            </div>

            <div className="dp-body">
              {loadingIeeeDetail && (
                <div className="empty-state">
                  <div className="empty-ico">⏳</div>
                  <div className="empty-title">{t('ieee_loading')}</div>
                </div>
              )}

              {!loadingIeeeDetail && ieeeDetailError && (
                <div className="no-notes-msg" style={{ color: '#EF4444' }}>
                  {t('ieee_fail')}
                </div>
              )}

              {!loadingIeeeDetail && !ieeeDetailError && activeIeeeReport && (
                <>
                  <h2 className="dp-title">
                    {activeIeeeReport.paper_title || activeIeeeReport.original_filename}
                  </h2>

                  <div className="dp-info-grid">
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('ieee_filename')}</div>
                      <div className="dp-info-val">{activeIeeeReport.original_filename}</div>
                    </div>
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('status_l')}</div>
                      <div className="dp-info-val">{activeIeeeReport.status_display || activeIeeeReport.status}</div>
                    </div>
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('ieee_lang')}</div>
                      <div className="dp-info-val">{activeIeeeReport.detected_language || (lang === 'ar' ? 'غير محدد' : 'N/A')}</div>
                    </div>
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('ieee_pages')}</div>
                      <div className="dp-info-val">{activeIeeeReport.total_pages}</div>
                    </div>
                  </div>

                  {activeIeeeReport.status === 'pending' ? (
                    <div className="no-notes-msg" style={{ marginTop: 16 }}>
                      {activeIeeeReport.status_display || t('plag_pending')}
                    </div>
                  ) : activeIeeeReport.status === 'error' ? (
                    <div className="no-notes-msg" style={{ marginTop: 16, color: '#EF4444' }}>
                      {activeIeeeReport.summary || t('ieee_check_fail')}
                    </div>
                  ) : (
                    <>
                      <div className="dp-sec-label" style={{ marginTop: 20 }}>{lang === 'ar' ? 'نتائج الفحص' : 'Check Results'}</div>
                      <div className="dp-info-grid">
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('overall_score')}</div>
                          <div className="dp-info-val">{activeIeeeReport.overall_score}%</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('citation_match')}</div>
                          <div className="dp-info-val">{activeIeeeReport.citation_matching_score}%</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('format_score_l')}</div>
                          <div className="dp-info-val">{activeIeeeReport.format_score}%</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('crossref_score_l')}</div>
                          <div className="dp-info-val">{activeIeeeReport.crossref_score}%</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('total_cit')}</div>
                          <div className="dp-info-val">{activeIeeeReport.total_citations_in_text}</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('total_ref')}</div>
                          <div className="dp-info-val">{activeIeeeReport.total_references}</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('missing_cit')}</div>
                          <div className="dp-info-val">{activeIeeeReport.missing_citations_count}</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('unused_ref')}</div>
                          <div className="dp-info-val">{activeIeeeReport.unused_references_count}</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('crossref_checked_l')}</div>
                          <div className="dp-info-val">{activeIeeeReport.crossref_checked}</div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('crossref_verified_l')}</div>
                          <div className="dp-info-val">{activeIeeeReport.crossref_verified}</div>
                        </div>
                      </div>

                      {activeIeeeReport.summary && (
                        <>
                          <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('ieee_summary')}</div>
                          <div className="dp-abstract">{activeIeeeReport.summary}</div>
                        </>
                      )}

                      {activeIeeeReport.recommendations?.length > 0 && (
                        <>
                          <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('recommendations_l')}</div>
                          <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 13, lineHeight: 1.8 }}>
                            {activeIeeeReport.recommendations.map((rec, i) => (
                              <li key={i}>{typeof rec === 'string' ? rec : JSON.stringify(rec)}</li>
                            ))}
                          </ul>
                        </>
                      )}

                      {activeIeeeReport.references_list?.length > 0 && (
                        <>
                          <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('references_l')}</div>
                          <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 13, lineHeight: 1.8 }}>
                            {activeIeeeReport.references_list.map((ref, i) => (
                              <li key={i}>{typeof ref === 'string' ? ref : JSON.stringify(ref)}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </>
                  )}

                  <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('ieee_created')}</div>
                  <div className="dp-abstract">
                    {activeIeeeReport.created_at ? new Date(activeIeeeReport.created_at).toLocaleString(lang === 'ar' ? 'ar' : 'en') : '—'}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ══ DETAIL PANEL (Claim-Evidence Report) ══ */}
      <div className={`detail-overlay ${claimDetailOpen ? 'open' : ''}`} onClick={closeClaimDetail} />
      <div className={`detail-panel ${claimDetailOpen ? 'open' : ''}`}>
        {claimDetailOpen && (
          <>
            <div className="dp-header">
              <button className="dp-back-btn" onClick={closeClaimDetail}>
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                  <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span className="dp-header-title">{t('claim_details')}</span>
            </div>

            <div className="dp-body">
              {loadingClaimDetail && (
                <div className="empty-state">
                  <div className="empty-ico">⏳</div>
                  <div className="empty-title">{t('claim_loading')}</div>
                </div>
              )}

              {!loadingClaimDetail && claimDetailError && (
                <div className="no-notes-msg" style={{ color: '#EF4444' }}>
                  {t('claim_fail')}
                </div>
              )}

              {!loadingClaimDetail && !claimDetailError && activeClaimReport && (
                <>
                  <h2 className="dp-title">
                    {activeClaimReport.paper_title || activeClaimReport.original_filename}
                  </h2>

                  <div className="dp-info-grid">
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('ieee_filename')}</div>
                      <div className="dp-info-val">{activeClaimReport.original_filename}</div>
                    </div>
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('status_l')}</div>
                      <div className="dp-info-val">{activeClaimReport.status_display || activeClaimReport.status}</div>
                    </div>
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('ieee_lang')}</div>
                      <div className="dp-info-val">{activeClaimReport.detected_language || (lang === 'ar' ? 'غير محدد' : 'N/A')}</div>
                    </div>
                    <div className="dp-info-cell">
                      <div className="dp-info-label">{t('processing_time_l')}</div>
                      <div className="dp-info-val">{activeClaimReport.processing_time_seconds ?? '—'}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    {renderClaimAnalysisResult(activeClaimReport)}
                  </div>

                  <div className="dp-sec-label" style={{ marginTop: 16 }}>{t('claim_created')}</div>
                  <div className="dp-abstract">
                    {activeClaimReport.created_at ? new Date(activeClaimReport.created_at).toLocaleString(lang === 'ar' ? 'ar' : 'en') : '—'}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}