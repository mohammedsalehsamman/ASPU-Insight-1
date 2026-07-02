import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  getPapers,
  getEditorReviewInitial,
  submitEditorReviewInitial,
  getAvailableReviewers,
  createCommittee,
  // getEditorReviewFinal,      // ⏸ معطّل مؤقتاً — رح يترجع لما تصير اللجنة جاهزة
  // submitEditorReviewFinal,   // ⏸ معطّل مؤقتاً — رح يترجع لما تصير اللجنة جاهزة
} from "../../api/research";
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
   خيارات القرار (decision) — نفس القيم يلي بيتوقعها الباك
   ⚠ القيم (value) لازم تطابق enum الباك حرفياً
══════════════════ */
const DECISION_OPTIONS = [
  { value: 'REVISION_REQUIRED', ar: 'طلب تعديلات', en: 'Request Changes' },
  { value: 'SEND_TO_COMMITTEE', ar: 'إرسال للجنة', en: 'Send to Committee' },
];

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
   MAIN COMPONENT
══════════════════ */
export default function Editor() {
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

  // ← لجنة التحكيم (تظهر فقط إذا decision === SEND_TO_COMMITTEE)
  const [committeePanelOpen, setCommitteePanelOpen] = useState(false);
  const [availableReviewers, setAvailableReviewers] = useState([]);
  const [loadingReviewers, setLoadingReviewers] = useState(false);
  const [reviewersError, setReviewersError] = useState(null);
  const [selectedReviewerIds, setSelectedReviewerIds] = useState([]);
  const [creatingCommittee, setCreatingCommittee] = useState(false);
  const [committeeError, setCommitteeError] = useState(null);
  const [committeeSuccess, setCommitteeSuccess] = useState(false);

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
    // ← تصفير حالة اللجنة
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

  /* ── إنشاء اللجنة ─────────────────────────────────
     ⚠ شكل الـ payload تحت هو افتراض (reviewer_ids: [...]).
     لازم تتأكد من الباك (Postman) شو اسم الحقل المتوقع بالضبط
     قبل ما تعتمدها نهائياً */
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
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="menu-body">
          <div className={`menu-links ${previewIdx !== null ? 'has-hover' : ''}`}>
            {['الرئيسية|HOME', 'الأبحاث|RESEARCH', 'الباحثون|RESEARCHERS', 'النزاهة|INTEGRITY', 'تواصل معنا|CONTACT'].map((item, i) => {
              const [ar, en] = item.split('|');
              return (
                <div className="ml-wrap" key={i}>
                  <a
                    className={`menu-link${previewIdx === i ? ' hov' : ''}`}
                    href="#"
                    ref={el => menuLinksRef.current[i] = el}
                    onMouseEnter={() => setPreviewIdx(i)}
                    onMouseLeave={() => setPreviewIdx(null)}
                  >
                    <div className="ml-row">
                      <span className="ml-name">{lang === 'ar' ? ar : en}</span>
                      <span className="ml-num">0{i + 1}</span>
                    </div>
                    <span className="ml-sub">{lang === 'ar' ? 'استعرض' : 'EXPLORE'}</span>
                  </a>
                </div>
              );
            })}
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
            <button className={`mtp-btn ${theme === 'dark' ? 'on' : ''}`} onClick={() => setThemeState('dark')}>🌙</button>
            <button className={`mtp-btn ${theme === 'light' ? 'on' : ''}`} onClick={() => setThemeState('light')}>☀️</button>
          </div>
          <div className="menu-tpill">
            <button className={`mtp-btn ${lang === 'ar' ? 'on' : ''}`} onClick={() => setLangState('ar')}>ع</button>
            <button className={`mtp-btn ${lang === 'en' ? 'on' : ''}`} onClick={() => setLangState('en')}>EN</button>
          </div>
          <button className="menu-login-btn">{t('logout')} →</button>
        </div>
      </div>

      {/* ══ NAVBAR ══ */}
      <nav className={`ea-nav ${navScrolled ? 'scrolled' : ''}`}>
        <a href="#" className="nav-logo">
          <LogoSVG />
          <div>
            <div className="logo-n">ASPU Insight</div>
            <div className="logo-s">{t('journal')}</div>
          </div>
        </a>
        <div className="nav-space" />
        <button className={`nav-menu-btn ${menuOpen ? 'is-open' : ''}`} onClick={openMenu}>
          <span className="nmb-label">{t('menu_l')}</span>
          <div className="nmb-lines">
            <div className="nmb-line l1" />
            <div className="nmb-line l2" />
            <div className="nmb-line l3" />
          </div>
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
            <span className="badge-active">● ACTIVE</span>
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
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--ac)" strokeWidth="1.8">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
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
                      <svg width="12" height="12" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                        <path d="M8 2v8M4 10l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t('download')}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="no-notes-msg">{t('no_file')}</div>
              )}

              {/* ══ Editor Report — Initial only (Final مؤجّلة لحد ما تصير اللجنة جاهزة) ══ */}
              <div className="editor-field">
                <label className="editor-label">
                  {t("assistant_report")}
                </label>

                {/* ✅ FIX #1: كان عم يتشيك على activePaper.assistant_report
                    (حقل غير موجود بالـ API response) بدل activePaper.assistant_editor_report
                    (الحقل الحقيقي)، فكان دايماً بيطلع "لا يوجد تقرير بعد" */}
                <div className="assistant-report-box">
                  {activePaper?.assistant_editor_report
                    ? activePaper.assistant_editor_report
                    : t("no_notes")}
                </div>
              </div>

              <div className="dp-sec-label" style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
                {t('initial_notes')}
              </div>
              <div className="dp-notes-wrap">
                {loadingInitialReview ? (
                  <div className="no-notes-msg">{t('loading')}</div>
                ) : initialReviewError ? (
                  <p style={{ color: '#EF4444', fontSize: 12 }}>{t('load_fail')}</p>
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

              {/* ══ زر عرض اللجنة — يظهر فقط لو القرار SEND_TO_COMMITTEE ══ */}
              {initialReview?.decision === 'SEND_TO_COMMITTEE' && !committeePanelOpen && !committeeSuccess && (
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
                    marginTop: 16,
                  }}
                >
                  {lang === 'ar' ? 'استعراض الأعضاء المحتملين للتحكيم' : 'View Potential Committee Members'}
                </button>
              )}

              {committeeSuccess && (
                <p style={{ color: '#22C55E', fontSize: 13, marginTop: 12, fontWeight: 600 }}>
                  {lang === 'ar' ? '✓ تم إنشاء اللجنة بنجاح' : '✓ Committee created successfully'}
                </p>
              )}

              {committeePanelOpen && (
                <div className="note-editor open" style={{ marginTop: 16 }}>
                  <div className="dp-sec-label">
                    {lang === 'ar' ? 'اختر أعضاء اللجنة' : 'Select Committee Members'}
                  </div>

                  {loadingReviewers ? (
                    <div className="no-notes-msg">{t('loading')}</div>
                  ) : reviewersError ? (
                    <p style={{ color: '#EF4444', fontSize: 12 }}>
                      {lang === 'ar' ? 'فشل تحميل المراجعين المتاحين' : 'Failed to load available reviewers'}
                    </p>
                  ) : availableReviewers.length === 0 ? (
                    <div className="no-notes-msg">
                      {lang === 'ar' ? 'لا يوجد مراجعون متاحون حالياً' : 'No available reviewers'}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      {availableReviewers.map(r => (
                        <label
                          key={r.user_id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            border: '1px solid var(--border)',
                            borderRadius: 10,
                            padding: '10px 12px',
                            cursor: 'pointer',
                            background: selectedReviewerIds.includes(r.user_id) ? 'var(--card-bg)' : 'transparent',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedReviewerIds.includes(r.user_id)}
                            onChange={() => toggleReviewer(r.user_id)}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>
                              {r.full_name}{' '}
                              <span style={{ opacity: 0.55, fontWeight: 400, fontSize: 12 }}>#{r.user_id}</span>
                            </span>
                            <span style={{ fontSize: 12, opacity: 0.7 }}>
                              {r.email}{r.institution ? ` · ${r.institution}` : ''}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="note-editor-btns">
                    <button className="btn-cancel-note" onClick={closeCommitteePanel} disabled={creatingCommittee}>
                      {t('cancel')}
                    </button>
                    <button
                      className="btn-save-note"
                      onClick={handleCreateCommittee}
                      disabled={creatingCommittee || selectedReviewerIds.length === 0}
                    >
                      {creatingCommittee
                        ? (lang === 'ar' ? 'جارٍ الإنشاء...' : 'Creating...')
                        : (lang === 'ar' ? `إنشاء اللجنة (${selectedReviewerIds.length})` : `Create Committee (${selectedReviewerIds.length})`)}
                    </button>
                  </div>

                  {committeeError && (
                    <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>
                      {lang === 'ar' ? 'فشل إنشاء اللجنة، حاول مرة أخرى' : 'Failed to create committee, please try again'}
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
                      fontWeight: "600"
                    }}
                  >
                    إضافة تقرير
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
                        {t('cancel')}
                      </button>
                      <button
                        className="btn-save-note"
                        onClick={submitReview}
                        disabled={savingNote || !noteText.trim() || !decision}
                      >
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
                        {t('save_fail')}
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