import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPapers, smartSearchPapers } from '../api/research';
import '../styling/ResearchReview.css';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import PageHeader from '../components/ResearchReview/PageHeader';
import Sidebar from '../components/ResearchReview/Sidebar';
import ResultsBar from '../components/ResearchReview/ResultsBar';
import EmptyState, { LoadingState, ErrorState } from '../components/ResearchReview/EmptyState';
import PapersGrid from '../components/ResearchReview/PapersGrid';

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function ResearchReview() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const isAr = lang === 'ar';

  const [papers,      setPapers]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState(searchParams.get('q') || '');
  const [status,      setStatus]      = useState('all');
  const [oaOnly,      setOaOnly]      = useState(false);
  const [view,        setView]        = useState('list');
  const [sideOpen,    setSideOpen]    = useState(false);

  // ← يوضّح للمستخدم إنه النتائج جاية من البحث الدلالي (AI) مش البحث العادي
  const [isSmartSearch, setIsSmartSearch] = useState(false);

  // ── Navbar state ──
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [scrolled,    setScrolled]    = useState(false);

  /* ── Fetch ── */
  const fetchPapers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const trimmedSearch = search.trim();

      if (trimmedSearch) {
        // ← بحث دلالي (Smart Search) — بياخد q فقط، فبنطبّق فلاتر الحالة/الوصول محليًا بعدين
        setIsSmartSearch(true);
        const data = await smartSearchPapers(trimmedSearch);
        let results = Array.isArray(data) ? data : (data.results ?? []);

        if (status !== 'all') {
          results = results.filter((p) => p.status === status);
        }
        if (oaOnly) {
          results = results.filter((p) => p.is_paid_open_access);
        }
        setPapers(results);
      } else {
        // ← بحث/تصفية عادية عبر الـ API الأساسي
        setIsSmartSearch(false);
        const params = {};
        if (status !== 'all') params.status = status;
        if (oaOnly)           params.is_paid_open_access = true;
        const data = await getPapers(params);
        setPapers(Array.isArray(data) ? data : (data.results ?? []));
      }
    } catch (err) {
      setError(err.message || 'خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [search, status, oaOnly]);

  useEffect(() => {
    const t = setTimeout(fetchPapers, 300);
    return () => clearTimeout(t);
  }, [fetchPapers]);

  // ← يحدّث الرابط كل ما يتغيّر نص البحث (يخليه قابل للمشاركة وللرجوع بالـ back button)
  useEffect(() => {
    if (search.trim()) {
      setSearchParams({ q: search }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [search, setSearchParams]);

  /* ── Scroll ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Cursor glow ── */
  useEffect(() => {
    const el = document.getElementById('rr-cg');
    if (!el || window.matchMedia('(pointer:coarse)').matches) {
      if (el) el.style.display = 'none';
      return;
    }
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', onMove, { passive: true });
    let raf;
    const loop = () => {
      cx += (mx - cx) * .1; cy += (my - cy) * .1;
      el.style.left = cx + 'px'; el.style.top = cy + 'px';
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  const footer = t('footer', { returnObjects: true });
  const hasFilters = search || status !== 'all' || oaOnly;

  const handleResetFilters = () => {
    setSearch('');
    setStatus('all');
    setOaOnly(false);
  };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} lang={lang}>
      <div id="rr-cg" />

      {/* ── NAVBAR ── */}
      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        hoveredMenu={hoveredMenu}
        setHoveredMenu={setHoveredMenu}
        scrolled={scrolled}
        Logo={Logo}
      />

      {/* ── PAGE HEADER ── */}
      <PageHeader navigate={navigate} papers={papers} loading={loading} />

      {/* ── BODY ── */}
      <div className="page-body">

        <Sidebar
          search={search} setSearch={setSearch}
          status={status} setStatus={setStatus}
          oaOnly={oaOnly} setOaOnly={setOaOnly}
          sideOpen={sideOpen} setSideOpen={setSideOpen}
          onReset={handleResetFilters}
        />

        {/* ── CONTENT ── */}
        <div className="content-area">

          <ResultsBar
            count={papers.length}
            isSmartSearch={isSmartSearch}
            view={view}
            setView={setView}
          />

          {loading && <LoadingState />}

          {error && !loading && (
            <ErrorState error={error} onRetry={fetchPapers} />
          )}

          {!loading && !error && papers.length === 0 && (
            <EmptyState
              hasFilters={hasFilters}
              onClearFilters={handleResetFilters}
              onSubmit={() => navigate('/submit')}
            />
          )}

          {!loading && !error && papers.length > 0 && (
            <PapersGrid
              papers={papers}
              view={view}
              onPaperClick={(id) => navigate(`/papers/${id}`)}
            />
          )}

        </div>
      </div>

      {/* ── FOOTER ── */}
      <Footer footer={footer} Logo={Logo} isAr={isAr} />
    </div>
  );
}