import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { getPapers, submitAssistantReport, getAssistantReview, getPlagiarismReport, suggestKeywords } from "../../api/research";
import "../../styling/EditorAssistant.css"

/* ══════════════════
   SVG LOGO
══════════════════ */
const LogoSVG = () => (
  <svg width="38" height="38" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#0D0F12"/>
    <circle cx="20" cy="19" r="14" fill="none" stroke="#C4A55A" strokeWidth="0.6" opacity="0.5"/>
    <path d="M14,22 Q14,14 20,12 Q26,14 26,22 Q26,28 20,29 Q14,28 14,22 Z" fill="#141820" stroke="#C4A55A" strokeWidth="0.9"/>
    <line x1="20" y1="12" x2="20" y2="29" stroke="#C4A55A" strokeWidth="1"/>
    <polygon points="20,13 16.5,20 23.5,20" fill="#C4A55A"/>
    <line x1="16.4" y1="20" x2="13" y2="24" stroke="#5A8FA0" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="17.5" y1="20" x2="15" y2="25" stroke="#6FA07A" strokeWidth="1" strokeLinecap="round" opacity="0.8"/>
    <line x1="20" y1="20" x2="20" y2="26" stroke="#C4A55A" strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="22.5" y1="20" x2="25" y2="25" stroke="#8B6030" strokeWidth="1" strokeLinecap="round" opacity="0.8"/>
    <line x1="23.6" y1="20" x2="27" y2="24" stroke="#7A5A30" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="20" cy="13" r="1.5" fill="#E8D090"/>
  </svg>
);

/* ══════════════════
   STATUS MAP  ← متوافق مع API values
══════════════════ */
const STATUS_MAP = {
  pending:            { ar: 'بانتظار المراجعة',     en: 'Pending Review',      cls: 'status-pending' },
  under_review:       { ar: 'قيد المراجعة',          en: 'Under Review',        cls: 'status-pending' },
  plagiarism_failed:  { ar: 'فشل فحص الانتحال',     en: 'Plagiarism Failed',   cls: 'status-rejected' },
  plagiarism_passed:  { ar: 'اجتاز فحص الانتحال',   en: 'Plagiarism Passed',   cls: 'status-noted'   },
  accepted:           { ar: 'مقبول',                 en: 'Accepted',            cls: 'status-done'    },
  rejected:           { ar: 'مرفوض',                 en: 'Rejected',            cls: 'status-rejected'},
  noted:              { ar: 'تمت الملاحظة',           en: 'Notes Added',         cls: 'status-noted'   },
};

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
   MAIN COMPONENT
