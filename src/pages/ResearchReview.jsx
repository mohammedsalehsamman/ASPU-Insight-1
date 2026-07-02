import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPapers } from '../api/research';
import '../styling/ResearchReview.css';
import {
  MagnifyingGlass,
  List,
  SquaresFour,
  FilePdf,
  Folder,
  LockOpen,
  Warning,
  ArrowClockwise,
  SlidersHorizontal,
  CaretDown,
  FilePlus,
  ArrowLeft,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';

/* ── Status config ── */
const STATUS_CONFIG = {
  pending:  { ar: 'قيد المراجعة', cls: 'rr-sb-pending'  },
  approved: { ar: 'منشور',        cls: 'rr-sb-approved' },
  rejected: { ar: 'مرفوض',        cls: 'rr-sb-rejected' },
};

/* ── Single paper card ── */
function PaperCard({ paper, onClick }) {
  const st = STATUS_CONFIG[paper.status] ?? STATUS_CONFIG.pending;

  return (
    <div className="rc-paper" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>

      <div className="rcp-top">
        <div className="rcp-tags">
          <span className={`rr-status-badge ${st.cls}`}>
            <span className="rr-badge-dot" />
            {st.ar}
          </span>
          {paper.is_paid_open_access && (
            <span className="rr-oa-badge">
              <LockOpen size={11} weight="bold" /> مفتوح
            </span>
          )}
        </div>
        <span className="rr-paper-id">#{paper.id}</span>
      </div>

      <h3 className="rcp-title">{paper.title}</h3>
      <p className="rcp-excerpt">{paper.abstract}</p>

      <div className="rcp-meta">
        <span className="rcp-author">{paper.author_name}</span>
        <span className="rcp-sep">•</span>
        <span>ASPU</span>
      </div>

      <div className="rr-card-footer">
        <span className="rr-pdf-indicator">
          {paper.pdf_file
            ? <><FilePdf size={14} weight="duotone" /> PDF متوفر</>
            : <><Folder size={14} weight="duotone" /> لا يوجد PDF</>}
        </span>
        <span className="rr-view-more">
          عرض التفاصيل
          <ArrowLeft size={13} weight="bold" />
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function ResearchReview() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const isAr = lang === 'ar';

  const [papers,      setPapers]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState('');
  const [status,      setStatus]      = useState('all');
  const [oaOnly,      setOaOnly]      = useState(false);
  const [view,        setView]        = useState('list');
  const [sideOpen,    setSideOpen]    = useState(false);

  // ── Navbar state ──
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [scrolled,    setScrolled]    = useState(false);

  /* ── Fetch ── */
  const fetchPapers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search)           params.search = search;
      if (status !== 'all') params.status = status;
      if (oaOnly)           params.is_paid_open_access = true;
      const data = await getPapers(params);
      setPapers(Array.isArray(data) ? data : (data.results ?? []));
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
      <div className="page-header">
        <div className="ph-inner">
          <div className="ph-breadcrumb">
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--ac)' }}>الرئيسية</span>
            <span className="ph-sep">›</span>
            <span>مراجعة الأبحاث</span>
          </div>
          <h1 className="ph-title">مراجعة الأبحاث<br />المنشورة</h1>
          <p className="ph-sub">
            استعراض شامل لجميع الأبحاث الأكاديمية — مرتّبة وقابلة للتصفية حسب الحالة والوصول.
          </p>
          {!loading && (
            <div className="ph-stats-row">
              <div className="ph-stat">
                <div className="ph-stat-n">{papers.length}</div>
                <div className="ph-stat-l">بحث</div>
              </div>
              <div className="ph-stat">
                <div className="ph-stat-n">{papers.filter(p => p.status === 'approved').length}</div>
                <div className="ph-stat-l">منشور</div>
              </div>
              <div className="ph-stat">
                <div className="ph-stat-n">{papers.filter(p => p.status === 'pending').length}</div>
                <div className="ph-stat-l">قيد المراجعة</div>
              </div>
              <div className="ph-stat">
                <div className="ph-stat-n">{papers.filter(p => p.is_paid_open_access).length}</div>
                <div className="ph-stat-l">وصول مفتوح</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="page-body">

        {/* Mobile filter toggle */}
        <button className="filter-toggle" onClick={() => setSideOpen(o => !o)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <SlidersHorizontal size={15} weight="duotone" />
            الفلاتر والتصفية
          </span>
          <CaretDown
            size={16}
            weight="bold"
            style={{ transition: 'transform .3s', transform: sideOpen ? 'rotate(180deg)' : 'none' }}
          />
        </button>

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sideOpen ? 'mobile-open' : ''}`}>
          <div>
            <div className="filter-label">بحث</div>
            <div className="sf-search">
              <MagnifyingGlass size={15} weight="duotone" className="sf-ico" />
              <input
                type="text"
                placeholder="عنوان، باحث، كلمة مفتاحية..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="filter-label">الحالة</div>
            <div className="cb-group">
              {[
                { value: 'all',      label: 'الكل'         },
                { value: 'approved', label: 'منشور'        },
                { value: 'pending',  label: 'قيد المراجعة' },
                { value: 'rejected', label: 'مرفوض'        },
              ].map((opt) => (
                <label className="cb-item" key={opt.value}>
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="filter-label">نوع الوصول</div>
            <label className="cb-item">
              <input
                type="checkbox"
                checked={oaOnly}
                onChange={(e) => setOaOnly(e.target.checked)}
              />
              <span>وصول مفتوح مدفوع فقط</span>
            </label>
          </div>

          <button className="reset-btn" onClick={() => { setSearch(''); setStatus('all'); setOaOnly(false); }}>
            إعادة تعيين الفلاتر
          </button>
        </aside>

        {/* ── CONTENT ── */}
        <div className="content-area">

          <div className="results-bar">
            <div className="results-count">
              عرض <strong>{papers.length}</strong> بحث
            </div>
            <div className="view-btns">
              <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} title="قائمة">
                <List size={16} weight="bold" />
              </button>
              <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} title="شبكة">
                <SquaresFour size={16} weight="bold" />
              </button>
            </div>
          </div>

          {loading && (
            <div className="rr-state-center">
              <div className="rr-spinner" />
              <span>جاري التحميل…</span>
            </div>
          )}

          {error && !loading && (
            <div className="rr-state-center">
              <Warning size={36} weight="duotone" style={{ color: 'var(--ac)' }} />
              <span className="rr-error-msg">{error}</span>
              <button
                className="reset-btn"
                style={{ width: 'auto', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 7 }}
                onClick={fetchPapers}
              >
                <ArrowClockwise size={14} weight="bold" />
                إعادة المحاولة
              </button>
            </div>
          )}

          {!loading && !error && papers.length === 0 && (
            <div className="rr-state-center">
              <div className="rr-empty-ico">
                <FilePlus size={48} weight="duotone" style={{ color: 'var(--ac)', opacity: .7 }} />
              </div>

              {hasFilters ? (
                /* فلاتر نشطة */
                <>
                  <span className="rr-empty-title">لا توجد أبحاث تطابق معايير البحث</span>
                  <span className="rr-empty-sub">جرّب تغيير الفلاتر أو مسح نص البحث</span>
                  <button
                    className="reset-btn"
                    style={{ width: 'auto', padding: '9px 22px', marginTop: 4 }}
                    onClick={() => { setSearch(''); setStatus('all'); setOaOnly(false); }}
                  >
                    مسح الفلاتر
                  </button>
                </>
              ) : (
                /* لا يوجد أي بحث */
                <>
                  <span className="rr-empty-title">لا توجد أبحاث منشورة بعد</span>
                  <span className="rr-empty-sub">
                    كن أول من ينشر بحثه على ASPU Insight
                  </span>
                  <button className="rr-submit-cta" onClick={() => navigate('/submit')}>
                    <FilePlus size={16} weight="bold" />
                    نشر بحث جديد
                    <ArrowLeft size={15} weight="bold" />
                  </button>
                </>
              )}
            </div>
          )}

          {!loading && !error && papers.length > 0 && (
            <div className={`research-grid ${view === 'grid' ? 'grid-2col' : ''}`}>
              {papers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onClick={() => navigate(`/papers/${paper.id}`)}
                />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── FOOTER ── */}
      <Footer footer={footer} Logo={Logo} isAr={isAr} />
    </div>
  );
}