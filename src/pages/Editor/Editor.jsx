import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  FiX,
  FiMenu,
  FiSearch,
  FiChevronRight,
  FiChevronLeft,
  FiFileText,
  FiDownload,
  FiMoon,
  FiSun,
  FiLogOut,
  FiCheckCircle,
  FiAlertTriangle,
  FiLoader,
  FiLock,
  FiUnlock,
  FiUsers,
  FiUpload,
  FiEye,
  FiEdit3,
  FiCheck,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import {
  getPapers,
  getEditorReviewInitial,
  submitEditorReviewInitial,
  getAvailableReviewers,
  createCommittee,
  getCommitteeStatus,
  publishPaper, // ⚠ لازم تكون مضافة بـ ../../api/research.js — شوف الملاحظة تحت
  getEditorReviewFinal,
  submitEditorReviewFinal,
  getAssistantReview,
} from "../../api/research";
import { logout } from "../../api/auth";
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

/* ══════════════════
   خريطة قرار مساعد المحرر (assistant-review.decision) — APPROVE | REJECT
   ⚠ منفصلة عن DECISION_OPTIONS (يلي بيغطي قرار المحرر الأولي فقط)
══════════════════ */
const ASSISTANT_DECISION_MAP = {
  APPROVE: { ar: 'قبول', en: 'Approve', cls: 'status-done' },
  REJECT: { ar: 'رفض', en: 'Reject', cls: 'status-rejected' },
};

/* ✅ FIX #2: كان عم يتشيك على paper.assistant_report (حقل غير موجود بالـ API)
   بدل paper.assistant_editor_report (الحقل الحقيقي يلي عم يرجّعه الباك) */
const getStatus = (paper) => {
  // إذا راجعه مساعد المحرر → noted
  if (paper.is_reviewed_by_assistant || paper.assistant_editor_report) return STATUS_MAP['noted'];
  return STATUS_MAP[paper.status] ?? { ar: paper.status, en: paper.status, cls: 'status-pending' };
};

const PREV_NAMES = {
  ar: ['الرئيسية', 'الأبحاث', 'الباحثون', 'النزاهة', 'تواصل معنا'],
  en: ['HOME', 'RESEARCH', 'RESEARCHERS', 'INTEGRITY', 'CONTACT'],
};

/* ══════════════════
   روابط قائمة التنقل (المورف مينيو)
   ⚠ "الباحثون" و"النزاهة" و"تواصل معنا" ما إلهن صفحات مخصصة بالمشروع بعد،
   فمؤقتاً بيوجّهوا للصفحة الرئيسية لحد ما تُبنى
══════════════════ */
const MENU_NAV_ITEMS = [
  { ar: 'الرئيسية', en: 'HOME', path: '/' },
  { ar: 'الأبحاث', en: 'RESEARCH', path: '/research_review' },
  { ar: 'الباحثون', en: 'RESEARCHERS', path: '/' },
  { ar: 'النزاهة', en: 'INTEGRITY', path: '/' },
  { ar: 'تواصل معنا', en: 'CONTACT', path: '/' },
];

/* ══════════════════
   خيارات القرار (decision) — نفس القيم يلي بيتوقعها الباك
   ⚠ القيم (value) لازم تطابق enum الباك حرفياً
══════════════════ */
const DECISION_OPTIONS = [
  { value: 'REVISION_REQUIRED', ar: 'طلب تعديلات', en: 'Request Changes' },
  { value: 'SEND_TO_COMMITTEE', ar: 'إرسال للجنة', en: 'Send to Committee' },
];

/* ══════════════════
   خيارات قرار المحرر النهائي (بعد رجوع تحكيم اللجنة)
   ✅ FIX: الباك رفض "accepted" وقال "is not a valid choice" — القيم الصحيحة
   (شفناها بالـ Postman بالصورة: "decision": "ACCEPT") هي بنفس نمط enum القرار
   الأولي (REVISION_REQUIRED بالـ caps)، يعني: ACCEPT | REJECT | REVISION_REQUIRED
══════════════════ */
const FINAL_DECISION_OPTIONS = [
  { value: 'ACCEPT', ar: 'قبول', en: 'Accept' },
  { value: 'REJECT', ar: 'رفض', en: 'Reject' },
  { value: 'REVISION_REQUIRED', ar: 'طلب تعديلات', en: 'Request Revision' },
];

/* ══════════════════
   حالة رد المحكّم على الدعوة (response) وقراره على البحث (paper_decision)
   ⬅ متوافقة مع CommitteeMember model بالباك
══════════════════ */
const MEMBER_RESPONSE_MAP = {
  pending: { ar: 'بانتظار الرد', en: 'Pending', cls: 'status-pending' },
  accepted: { ar: 'وافق', en: 'Accepted', cls: 'status-done' },
  declined: { ar: 'اعتذر', en: 'Declined', cls: 'status-rejected' },
};

const MEMBER_DECISION_MAP = {
  pending: { ar: 'قيد الدراسة', en: 'Pending', cls: 'status-pending' },
  accept_paper: { ar: 'قبول الورقة', en: 'Accept Paper', cls: 'status-done' },
  reject_paper: { ar: 'رفض الورقة', en: 'Reject Paper', cls: 'status-rejected' },
  modify_paper: { ar: 'طلب تعديلات', en: 'Request Modifications', cls: 'status-noted' },
};

/* ══════════════════
   عدد المحكّمين الأساسيين المطلوب من الباك (ثابت — شفناه بالـ Postman:
   "primary_users" لازم يكون بالضبط 3 عناصر)
══════════════════ */
const REQUIRED_PRIMARY_COUNT = 3;

/* ══════════════════
   عدد الاحتياطيين اللي بيقترحهم زر "الاقتراح الذكي" (اختياري بالباك،
   بس منّا منقترح 2 كقيمة افتراضية معقولة)
══════════════════ */
const SUGGESTED_SUBSTITUTE_COUNT = 2;

/* ══════════════════
   AUTH HELPER — يقرأ اسم المستخدم الحالي من بيانات تسجيل الدخول المخزّنة
══════════════════ */
function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const candidateKeys = ['authData', 'auth', 'authResponse', 'loginData', 'user', 'userData'];
  for (const key of candidateKeys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const user = parsed?.user ?? parsed;
      if (user && (user.full_name || user.email)) return user;
    } catch (e) {
      // تجاهل المفاتيح غير الصالحة والمتابعة
    }
  }
  return null;
}

/* ══════════════════
   HELPER — يستخرج نص الملاحظات من شكل الـ response
   الباك بيرجع الحقل باسم "notes" (شفناه بالـ Postman)
══════════════════ */
function extractReportText(rev) {
  if (!rev) return '';
  if (typeof rev === 'string') return rev;
  return (
    rev.notes ??
    rev.report ??
    rev.comment ??
    rev.content ??
    rev.text ??
    rev.body ??
    JSON.stringify(rev)
  );
}

/* ══════════════════
   HELPER — يستخرج القرار (decision) من الـ response لعرضه كنص
══════════════════ */
function extractDecisionLabel(rev, lang) {
  if (!rev || !rev.decision) return '';
  const found = DECISION_OPTIONS.find(o => o.value === rev.decision);
  if (found) return lang === 'ar' ? found.ar : found.en;
  return rev.decision;
}