══════════════════ */
export default function EditorAssistant() {
  const [theme, setThemeState] = useState('dark');
  const [lang, setLangState] = useState('ar');

  // ← API state بدل INITIAL_PAPERS
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePaper, setActivePaper] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
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

  /* ── Detail panel ── */
  function openDetail(id) {
    const p = papers.find(x => x.id === id);
    if (!p) return;
    setActivePaper(p);
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
    document.body.style.overflow = 'hidden';
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
    document.body.style.overflow = '';
  }

  /* ── جلب التقرير المخزّن عند الطلب (GET assistant-review) ── */
  async function loadReview() {
    if (!activePaper) return;
    setLoadingReview(true);
    setReviewError(null);
    try {
      const data = await getAssistantReview(activePaper.id);
      setReviewData(Array.isArray(data) ? data : data?.results ?? data);
    } catch (err) {
      setReviewError(err);
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
  const statNoted   = papers.filter(p => p.is_reviewed_by_assistant).length;

  const t = key => {
    const map = {
      total:      { ar: 'إجمالي الأبحاث',             en: 'Total Papers' },
      pending:    { ar: 'بانتظار المراجعة',            en: 'Pending Review' },
      noted:      { ar: 'تمت مراجعتها',                en: 'Reviewed' },
      submitted:  { ar: 'الأبحاث المقدَّمة',           en: 'Submitted Papers' },
      all:        { ar: 'الكل',                        en: 'All' },
      search_ph:  { ar: 'ابحث بالعنوان أو الكاتب...', en: 'Search by title or author...' },
      no_results: { ar: 'لا توجد نتائج',               en: 'No results found' },
      no_sub:     { ar: 'جرّب تغيير الفلتر أو البحث بكلمة أخرى', en: 'Try changing the filter or search keyword' },
      loading:    { ar: 'جارٍ التحميل...',             en: 'Loading...' },
      error:      { ar: 'خطأ في تحميل البيانات',       en: 'Failed to load papers' },
      details:    { ar: 'تفاصيل البحث',                en: 'Paper Details' },
      ref_id:     { ar: 'الرقم المرجعي',               en: 'Reference ID' },
      author:     { ar: 'الباحث',                      en: 'Author' },
      submitted_d:{ ar: 'نوع المراجعة',                en: 'Review Type' },
      status_l:   { ar: 'الحالة',                      en: 'Status' },
      abstract:   { ar: 'الملخص',                      en: 'Abstract' },
      file:       { ar: 'ملف البحث',                   en: 'Research File' },
      download:   { ar: 'تحميل',                       en: 'Download' },
      no_file:    { ar: 'لا يوجد ملف مرفق',            en: 'No file attached' },
      notes_l:    { ar: 'تقرير مساعد المحرر',          en: 'Editor Report' },
      no_notes:   { ar: 'لا يوجد تقرير بعد',           en: 'No report yet' },
      add_note:   { ar: 'أضف تقريرك',                  en: 'Add Your Report' },
      note_ph:    { ar: 'اكتب تقريرك هنا...',          en: 'Write your report here...' },
      cancel:     { ar: 'إلغاء',                       en: 'Cancel' },
      save_note:  { ar: 'حفظ التقرير',                 en: 'Save Report' },
      saving:     { ar: 'جارٍ الحفظ...',               en: 'Saving...' },
      save_fail:  { ar: 'فشل حفظ التقرير، حاول مرة أخرى', en: 'Failed to save report, please try again' },
      plagiarism: { ar: 'درجة الانتحال',               en: 'Plagiarism Score' },
      keywords:   { ar: 'الكلمات المفتاحية',           en: 'AI Keywords' },
      open_access:{ ar: 'وصول مفتوح مدفوع',           en: 'Paid Open Access' },
      yes:        { ar: 'نعم',                         en: 'Yes' },
      no:         { ar: 'لا',                          en: 'No' },
      appearance: { ar: 'المظهر',                      en: 'Appearance' },
      logout:     { ar: 'تسجيل الخروج',               en: 'Logout' },
      menu_l:     { ar: 'القائمة',                     en: 'Menu' },
      close_l:    { ar: 'إغلاق',                       en: 'Close' },
      journal:    { ar: 'المجلة الأكاديمية',           en: 'Academic Journal' },
      role:       { ar: 'مساعد المحرر',                en: 'Assistant Editor' },
      welcome_ar: 'مرحباً،',
      welcome_en: 'Welcome back,',
      papers_await_ar: 'بانتظار مراجعتك',
      papers_await_en: 'await your review',
      sub_ar: 'هنا كل الأبحاث المُقدَّمة حديثاً. اضغط على أي بحث لتطلع على تفاصيله وتضيف تقريرك.',
      sub_en: 'All recently submitted papers are listed below. Click any paper to view details and add your report.',
      plag_report_l: { ar: 'تقرير فحص الانتحال', en: 'Plagiarism Report' },
      plag_load_btn: { ar: 'عرض تقرير الانتحال', en: 'Load Plagiarism Report' },
      plag_pending:  { ar: 'التقرير قيد الإنشاء، حاول لاحقاً', en: 'Report is being generated, try again later' },
      plag_total:    { ar: 'نسبة التشابه الكلية', en: 'Total Similarity' },
      plag_internal: { ar: 'تشابه داخلي', en: 'Internal Similarity' },
      plag_external: { ar: 'تشابه خارجي', en: 'External Similarity' },
      plag_human:    { ar: 'يتطلب مراجعة بشرية', en: 'Requires Human Review' },
      plag_fail:     { ar: 'فشل تحميل تقرير الانتحال، حاول مرة أخرى', en: 'Failed to load plagiarism report, please try again' },
      kw_l:          { ar: 'اقتراح كلمات مفتاحية', en: 'Keyword Suggestions' },
      kw_load_btn:   { ar: 'اقترح كلمات مفتاحية', en: 'Suggest Keywords' },
      kw_none:       { ar: 'لا توجد اقتراحات متاحة حالياً', en: 'No suggestions available right now' },
      kw_fail:       { ar: 'فشل تحميل الكلمات المفتاحية', en: 'Failed to load keyword suggestions' },
      decision_l:    { ar: 'القرار', en: 'Decision' },
      approve:       { ar: 'قبول (APPROVE)', en: 'Approve' },
      reject:        { ar: 'رفض (REJECT)', en: 'Reject' },
      format_ok_l:   { ar: 'الفورمات مطابق للمعايير', en: 'Format is compliant' },
      complete_l:    { ar: 'البحث مكتمل', en: 'Paper is complete' },
      policy_notes_l:{ ar: 'ملاحظات السياسات (اختياري)', en: 'Policy Notes (optional)' },
      policy_ph:     { ar: 'اكتب أي ملاحظات متعلقة بسياسات النشر...', en: 'Any policy-related notes...' },
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
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
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
              <>{t('welcome_ar')} <span className="ht-gold">محمد.</span><br />
                <span className="ht-blue">{statPending} {lang === 'ar' ? 'بحثاً' : 'papers'}</span> {t('papers_await_ar')}</>
            ) : (
              <>{t('welcome_en')} <span className="ht-gold">Mohammad.</span><br />
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
            { key: 'all',     label: t('all') },
            { key: 'pending', label: t('pending') },
            { key: 'noted',   label: t('noted') },
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
              <circle cx="6.5" cy="6.5" r="5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/>
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
                  {/* review_blindness_type بدل dept */}
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
                      <path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round"/>
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
            { title_ar: 'الأبحاث', title_en: 'Research', links: [['آخر الإضافات','Latest'],['الأكثر تقييماً','Top Rated'],['حسب التخصص','By Discipline'],['الأرشيف','Archive']] },
            { title_ar: 'للطلبة',  title_en: 'Students', links: [['تقديم بحث','Submit Paper'],['إرشادات النشر','Guidelines'],['فحص التشابه','Similarity Check']] },
            { title_ar: 'للأساتذة',title_en: 'Faculty',  links: [['لوحة المراجعة','Review Panel'],['تقارير النزاهة','Integrity Reports'],['إدارة اللجنة','Committee']] },
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
                  <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round"/>
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
                  { label: t('ref_id'),     val: `RES-${String(activePaper.id).padStart(3,'0')}` },
                  { label: t('status_l'),   val: lang === 'ar' ? getStatus(activePaper).ar : getStatus(activePaper).en, color: activePaper.is_reviewed_by_assistant ? 'var(--ac2)' : '#F59E0B' },
                  { label: t('plagiarism'), val: activePaper.plagiarism_score != null ? `${activePaper.plagiarism_score}%` : (lang === 'ar' ? 'غير محدد' : 'N/A') },
                  { label: t('open_access'),val: activePaper.is_paid_open_access ? t('yes') : t('no') },
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

              {/* Keyword Suggestions (API خاص بالاقتراح، جنب مربعات الانتحال) */}
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

              {/* PDF File */}
              <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('file')}</div>
              {activePaper.pdf_file ? (
                <div className="dp-pdf-block">
                  <div className="dp-pdf-bar">
                    <div className="dp-pdf-ico">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--ac)" strokeWidth="1.8">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" strokeLinejoin="round"/>
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
                        <path d="M8 2v8M4 10l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {t('download')}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="no-notes-msg">{t('no_file')}</div>
              )}

              {/* Editor Report */}
              <div className="dp-sec-label" style={{ marginTop: 24 }}>{t('notes_l')}</div>
              <div className="dp-notes-wrap">
                {!activePaper.is_reviewed_by_assistant ? (
                  <div className="no-notes-msg">{t('no_notes')}</div>
                ) : reviewData ? (
                  Array.isArray(reviewData) && reviewData.length > 0 ? (
                    reviewData.map((rev, i) => (
                      <div className="note-item" key={rev.id ?? i}>
                        <div className="note-body">
                          {rev.report || rev.report_text || rev.content || rev.body || rev.assistant_editor_report || JSON.stringify(rev)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-notes-msg">{t('no_notes')}</div>
                  )
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
              </div>

              {!activePaper.is_reviewed_by_assistant && !noteEditorOpen && (
                <button className="add-note-btn" onClick={() => { setNoteEditorOpen(true); setSaveError(null); }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/>
                  </svg>
                  {t('add_note')}
                </button>
              )}

              {noteEditorOpen && (
                <div className="note-editor open">
                  {/* القرار: APPROVE / REJECT */}
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

                  {/* الملاحظات الأساسية → تُرسل كـ notes */}
                  <textarea
                    className="note-textarea"
                    placeholder={t('note_ph')}
                    rows={4}
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    autoFocus
                    disabled={savingNote}
                  />

                  {/* checkboxes */}
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

                  {/* policy_notes (اختياري) */}
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
    </div>
  );
}