/* ══════════════════
   HELPER — يستخرج رسالة خطأ قابلة للعرض من أي شكل يرجعه الباك (DRF)
   الباك ممكن يرجع:
     - مصفوفة نصوص مباشرة: ["Only accepted papers can be published."]
     - object فيه حقول: {"notes": ["This field is required."]}
     - نص عادي، أو حتى بدون response.data إطلاقاً (خطأ شبكة مثلاً)
   منحاول نغطي كل الحالات بدل ما نطلع رسالة خطأ عامة دايماً
══════════════════ */
function extractErrorMessage(err, lang) {
  const data = err?.response?.data;

  if (Array.isArray(data)) {
    const joined = data.filter(Boolean).join(' ');
    if (joined) return joined;
  }

  if (data && typeof data === 'object') {
    const messages = [];
    Object.values(data).forEach(val => {
      if (Array.isArray(val)) messages.push(...val.filter(Boolean));
      else if (typeof val === 'string' && val.trim()) messages.push(val);
    });
    if (messages.length > 0) return messages.join(' ');
  }

  if (typeof data === 'string' && data.trim()) return data;

  if (!err?.response) {
    // ما وصل رد من السيرفر إطلاقاً (مشكلة شبكة/CORS)
    return lang === 'ar'
      ? 'تعذّر الاتصال بالخادم، تحقق من اتصالك بالإنترنت وحاول مرة أخرى'
      : 'Could not reach the server, check your connection and try again';
  }

  if (err?.message) return err.message;

  return lang === 'ar' ? 'حدث خطأ غير متوقع، حاول مرة أخرى' : 'An unexpected error occurred, please try again';
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
   HELPER — هل رجعت قرارات فعلية من أعضاء اللجنة (مش لسا pending)؟
   منعتمدها لإظهار قسم "قرار المحرر النهائي" فقط لما يصير في تحكيم فعلي
══════════════════ */
function committeeHasVerdict(status) {
  return !!(
    status &&
    Array.isArray(status.members) &&
    status.members.some(m => m.paper_decision && m.paper_decision !== 'pending')
  );
}

/* ══════════════════
   MAIN COMPONENT
══════════════════ */
export default function Editor() {
  const navigate = useNavigate();
  const [theme, setThemeState] = useState('light');
  const [lang, setLangState] = useState('ar');

  // ← API state بدل INITIAL_PAPERS
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ← المستخدم الحالي (يُقرأ من بيانات تسجيل الدخول المخزّنة)
  const [currentUser, setCurrentUser] = useState(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePaper, setActivePaper] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(null);

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
  //   قبل هيك كان في مصفوفة وحدة selectedReviewerIds بتترسل باسم reviewer_ids
  //   وهاد سبب رفض الباك للطلب ("يجب 3 محكمين أساسيين").
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

  // ← ✅ جديد: فيما إذا في لجنة موجودة أصلاً لهاد البحث (null = لسا ما تحقق)
  //   هاد يلي بيتحكم بأي زر يطلع: "تعيين اللجنة" (لو false) أو "عرض حالة اللجنة" (لو true)
  //   ما بيطلعوا الاثنين مع بعض، وما بيطلع ولا واحد فيهن قبل ما نتأكد
  const [committeeExists, setCommitteeExists] = useState(null);
  const [checkingCommittee, setCheckingCommittee] = useState(false);

  // ← ✅ جديد: قرار المحرر النهائي (بيظهر فقط بعد ما يصير في تحكيم فعلي من اللجنة)
  const [finalDecision, setFinalDecision] = useState('');
  // ✅ الباك بيرفض الطلب من دون notes ("This field is required.")
  const [finalNoteText, setFinalNoteText] = useState('');
  // ✅ الباك بيرفض القبول (ACCEPT) لو هالتلاتة مش مؤكدين كلهن:
  // "Language review, citation check and publisher permission must all be
  //  confirmed before acceptance."
  const [languageReviewPassed, setLanguageReviewPassed] = useState(false);
  const [citationCheckPassed, setCitationCheckPassed] = useState(false);
  const [publisherPermissionObtained, setPublisherPermissionObtained] = useState(false);
  const [submittingFinalDecision, setSubmittingFinalDecision] = useState(false);
  const [finalDecisionError, setFinalDecisionError] = useState(null);
  const [finalReview, setFinalReview] = useState(null);

  // ← ✅ جديد: نشر البحث
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const menuRef = useRef(null);
  const menuTopRef = useRef(null);
  const menuLinksRef = useRef([]);
  const menuFootRef = useRef(null);
  const cgRef = useRef(null);

  /* ── Theme / Lang applied to root ── */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [theme, lang]);

  /* ── تحميل بيانات المستخدم الحالي ── */
  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

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
        else if (detailOpen) closeDetail();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuOpen, detailOpen]);

  /* ── ✅ جديد: فحص وجود لجنة أصلاً لما يصير عنا initialReview بقرار SEND_TO_COMMITTEE
        هاد بيحدد أي زر يطلع تحت (تعيين / عرض حالة) بدل ما الاثنين يطلعوا مع بعض دايماً ── */
  useEffect(() => {
    if (activePaper && initialReview?.decision === 'SEND_TO_COMMITTEE') {
      checkCommitteeExists(activePaper.id);
    } else {
      setCommitteeExists(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePaper?.id, initialReview?.decision]);

  /* ── GSAP Menu ── */
  function openMenu() {
    if (menuOpen) return;
    setMenuOpen(true);
    const menu = menuRef.current;
    const top = menuTopRef.current;
    const links = menuLinksRef.current;
    const foot = menuFootRef.current;
    gsap.set(menu, { clipPath: 'inset(0 0 100% 0)', pointerEvents: 'auto' });
    gsap.set(top, { opacity: 0, y: -16 });
    gsap.set(links, { y: '100%', opacity: 0 });
    gsap.set(foot, { opacity: 0, y: 20 });
    document.body.style.overflow = 'hidden';
    gsap.timeline()
      .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: .7, ease: 'power3.inOut' })
      .to(top, { opacity: 1, y: 0, duration: .45, ease: 'power2.out' }, '-=0.38')
      .to(links, { y: '0%', opacity: 1, duration: .6, ease: 'power3.out', stagger: .07 }, '-=0.35')
      .to(foot, { opacity: 1, y: 0, duration: .45, ease: 'power2.out' }, '-=0.4');
  }

  function closeMenu() {
    if (!menuOpen) return;
    setMenuOpen(false);
    const menu = menuRef.current;
    const top = menuTopRef.current;
    const links = menuLinksRef.current;
    const foot = menuFootRef.current;
    setPreviewIdx(null);
    gsap.timeline({ onComplete: () => { menu.style.pointerEvents = 'none'; document.body.style.overflow = ''; } })
      .to(links, { y: '100%', opacity: 0, duration: .3, ease: 'power2.in', stagger: { amount: .18, from: 'end' } })
      .to(top, { opacity: 0, y: -12, duration: .25, ease: 'power2.in' }, '-=0.2')
      .to(foot, { opacity: 0, y: 14, duration: .2, ease: 'power2.in' }, '<')
      .to(menu, { clipPath: 'inset(0 0 100% 0)', duration: .5, ease: 'power3.inOut' }, '-=0.1');
  }

  /* ── التنقل من روابط قائمة المورف مينيو ── */
  function goTo(path) {
    closeMenu();
    navigate(path);
  }

  /* ── تسجيل الخروج ── */
  async function handleLogout() {
    closeMenu();
    try {
      await logout();
    } finally {
      navigate('/');
    }
  }

  /* ── جلب الملاحظات الأولية عند فتح البحث
        ⏸ الملاحظات النهائية (final) معطّلة مؤقتاً لحد ما تصير اللجنة جاهزة

        ✅ FIX #3: الباك أحياناً بيرجّع array (فاضي [] أو فيه عنصر) بدل object/null.
        array فاضي [] هو truthy بجافاسكربت، فكان !initialReview دايماً false
        وزر "إضافة تقرير" ما كان يطلع أبداً. هلق منطبّع القيمة: */
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

  /* ── جلب تقرير مساعد المحرر (GET assistant-review) — نفس منطق loadReviews تماماً ── */
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
      // 404 = لا يوجد تقرير مساعد بعد، هاد مش خطأ حقيقي
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

  /* ── إرسال التقرير الأولي (notes + decision) ──
        ⚠ الباك بيرفض الطلب إذا أي واحد من الحقلين ناقص
        (شفناها بالـ Postman: "notes":["This field is required."],"decision":["This field is required."]) */
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

      setNoteEditorOpen(false);
      setNoteText('');
      setDecision('');
    } catch (err) {
      setSaveError(err);
    } finally {
      setSavingNote(false);
    }
  }

  /* ── ✅ جديد: فحص فيما إذا في لجنة مشكّلة أصلاً لهاد البحث
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
    } finally {
      setLoadingReviewers(false);
    }
  }

  function closeCommitteePanel() {
    setCommitteePanelOpen(false);
  }

  /* ── تحديد دور المحكّم: بدون / أساسي / احتياطي ──
     كل محكّم بيكون بس بحالة وحدة (primary أو substitute أو ولا وحدة) */
  function setReviewerRole(userId, role) {
    setPrimaryReviewerIds(prev => prev.filter(id => id !== userId));
    setSubstituteReviewerIds(prev => prev.filter(id => id !== userId));
    if (role === 'primary') {
      setPrimaryReviewerIds(prev => [...prev, userId]);
    } else if (role === 'substitute') {
      setSubstituteReviewerIds(prev => [...prev, userId]);
    }
    // أي تعديل يدوي بعد الاقتراح الذكي بيلغي "علامة الاقتراح المطبّق"
    setLastSuggestionApplied(false);
  }

  function getReviewerRole(userId) {
    if (primaryReviewerIds.includes(userId)) return 'primary';
    if (substituteReviewerIds.includes(userId)) return 'substitute';
    return 'none';
  }

  /* ── الاقتراح الذكي للجنة ──────────────────────────
     بيستخدم buildSmartCommitteeSuggestion على نفس availableReviewers
     (نفس القائمة يلي بيجيبها getAvailableReviewers) وبيعبّي
     primaryReviewerIds / substituteReviewerIds تلقائياً.
     ⚠ ما بيرسل أي طلب — التعيين الفعلي لسا صاير عن طريق
     handleCreateCommittee ونفس createCommittee الموجودة أصلاً،
     فالمحرر لازم يضغط "إنشاء اللجنة" بعدين لتأكيد الاقتراح. */
  function suggestCommitteeSmart() {
    if (!availableReviewers || availableReviewers.length === 0) return;

    setSuggesting(true);
    setCommitteeError(null);

    try {
      const { primary, substitute } = buildSmartCommitteeSuggestion(availableReviewers);
      setPrimaryReviewerIds(primary.map(r => r.user_id));
      setSubstituteReviewerIds(substitute.map(r => r.user_id));
      setLastSuggestionApplied(true);
    } finally {
      setSuggesting(false);
    }
  }

  /* ── إنشاء اللجنة ─────────────────────────────────
     ✅ FIX: الـ payload الصحيح (شفناه بالـ Postman) هو:
       { primary_users: [...] (بالضبط 3), substitute_users: [...], blinding_type: "single_blind"|"double_blind" }
     قبل هيك كان عم يترسل { reviewer_ids: [...] } وهاد مش الشكل يلي الباك بيتوقعه إطلاقاً.
     ← نفس الدالة هاي مستخدمة سواء الأعضاء انتقوا يدوياً أو عن طريق
       "الاقتراح الذكي" — ما في فرق بالـ payload أو الـ API المستخدم.
     ← ✅ جديد: بعد النجاح منعلّم committeeExists = true فوراً، حتى زر
       "تعيين اللجنة" يختفي وزر "عرض حالة اللجنة" يطلع من دون ما نحتاج نعمل reload */
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
    } catch (err) {
      setCommitteeError(err);
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
    } catch (err) {
      setCommitteeStatusError(err);
    } finally {
      setLoadingCommitteeStatus(false);
    }
  }

  function closeCommitteeStatusPanel() {
    setCommitteeStatusOpen(false);
  }

  /* ── ✅ جديد: إرسال قرار المحرر النهائي (بعد رجوع تحكيم اللجنة) ──
        POST/PATCH /api/research/papers/{id}/editor-review/final/
        ✅ FIX: الباك بيرفض الطلب لو "notes" ناقص ("This field is required.")
        ✅ FIX: الباك بيرفض القبول (ACCEPT) لو الثلاث تأكيدات مش محددين كلهن
        ("Language review, citation check and publisher permission must all
        be confirmed before acceptance.") — فبنبعتهن دايماً بالـ payload،
        وبنمنع الإرسال من الواجهة أصلاً لو القرار ACCEPT وواحد منهن ناقص
        القيم المتوقعة من الباك لـ decision: ACCEPT | REJECT | REVISION_REQUIRED */
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
    } catch (err) {
      setFinalDecisionError(err);
    } finally {
      setSubmittingFinalDecision(false);
    }
  }

  /* ── ✅ جديد: نشر البحث ─────────────────────────────
     POST /api/research/papers/{id}/publish/
     ⚠ الباك بيرفض النشر لو البحث مش accepted بعد، وبيرجع 400 مع رسالة
       زي ["Only accepted papers can be published."] — extractErrorMessage
       عم تتكفّل تعرضها للمحرر مباشرة بدل رسالة خطأ عامة */
  async function handlePublishPaper() {
    if (!activePaper) return;

    setPublishing(true);
    setPublishError(null);
    setPublishSuccess(false);

    try {
      await publishPaper(activePaper.id);
      setPublishSuccess(true);
    } catch (err) {
      setPublishError(extractErrorMessage(err, lang));
    } finally {
      setPublishing(false);
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
      status_l: { ar: 'الحالة', en: 'status' },
      abstract: { ar: 'الملخص', en: 'Abstract' },
      file: { ar: 'ملف البحث', en: 'Research File' },
      download: { ar: 'تحميل', en: 'Download' },
      no_file: { ar: 'لا يوجد ملف مرفق', en: 'No file attached' },
      assistant_report: {
        ar: "تقرير مساعد المحرر",
        en: "Assistant Report"
      },
      editor_notes: {
        ar: "ملاحظات المحرر",
        en: "Editor's Notes"
      },

      editor_decision: {
        ar: "قرار المحرر",
        en: "Editor's Decision"
      }, initial_notes: { ar: 'الملاحظات الأولية', en: 'Initial Notes' },
      no_notes: { ar: 'لا يوجد تقرير بعد', en: 'No report yet' },
      add_report: { ar: 'إضافة تقرير', en: 'Add Report' },
      decision_l: { ar: 'القرار', en: 'Decision' },
      decision_ph: { ar: 'اختر القرار...', en: 'Select decision...' },
      decision_missing: { ar: 'يرجى اختيار القرار', en: 'Please select a decision' },
      note_ph: { ar: 'اكتب تقريرك هنا...', en: 'Write your report here...' },
      cancel: { ar: 'إلغاء', en: 'Cancel' },
      save_note: { ar: 'إرسال', en: 'Submit' },
      saving: { ar: 'جارٍ الإرسال...', en: 'Submitting...' },
      save_fail: { ar: 'فشل إرسال التقرير، حاول مرة أخرى', en: 'Failed to submit report, please try again' },
      load_fail: { ar: 'فشل تحميل التقرير', en: 'Failed to load report' },
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
      role: { ar: ' المحرر', en: ' Editor' },
      welcome_ar: 'مرحباً،',
      welcome_en: 'Welcome back,',
      papers_await_ar: 'بانتظار مراجعتك',
      papers_await_en: 'await your review',
      sub_ar: 'هنا كل الأبحاث المُقدَّمة حديثاً. اضغط على أي بحث لتطلع على تفاصيله وتضيف تقريرك.',
      sub_en: 'All recently submitted papers are listed below. Click any paper to view details and add your report.',
      // ── لجنة التحكيم ──
      select_committee_l: { ar: 'اختر أعضاء اللجنة', en: 'Select Committee Members' },
      committee_hint: {
        ar: `اختر بالضبط ${REQUIRED_PRIMARY_COUNT} محكّمين أساسيين، وأي عدد من الاحتياطيين (اختياري)`,
        en: `Select exactly ${REQUIRED_PRIMARY_COUNT} primary reviewers, and any number of substitutes (optional)`,
      },
      role_none: { ar: '— بدون —', en: '— None —' },
      role_primary: { ar: 'أساسي', en: 'Primary' },
      role_substitute: { ar: 'احتياطي', en: 'Substitute' },
      blinding_type_l: { ar: 'نوع التحكيم', en: 'Blinding Type' },
      single_blind: { ar: 'تحكيم فردي (Single Blind)', en: 'Single Blind' },
      double_blind: { ar: 'تحكيم مزدوج (Double Blind)', en: 'Double Blind' },
      primary_count_ok: { ar: 'تمام، عندك 3 أساسيين', en: 'Good, 3 primary selected' },
      primary_count_bad: {
        ar: `لازم تختار بالضبط ${REQUIRED_PRIMARY_COUNT} أساسيين (المختارين حالياً: `,
        en: `You must select exactly ${REQUIRED_PRIMARY_COUNT} primary reviewers (currently selected: `,
      },
      no_reviewers: { ar: 'لا يوجد مراجعون متاحون حالياً', en: 'No available reviewers' },
      reviewers_load_fail: { ar: 'فشل تحميل المراجعين المتاحين', en: 'Failed to load available reviewers' },
      creating: { ar: 'جارٍ الإنشاء...', en: 'Creating...' },
      create_committee_btn: { ar: 'إنشاء اللجنة', en: 'Create Committee' },
      committee_fail: { ar: 'فشل إنشاء اللجنة، حاول مرة أخرى', en: 'Failed to create committee, please try again' },
      committee_success: { ar: 'تم إنشاء اللجنة بنجاح', en: 'Committee created successfully' },
      // ← الزر يطلع فقط لما ما في لجنة بعد (committeeExists === false)
      assign_committee_btn: { ar: 'تعيين اللجنة', en: 'Assign Committee' },
      checking_committee: { ar: 'جارٍ التحقق من حالة اللجنة...', en: 'Checking committee status...' },
      // ── الاقتراح الذكي ──
      smart_suggest_btn: { ar: 'اقتراح ذكي للجنة', en: 'Smart Committee Suggestion' },
      suggesting: { ar: 'جارٍ الاقتراح...', en: 'Suggesting...' },
      suggestion_applied: {
        ar: 'تم تعبئة الاقتراح — راجع الأسماء وعدّل إذا حبيت، ثم اضغط "إنشاء اللجنة" للتأكيد',
        en: 'Suggestion applied — review the names, adjust if needed, then press "Create Committee" to confirm',
      },
      // ── حالة اللجنة الكاملة ── (الزر يطلع فقط لما في لجنة أصلاً — committeeExists === true)
      committee_status_btn: { ar: 'عرض حالة اللجنة والقرارات', en: 'View Committee Status' },
      committee_status_title: { ar: 'حالة اللجنة', en: 'Committee Status' },
      member_response_l: { ar: 'حالة الرد', en: 'Response' },
      member_decision_l: { ar: 'قرار المحكّم', en: 'Reviewer Decision' },
      member_comment_l: { ar: 'ملاحظات المحكّم', en: "Reviewer's Comment" },
      no_comment: { ar: 'لا توجد ملاحظات', en: 'No comment' },
      committee_status_load_fail: { ar: 'تعذّر تحميل حالة اللجنة', en: 'Failed to load committee status' },
      committee_created_by: { ar: 'المحرر المسؤول', en: 'Handling Editor' },
      // ── قرار المحرر النهائي ──
      final_decision_l: { ar: 'قرار المحرر النهائي', en: "Editor's Final Decision" },
      final_decision_hint: {
        ar: 'وصلت قرارات اللجنة — اختر قرارك النهائي بشأن هذا البحث',
        en: "The committee's decisions have arrived — choose your final decision on this paper",
      },
      decision_accepted: { ar: 'قبول', en: 'Accept' },
      decision_rejected: { ar: 'رفض', en: 'Reject' },
      decision_revision: { ar: 'طلب تعديلات', en: 'Request Revision' },
      final_note_ph: { ar: 'اكتب ملاحظاتك النهائية هنا...', en: 'Write your final notes here...' },
      accept_confirm_l: { ar: 'تأكيدات لازمة قبل القبول', en: 'Confirmations required before acceptance' },
      language_review_passed_l: { ar: 'المراجعة اللغوية سليمة', en: 'Language review passed' },
      citation_check_passed_l: { ar: 'فحص التوثيق/الاستشهادات سليم', en: 'Citation check passed' },
      publisher_permission_obtained_l: { ar: 'تم الحصول على إذن النشر', en: 'Publisher permission obtained' },
      accept_confirm_missing: {
        ar: 'لازم تأكيد المراجعة اللغوية وفحص التوثيق وإذن النشر قبل القبول',
        en: 'Language review, citation check and publisher permission must all be confirmed before acceptance',
      },
      submit_final_decision: { ar: 'إرسال القرار النهائي', en: 'Submit Final Decision' },
      submitting_final: { ar: 'جارٍ الإرسال...', en: 'Submitting...' },
      final_decision_saved: { ar: 'تم حفظ القرار النهائي بنجاح', en: 'Final decision saved successfully' },
      final_decision_missing: { ar: 'يرجى كتابة الملاحظات واختيار القرار النهائي', en: 'Please write notes and select a final decision' },
      final_decision_fail: { ar: 'فشل إرسال القرار النهائي، حاول مرة أخرى', en: 'Failed to submit final decision, please try again' },
      // ── نشر البحث ──
      publish_btn: { ar: 'نشر البحث', en: 'Publish Paper' },
      publishing_l: { ar: 'جارٍ النشر...', en: 'Publishing...' },
      publish_success: { ar: 'تم نشر البحث بنجاح', en: 'Paper published successfully' },
      // ── تقرير مساعد المحرر (قراءة فقط) ──
      assistant_l: { ar: 'مساعد المحرر', en: 'Assistant' },
      assistant_notes_l: { ar: 'ملاحظات مساعد المحرر', en: "Assistant's Notes" },
      format_ok_l: { ar: 'الفورمات مطابق للمعايير', en: 'Format Compliant' },
      complete_l: { ar: 'البحث مكتمل', en: 'Paper Complete' },
      policy_notes_l: { ar: 'ملاحظات السياسات', en: 'Policy Notes' },
      reviewed_at_l: { ar: 'تاريخ المراجعة', en: 'Reviewed At' },
      suggested_reviewers_l: { ar: 'المحكّمون المقترحون', en: 'Suggested Reviewers' },
      recommended_decision_l: { ar: 'القرار الموصى به', en: 'Recommended Decision' },
      ieee_report_l: { ar: 'تقرير IEEE', en: 'IEEE Report' },
    };
    return (map[key]?.[lang]) ?? (map[key]) ?? key;
  };
  /* ══════════ RENDER ══════════ */
  return (
    <div className={`ea-root theme-${theme} lang-${lang}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Cursor glow */}
      <div className="ea-cg" ref={cgRef} />

      {/* ══ MORPH MENU ══ */}
      <div
        className="ea-menu"
        ref={menuRef}
        style={{ clipPath: 'inset(0 0 100% 0)', pointerEvents: 'none' }}
      >
        <div className="menu-top" ref={menuTopRef} style={{ opacity: 0 }}>
          <div className="menu-logo-row">
            <LogoSVG />
            <div>
              <div className="menu-ln">ASPU Insight</div>
              <div className="menu-ls">{lang === 'ar' ? 'المجلة الأكاديمية الرقمية' : 'Digital Academic Journal'}</div>
            </div>
          </div>
          <button className="menu-close-btn" onClick={closeMenu}>
            {t('close_l')}
            <FiX size={14} />
          </button>
        </div>

        <div className="menu-body">
          <div className={`menu-links ${previewIdx !== null ? 'has-hover' : ''}`}>
            {MENU_NAV_ITEMS.map((item, i) => (
              <div className="ml-wrap" key={i}>
                <a
                  className={`menu-link${previewIdx === i ? ' hov' : ''}`}
                  href={item.path}
                  ref={el => menuLinksRef.current[i] = el}
                  onMouseEnter={() => setPreviewIdx(i)}
                  onMouseLeave={() => setPreviewIdx(null)}
                  onClick={e => { e.preventDefault(); goTo(item.path); }}
                >
                  <div className="ml-row">
                    <span className="ml-name">{lang === 'ar' ? item.ar : item.en}</span>
                    <span className="ml-num">0{i + 1}</span>
                  </div>
                  <span className="ml-sub">{lang === 'ar' ? 'استعرض' : 'EXPLORE'}</span>
                </a>
              </div>
            ))}
          </div>

          <div className="menu-preview">
            <div className={`preview-inner ${previewIdx !== null ? 'show' : ''}`}>
              <div className="preview-ring">
                <div className="preview-ring-spin" />
                <LogoSVG />
              </div>
              <div className="preview-divider" />
              <div className="preview-name">
                {previewIdx !== null ? PREV_NAMES[lang][previewIdx] : 'ASPU'}
              </div>
              <div className="preview-tag">ASPU Insight</div>
            </div>
          </div>
        </div>

        <div className="menu-foot" ref={menuFootRef} style={{ opacity: 0 }}>
          <span className="mf-label">{t('appearance')}</span>
          <div className="menu-tpill">
            <button className={`mtp-btn ${theme === 'dark' ? 'on' : ''}`} onClick={() => setThemeState('dark')}><FiMoon size={14} /></button>
            <button className={`mtp-btn ${theme === 'light' ? 'on' : ''}`} onClick={() => setThemeState('light')}><FiSun size={14} /></button>
          </div>
          <div className="menu-tpill">
            <button className={`mtp-btn ${lang === 'ar' ? 'on' : ''}`} onClick={() => setLangState('ar')}>ع</button>
            <button className={`mtp-btn ${lang === 'en' ? 'on' : ''}`} onClick={() => setLangState('en')}>EN</button>
          </div>
          <button className="menu-login-btn" onClick={handleLogout}>{t('logout')} <FiLogOut size={14} /></button>
        </div>
      </div>

      {/* ══ NAVBAR ══ */}
      <nav className={`ea-nav ${navScrolled ? 'scrolled' : ''}`}>
        <a href="/" className="nav-logo" onClick={e => { e.preventDefault(); navigate('/'); }}>
          <LogoSVG />
          <div>
            <div className="logo-n">ASPU Insight</div>
            <div className="logo-s">{t('journal')}</div>
          </div>
        </a>
        <div className="nav-space" />
        <button
          className={`nav-menu-btn ${menuOpen ? 'is-open' : ''}`}
          onClick={menuOpen ? closeMenu : openMenu}
        >
          <span className="nmb-label">{t('menu_l')}</span>
          <span className="nmb-icon">
            {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </span>
        </button>
      </nav>

      {/* ══ HERO ══ */}
      <section className="ea-hero">
        <div className="hero-grid" />
        <div className="orb o1" /><div className="orb o2" />
        <div className="hero-wm">{lang === 'ar' ? 'مراجعة' : 'Review'}</div>

        <div className="hero-inner">
          <div className="role-badge">
            {t('role')}
            <span className="badge-active"><FiCheckCircle size={12} /> ACTIVE</span>
          </div>
          <h1 className="hero-title">
            {lang === 'ar' ? (
              <>{t('welcome_ar')} <span className="ht-gold">{displayName}.</span><br />
                <span className="ht-blue">{statPending} {lang === 'ar' ? 'بحثاً' : 'papers'}</span> {t('papers_await_ar')}</>
            ) : (
              <>{t('welcome_en')} <span className="ht-gold">{displayName}.</span><br />
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

      {/* ══ PAPERS LIST ══ */}
      <div className="main-wrap">
        <div className="sec-head">
          <div className="sec-dot" />
          <span className="sec-title">{t('submitted')}</span>
          <div className="sec-rule" />
          <div className="sec-count">{filtered.length}</div>
        </div>

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
            <FiSearch size={14} />
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
              <div className="empty-ico"><FiLoader className="spin-ico" /></div>
              <div className="empty-title">{t('loading')}</div>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="empty-state">
              <div className="empty-ico"><FiAlertTriangle /></div>
              <div className="empty-title">{t('error')}</div>
              <p className="empty-sub">{extractErrorMessage(error, lang)}</p>
            </div>
          )}

          {/* Empty results */}
          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-ico"><FiSearch /></div>
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
                    {p.is_paid_open_access ? <FiUnlock size={12} /> : <FiLock size={12} />}
                    {p.is_paid_open_access
                      ? (lang === 'ar' ? ' مفتوح' : ' Open Access')
                      : (lang === 'ar' ? ' مقيّد' : ' Restricted')}
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
                    <FiChevronRight size={13} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <footer className="ea-footer">
        <div className="ft-grid">
          <div>
            <div className="ft-brand">
              <LogoSVG />
              <div>
                <div className="logo-n">ASPU Insight</div>
                <div className="logo-s">{lang === 'ar' ? 'المجلة الأكاديمية الرقمية' : 'Digital Academic Journal'}</div>
              </div>
            </div>
            <p className="ft-desc">
              {lang === 'ar'
                ? 'مجلة رقمية أكاديمية تسلط الضوء على أبحاث الطلبة وإنجازاتهم في جامعة الشام الخاصة.'
                : 'A digital academic journal spotlighting student research at Al-Sham Private University.'}
            </p>
          </div>
          {[
            { title_ar: 'الأبحاث', title_en: 'Research', links: [['آخر الإضافات', 'Latest'], ['الأكثر تقييماً', 'Top Rated'], ['حسب التخصص', 'By Discipline'], ['الأرشيف', 'Archive']] },
            { title_ar: 'للطلبة', title_en: 'Students', links: [['تقديم بحث', 'Submit Paper'], ['إرشادات النشر', 'Guidelines'], ['فحص التشابه', 'Similarity Check']] },
            { title_ar: 'للأساتذة', title_en: 'Faculty', links: [['لوحة المراجعة', 'Review Panel'], ['تقارير النزاهة', 'Integrity Reports'], ['إدارة اللجنة', 'Committee']] },
          ].map((col, i) => (
            <div className="ft-col" key={i}>
              <h5>{lang === 'ar' ? col.title_ar : col.title_en}</h5>
              <ul>
                {col.links.map(([ar, en], j) => (
                  <li key={j}><a href="#">{lang === 'ar' ? ar : en}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="ft-btm">
          <span>© 2025 ASPU Insight — {lang === 'ar' ? 'جامعة الشام الخاصة' : 'Al-Sham Private University'}</span>
          <span>{lang === 'ar' ? 'مشروع تخرج · 2025–2026' : 'Graduation Project · 2025–2026'}</span>
        </div>
      </footer>

      {/* ══ DETAIL PANEL ══ */}
      <div className={`detail-overlay ${detailOpen ? 'open' : ''}`} onClick={closeDetail} />
      <div className={`detail-panel ${detailOpen ? 'open' : ''}`}>
        {activePaper && (
          <>
            <div className="dp-header">
              <button className="dp-back-btn" onClick={closeDetail}>
                <FiChevronLeft size={16} />
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

              {/* AI Keywords */}
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

              {/* PDF File */}
              <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('file')}</div>
              {activePaper.pdf_file ? (
                <div className="dp-pdf-block">
                  <div className="dp-pdf-bar">
                    <div className="dp-pdf-ico">
                      <FiFileText size={18} />
                    </div>
                    <span className="dp-pdf-name">
                      {activePaper.pdf_file.split('/').pop()}
                    </span>
                    <a
                      className="dp-pdf-dl"
                      href={activePaper.pdf_file}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FiDownload size={12} />
                      {t('download')}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="no-notes-msg">{t('no_file')}</div>
              )}

              {/* ══ تقرير مساعد المحرر (GET assistant-review) ══ */}
              <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('assistant_report')}</div>
              {loadingAssistantReview ? (
                <div className="no-notes-msg">{t('loading')}</div>
              ) : assistantReviewError ? (
                <p style={{ color: '#EF4444', fontSize: 12 }}>{extractErrorMessage(assistantReviewError, lang) || t('load_fail')}</p>
              ) : assistantReview ? (
                <>
                  <div className="dp-author-row">
                    <div className="dp-avatar">
                      {assistantReview.assistant?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="dp-author-info">
                      <div className="dp-author-name">{assistantReview.assistant?.full_name || t('assistant_l')}</div>
                      <div className="dp-author-meta">{assistantReview.assistant?.email}</div>
                    </div>
                    {assistantReview.decision && (
                      <span
                        className={`pc-status ${ASSISTANT_DECISION_MAP[assistantReview.decision]?.cls || 'status-pending'}`}
                        style={{ marginInlineStart: 'auto' }}
                      >
                        <span className="pc-status-dot" />
                        {ASSISTANT_DECISION_MAP[assistantReview.decision]
                          ? (lang === 'ar' ? ASSISTANT_DECISION_MAP[assistantReview.decision].ar : ASSISTANT_DECISION_MAP[assistantReview.decision].en)
                          : assistantReview.decision}
                      </span>
                    )}
                  </div>

                  <div className="dp-info-grid">
                    {[
                      { label: t('format_ok_l'), val: assistantReview.is_format_compliant ? t('yes') : t('no') },
                      { label: t('complete_l'), val: assistantReview.is_complete ? t('yes') : t('no') },
                      {
                        label: t('reviewed_at_l'),
                        val: assistantReview.reviewed_at
                          ? new Date(assistantReview.reviewed_at).toLocaleString(lang === 'ar' ? 'ar' : 'en')
                          : '—',
                      },
                      ...(assistantReview.recommended_decision ? [{
                        label: t('recommended_decision_l'),
                        val: ASSISTANT_DECISION_MAP[assistantReview.recommended_decision]
                          ? (lang === 'ar' ? ASSISTANT_DECISION_MAP[assistantReview.recommended_decision].ar : ASSISTANT_DECISION_MAP[assistantReview.recommended_decision].en)
                          : assistantReview.recommended_decision,
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
                      <div className="note-body">{assistantReview.notes || t('no_notes')}</div>
                    </div>
                  </div>

                  {assistantReview.policy_notes && (
                    <>
                      <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('policy_notes_l')}</div>
                      <div className="dp-notes-wrap">
                        <div className="note-item">
                          <div className="note-body">{assistantReview.policy_notes}</div>
                        </div>
                      </div>
                    </>
                  )}

                  {assistantReview.suggested_reviewers?.length > 0 && (
                    <>
                      <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('suggested_reviewers_l')}</div>
                      <div className="dp-notes-wrap">
                        {assistantReview.suggested_reviewers.map((rev, i) => (
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

                  {assistantReview.ieee_report && (
                    <>
                      <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 16 }}>{t('ieee_report_l')}</div>
                      <div className="dp-notes-wrap">
                        {typeof assistantReview.ieee_report === 'object' ? (
                          <div className="dp-info-grid">
                            {Object.entries(assistantReview.ieee_report)
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
                            <div className="note-body">{String(assistantReview.ieee_report)}</div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="no-notes-msg">{t('no_notes')}</div>
              )}

              <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
                {t('initial_notes')}
              </div>
              <div className="dp-notes-wrap">
                {loadingInitialReview ? (
                  <div className="no-notes-msg">{t('loading')}</div>
                ) : initialReviewError ? (
                  <p style={{ color: '#EF4444', fontSize: 12 }}>{extractErrorMessage(initialReviewError, lang) || t('load_fail')}</p>
                ) : initialReview ? (
                  <div className="note-item">
                    <div className="note-body">{extractReportText(initialReview)}</div>
                    {initialReview.decision && (
                      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                        {t('decision_l')}: <strong>{extractDecisionLabel(initialReview, lang)}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-notes-msg">{t('no_notes')}</div>
                )}
              </div>

              {/* ══ أزرار اللجنة — تظهر فقط لو القرار SEND_TO_COMMITTEE ══
                    ✅ منطق جديد:
                    - وقت ما يكون committeeExists === null (لسا عم نتحقق) → ما منطلع ولا زر، بنطلع مؤشر تحميل بسيط
                    - committeeExists === false → بس زر "تعيين اللجنة" يطلع
                    - committeeExists === true  → بس زر "عرض حالة اللجنة" يطلع
                    - قسم "قرار المحرر النهائي" (راديو بوتن) بيطلع فقط لما زر عرض حالة اللجنة
                      يكون ظاهر (committeeExists === true) وجاي تحكيم فعلي من اللجنة (committeeHasVerdict)
                    - زر "نشر البحث" ما بيطلع إلا لما القرار النهائي يصير "قبول" */}
              {initialReview?.decision === 'SEND_TO_COMMITTEE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {checkingCommittee && (
                      <span style={{ fontSize: 12, opacity: 0.65, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiLoader className="spin-ico" size={13} />
                        {t('checking_committee')}
                      </span>
                    )}

                    {/* زر عرض حالة اللجنة — يطلع فقط إذا أكيد في لجنة مشكّلة أصلاً */}
                    {!checkingCommittee && committeeExists === true && !committeeStatusOpen && (
                      <button
                        onClick={openCommitteeStatusPanel}
                        style={{
                          background: "#C4A55A",
                          color: "#fff",
                          padding: "12px 20px",
                          border: "none",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontWeight: "600",
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <FiEye size={14} />
                        {t('committee_status_btn')}
                      </button>
                    )}

                    {/* زر تعيين اللجنة — يطلع فقط إذا أكيد ما في لجنة مشكّلة بعد */}
                    {!checkingCommittee && committeeExists === false && !committeePanelOpen && !committeeSuccess && (
                      <button
                        onClick={openCommitteePanel}
                        style={{
                          background: "#5A8FA0",
                          color: "#fff",
                          padding: "12px 20px",
                          border: "none",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontWeight: "600",
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <FiUsers size={14} />
                        {t('assign_committee_btn')}
                      </button>
                    )}
                  </div>

                  {/* ══ قرار المحرر النهائي (راديو بوتن) ══
                        بيطلع حصراً لما زر "عرض حالة اللجنة" يكون ظاهر (في لجنة أصلاً)
                        وجاي تحكيم فعلي من أعضاء اللجنة (مش لسا pending) ══ */}
                  {committeeExists === true && committeeHasVerdict(committeeStatus) && (
                    <div className="editor-field">
                      <label className="editor-label">
                        {t('final_decision_l')}
                      </label>
                      <p style={{ fontSize: 12, opacity: 0.7, marginTop: -4, marginBottom: 10 }}>
                        {t('final_decision_hint')}
                      </p>

                      {/* ✅ الباك بيرفض الطلب من دون notes */}
                      <textarea
                        className="editor-textarea"
                        rows={4}
                        placeholder={t('final_note_ph')}
                        value={finalNoteText}
                        onChange={e => setFinalNoteText(e.target.value)}
                        disabled={submittingFinalDecision}
                        style={{ marginBottom: 10 }}
                      />

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {FINAL_DECISION_OPTIONS.map(opt => (
                          <label
                            key={opt.value}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}
                          >
                            <input
                              type="radio"
                              name="final-decision"
                              value={opt.value}
                              checked={finalDecision === opt.value}
                              onChange={() => setFinalDecision(opt.value)}
                              disabled={submittingFinalDecision}
                            />
                            {lang === 'ar' ? opt.ar : opt.en}
                          </label>
                        ))}
                      </div>

                      {/* ✅ الباك بيرفض ACCEPT من دون هالتلاتة تأكيدات — بتطلع فقط لما القرار المختار ACCEPT */}
                      {finalDecision === 'ACCEPT' && (
                        <div style={{ marginTop: 10, marginBottom: 4 }}>
                          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                            {t('accept_confirm_l')}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={languageReviewPassed}
                                onChange={e => setLanguageReviewPassed(e.target.checked)}
                                disabled={submittingFinalDecision}
                              />
                              {t('language_review_passed_l')}
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={citationCheckPassed}
                                onChange={e => setCitationCheckPassed(e.target.checked)}
                                disabled={submittingFinalDecision}
                              />
                              {t('citation_check_passed_l')}
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={publisherPermissionObtained}
                                onChange={e => setPublisherPermissionObtained(e.target.checked)}
                                disabled={submittingFinalDecision}
                              />
                              {t('publisher_permission_obtained_l')}
                            </label>
                          </div>
                          {!(languageReviewPassed && citationCheckPassed && publisherPermissionObtained) && (
                            <p style={{ color: '#F59E0B', fontSize: 12, marginTop: 6 }}>
                              {t('accept_confirm_missing')}
                            </p>
                          )}
                        </div>
                      )}

                      <div style={{ marginTop: 12 }}>
                        <button
                          className="btn-save-note"
                          onClick={submitFinalDecision}
                          disabled={
                            submittingFinalDecision ||
                            !finalDecision ||
                            !finalNoteText.trim() ||
                            (finalDecision === 'ACCEPT' && !(languageReviewPassed && citationCheckPassed && publisherPermissionObtained))
                          }
                        >
                          {submittingFinalDecision ? <FiLoader className="spin-ico" size={13} /> : <FiCheck size={13} />}
                          {submittingFinalDecision ? t('submitting_final') : t('submit_final_decision')}
                        </button>
                      </div>

                      {!finalNoteText.trim() && finalDecision && (
                        <p style={{ color: '#F59E0B', fontSize: 12, marginTop: 8 }}>
                          {t('final_decision_missing')}
                        </p>
                      )}

                      {finalReview && (
                        <p style={{ color: '#22C55E', fontSize: 13, marginTop: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FiCheckCircle size={15} />
                          {t('final_decision_saved')}
                        </p>
                      )}
                      {finalDecisionError && (
                        <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                          {extractErrorMessage(finalDecisionError, lang) || t('final_decision_fail')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ══ زر نشر البحث — يظهر فقط إذا القرار النهائي = قبول (ACCEPT) ══ */}
                  {finalReview?.decision === 'ACCEPT' && (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        onClick={handlePublishPaper}
                        disabled={publishing}
                        style={{
                          background: "#22C55E",
                          color: "#fff",
                          padding: "12px 20px",
                          border: "none",
                          borderRadius: "10px",
                          cursor: publishing ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          opacity: publishing ? 0.7 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {publishing ? <FiLoader className="spin-ico" size={14} /> : <FiUpload size={14} />}
                        {publishing ? t('publishing_l') : t('publish_btn')}
                      </button>
                    </div>
                  )}

                  {publishSuccess && (
                    <p style={{ color: '#22C55E', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                      <FiCheckCircle size={15} />
                      {t('publish_success')}
                    </p>
                  )}
                  {publishError && (
                    <p style={{ color: '#EF4444', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                      <FiAlertTriangle size={15} />
                      {publishError}
                    </p>
                  )}
                </div>
              )}

              {committeeSuccess && (
                <p style={{ color: '#22C55E', fontSize: 13, marginTop: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiCheckCircle size={15} />
                  {t('committee_success')}
                </p>
              )}

              {/* ══ بانل حالة اللجنة (أعضاء + ردود + قرارات) ══ */}
              {committeeStatusOpen && (
                <div className="note-editor open" style={{ marginTop: 16 }}>
                  <div className="dp-header" style={{ padding: 0, marginBottom: 12, border: 'none' }}>
                    <span className="dp-header-title" style={{ margin: 0 }}>{t('committee_status_title')}</span>
                  </div>

                  {loadingCommitteeStatus ? (
                    <div className="no-notes-msg">{t('loading')}</div>
                  ) : committeeStatusError ? (
                    <p style={{ color: '#EF4444', fontSize: 12 }}>{extractErrorMessage(committeeStatusError, lang) || t('committee_status_load_fail')}</p>
                  ) : committeeStatus ? (
                    <>
                      <div className="dp-info-grid" style={{ marginBottom: 16 }}>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('blinding_type_l')}</div>
                          <div className="dp-info-val">
                            {committeeStatus.blinding_type === 'double_blind' ? t('double_blind') : t('single_blind')}
                          </div>
                        </div>
                        <div className="dp-info-cell">
                          <div className="dp-info-label">{t('committee_created_by')}</div>
                          <div className="dp-info-val">{committeeStatus.editor_name}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(committeeStatus.members ?? []).map(member => {
                          const respMeta = MEMBER_RESPONSE_MAP[member.response] ?? MEMBER_RESPONSE_MAP.pending;
                          const decMeta = MEMBER_DECISION_MAP[member.paper_decision] ?? MEMBER_DECISION_MAP.pending;
                          return (
                            <div key={member.id} className="reviewer-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <span style={{ fontWeight: 600, fontSize: 14 }}>
                                  {member.user?.full_name}{' '}
                                  <span style={{ opacity: 0.55, fontWeight: 400, fontSize: 12 }}>
                                    {member.user?.institution ? `· ${member.user.institution}` : ''}
                                  </span>
                                </span>
                                <span className={`pc-status ${respMeta.cls}`}>
                                  <span className="pc-status-dot" />
                                  {lang === 'ar' ? respMeta.ar : respMeta.en}
                                </span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <span style={{ fontSize: 12, opacity: 0.7 }}>{t('member_decision_l')}</span>
                                <span className={`pc-status ${decMeta.cls}`}>
                                  <span className="pc-status-dot" />
                                  {lang === 'ar' ? decMeta.ar : decMeta.en}
                                </span>
                              </div>

                              <div>
                                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 2 }}>{t('member_comment_l')}</div>
                                <div style={{ fontSize: 13 }}>
                                  {member.comments?.trim() ? member.comments : t('no_comment')}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : null}

                  <div className="note-editor-btns">
                    <button className="btn-cancel-note" onClick={closeCommitteeStatusPanel}>
                      <FiX size={13} />
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              )}

              {committeePanelOpen && (
                <div className="note-editor open" style={{ marginTop: 16 }}>
                  <div className="dp-sec-label">
                    {t('select_committee_l')}
                  </div>
                  <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4, marginBottom: 12 }}>
                    {t('committee_hint')}
                  </p>

                  {/* ══ زر الاقتراح الذكي — يعبّي primary/substitute تلقائياً
                        من نفس availableReviewers، بدون أي API إضافي ══ */}
                  <button
                    className="btn-smart-suggest"
                    onClick={suggestCommitteeSmart}
                    disabled={suggesting || loadingReviewers || availableReviewers.length === 0}
                  >
                    {suggesting ? <FiLoader className="spin-ico" size={14} /> : <HiSparkles size={15} />}
                    {suggesting ? t('suggesting') : t('smart_suggest_btn')}
                  </button>

                  {lastSuggestionApplied && (
                    <p className="smart-suggest-note">
                      {t('suggestion_applied')}
                    </p>
                  )}

                  {loadingReviewers ? (
                    <div className="no-notes-msg">{t('loading')}</div>
                  ) : reviewersError ? (
                    <p style={{ color: '#EF4444', fontSize: 12 }}>
                      {extractErrorMessage(reviewersError, lang) || t('reviewers_load_fail')}
                    </p>
                  ) : availableReviewers.length === 0 ? (
                    <div className="no-notes-msg">
                      {t('no_reviewers')}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      {availableReviewers.map(r => {
                        const currentRole = getReviewerRole(r.user_id);
                        return (
                          <div
                            key={r.user_id}
                            className={`reviewer-row ${currentRole !== 'none' ? `role-${currentRole}` : ''}`}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600, fontSize: 14 }}>
                                {r.full_name}{' '}
                                <span style={{ opacity: 0.55, fontWeight: 400, fontSize: 12 }}>#{r.user_id}</span>
                              </span>
                              <span style={{ fontSize: 12, opacity: 0.7 }}>
                                {r.email}{r.institution ? ` · ${r.institution}` : ''}
                              </span>
                            </div>

                            <select
                              className="editor-select"
                              value={currentRole}
                              onChange={e => setReviewerRole(r.user_id, e.target.value)}
                              style={{ minWidth: 110 }}
                            >
                              <option value="none">{t('role_none')}</option>
                              <option value="primary">{t('role_primary')}</option>
                              <option value="substitute">{t('role_substitute')}</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* عدّاد الأساسيين — لازم بالضبط 3 */}
                  <p style={{
                    fontSize: 12,
                    marginTop: 12,
                    fontWeight: 600,
                    color: primaryReviewerIds.length === REQUIRED_PRIMARY_COUNT ? '#22C55E' : '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    {primaryReviewerIds.length === REQUIRED_PRIMARY_COUNT
                      ? <FiCheckCircle size={13} />
                      : <FiAlertTriangle size={13} />}
                    {primaryReviewerIds.length === REQUIRED_PRIMARY_COUNT
                      ? t('primary_count_ok')
                      : `${t('primary_count_bad')}${primaryReviewerIds.length})`}
                  </p>

                  {/* نوع التحكيم */}
                  <div className="editor-field" style={{ marginTop: 12 }}>
                    <label className="editor-label">{t('blinding_type_l')}</label>
                    <select
                      className="editor-select"
                      value={blindingType}
                      onChange={e => setBlindingType(e.target.value)}
                    >
                      <option value="single_blind">{t('single_blind')}</option>
                      <option value="double_blind">{t('double_blind')}</option>
                    </select>
                  </div>

                  <div className="note-editor-btns">
                    <button className="btn-cancel-note" onClick={closeCommitteePanel} disabled={creatingCommittee}>
                      <FiX size={13} />
                      {t('cancel')}
                    </button>
                    <button
                      className="btn-save-note"
                      onClick={handleCreateCommittee}
                      disabled={creatingCommittee || primaryReviewerIds.length !== REQUIRED_PRIMARY_COUNT}
                    >
                      {creatingCommittee ? <FiLoader className="spin-ico" size={13} /> : <FiCheck size={13} />}
                      {creatingCommittee
                        ? t('creating')
                        : `${t('create_committee_btn')} (${primaryReviewerIds.length}/${REQUIRED_PRIMARY_COUNT})`}
                    </button>
                  </div>

                  {committeeError && (
                    <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                      {extractErrorMessage(committeeError, lang) || t('committee_fail')}
                    </p>
                  )}
                </div>
              )}

              {/* زر فتح المحرر — يظهر فقط إذا ما في تقرير أولي بعد ولا فيه محرر مفتوح */}
              {!noteEditorOpen && !initialReview && (
                <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                  <button
                    onClick={openReviewEditor}
                    style={{
                      background: "#C4A55A",
                      color: "#fff",
                      padding: "12px 20px",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "600",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <FiEdit3 size={14} />
                    {lang === 'ar' ? 'إضافة تقرير' : 'Add Report'}
                  </button>
                </div>
              )}

              {noteEditorOpen && (
                <div className="note-editor open">
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                    {t('add_report')}
                  </div>

                  <div className="editor-field">
                    <label className="editor-label">
                      {t("editor_notes")}
                    </label>

                    <textarea
                      className="editor-textarea"
                      rows={6}
                      placeholder={
                        lang === "ar"
                          ? "اكتب ملاحظات المحرر هنا..."
                          : "Write editor notes..."
                      }
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      disabled={savingNote}
                    />
                  </div>

                  {/* ── دروب داون القرار (decision) — قيمتان فقط حالياً ── */}
                  <div style={{ marginTop: 10 }}>
                    <div className="editor-field">
                      <label className="editor-label">
                        {t("editor_decision")}
                      </label>

                      <select
                        className="editor-select"
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        disabled={savingNote}
                      >
                        <option value="">
                          {t("decision_ph")}
                        </option>

                        <option value="REVISION_REQUIRED">
                          {lang === "ar"
                            ? "طلب تعديلات من الباحث"
                            : "Request Revision"}
                        </option>

                        <option value="SEND_TO_COMMITTEE">
                          {lang === "ar"
                            ? "إرسال إلى لجنة التحكيم"
                            : "Send to Committee"}
                        </option>

                      </select>
                    </div>

                    <div className="note-editor-btns">
                      <button
                        className="btn-cancel-note"
                        onClick={cancelReviewEditor}
                        disabled={savingNote}
                      >
                        <FiX size={13} />
                        {t('cancel')}
                      </button>
                      <button
                        className="btn-save-note"
                        onClick={submitReview}
                        disabled={savingNote || !noteText.trim() || !decision}
                      >
                        {savingNote ? <FiLoader className="spin-ico" size={13} /> : <FiCheck size={13} />}
                        {savingNote ? t('saving') : t('save_note')}
                      </button>
                    </div>

                    {!decision && noteText.trim() && (
                      <p style={{ color: '#F59E0B', fontSize: 12, marginTop: 8 }}>
                        {t('decision_missing')}
                      </p>
                    )}

                    {saveError && (
                      <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                        {extractErrorMessage(saveError, lang) || t('save_fail')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}