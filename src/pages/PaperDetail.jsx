import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPaper } from '../api/research';
import DeletePaperButton from '../components/DeletePaperButton';
import '../styling/PaperDetail.css';
import {
  FaFileAlt, FaSearch, FaFlagCheckered, FaExclamationTriangle,
  FaLockOpen, FaDownload, FaFolderOpen, FaCheck, FaEdit,
  FaClipboard,
} from 'react-icons/fa';

/* ── Status config ── */
const STATUS_CONFIG = {
  pending: {
    ar: 'قيد المراجعة',
    en: 'Pending Review',
    badgeCls: 'pd-sb-pending',
    metaCls: 'pd-meta-val--gold',
  },
  approved: {
    ar: 'منشور',
    en: 'Approved',
    badgeCls: 'pd-sb-approved',
    metaCls: 'pd-meta-val--green',
  },
  rejected: {
    ar: 'مرفوض',
    en: 'Rejected',
    badgeCls: 'pd-sb-rejected',
    metaCls: 'pd-meta-val--red',
  },
};

/* ── Timeline steps ── */
const TIMELINE_STEPS = [
  {
    ar: 'تقديم البحث',
    en: 'Submitted',
    subAr: 'تم التقديم بنجاح',
    subEn: 'Successfully submitted',
    icon: <FaFileAlt />,
  },
  {
    ar: 'قيد المراجعة',
    en: 'Under Review',
    subAr: 'قيد مراجعة المحكمين',
    subEn: 'Awaiting peer review',
    icon: <FaSearch />,
  },
  {
    ar: 'القرار النهائي',
    en: 'Final Decision',
    subAr: (status) =>
      status === 'approved' ? 'تم القبول والنشر' : status === 'rejected' ? 'تم رفض البحث' : 'في انتظار القرار',
    subEn: (status) =>
      status === 'approved' ? 'Accepted & published' : status === 'rejected' ? 'Paper was rejected' : 'Awaiting decision',
    icon: <FaFlagCheckered />,
  },
];

/* ── Helper: resolve step dot class ── */
function getStepDotCls(stepIndex, status) {
  const activeIdx = status === 'pending' ? 1 : 2;
  if (stepIndex === 0) return 'pd-st-dot--done';
  if (stepIndex < activeIdx) return 'pd-st-dot--done';
  if (stepIndex === activeIdx) return 'pd-st-dot--active';
  return 'pd-st-dot--idle';
}

/* ═══════════════════════════════════════
   COMPONENT
═══════════════════════════════════════ */
export default function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── Fetch ── */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPaper(id)
      .then((data) => { if (!cancelled) setPaper(data); })
      .catch((err) => { if (!cancelled) setError(err.message || 'حدث خطأ في جلب البيانات'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  /* ── Copy link ── */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  /* LOADING STATE */
  if (loading) {
    return (
      <div className="pd-state-center">
        <div className="pd-spinner" />
        <span>جاري التحميل…</span>
      </div>
    );
  }

  /* ERROR STATE */
  if (error) {
    return (
      <div className="pd-state-center">
        <span className="pd-error-ico"><FaExclamationTriangle /></span>
        <span className="pd-error-msg">{error}</span>
        <button className="pd-retry-btn" onClick={() => window.location.reload()}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!paper) return null;

  const st = STATUS_CONFIG[paper.status] ?? STATUS_CONFIG.pending;

  /* RENDER */
  return (
    <>
      {/* ── PAGE HEADER ── */}
      <div className="pd-page-header">
        <div className="pd-ph-inner">

          <nav className="pd-breadcrumb" aria-label="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <span className="pd-breadcrumb-sep">›</span>
            <Link to="/papers">الأبحاث</Link>
            <span className="pd-breadcrumb-sep">›</span>
            <span>تفاصيل البحث</span>
          </nav>

          <div className="pd-badges">
            <span className={`pd-status-badge ${st.badgeCls}`}>
              <span className="pd-badge-dot" />
              {st.ar}
            </span>

            {paper.is_paid_open_access && (
              <span className="pd-oa-badge"><FaLockOpen size={12} /> وصول مفتوح مدفوع</span>
            )}

            <span className="pd-paper-id"># PAPER-{String(paper.id).padStart(4, '0')}</span>
          </div>

          <h1 className="pd-title">{paper.title}</h1>

          <div className="pd-author-row">
            <div className="pd-author-chip">
              <span className="pd-chip-dot" />
              <span>الباحث:</span>
              <span className="pd-chip-email">{paper.author_name}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── PAGE BODY ── */}
      <div className="pd-page-body">

        <div className="pd-main-col">

          <div className="pd-detail-card">
            <div className="pd-section-label">الملخص</div>
            <p className="pd-abstract-text">{paper.abstract}</p>
          </div>

          <div className="pd-detail-card">
            <div className="pd-section-label">ملف البحث</div>
            {paper.pdf_file ? (
              <div className="pd-pdf-available">
                <div className="pd-pdf-icon"><FaFileAlt /></div>
                <div className="pd-pdf-info">
                  <div className="pd-pdf-name">{paper.pdf_file}</div>
                  <div className="pd-pdf-sub">ملف PDF مرفق</div>
                </div>
                
                <a
                  href={paper.pdf_file}
                  target="_blank"
                  rel="noreferrer"
                  className="pd-pdf-download-btn"
                >
                  <FaDownload size={12} /> تحميل
                </a>
              </div>
            ) : (
              <div className="pd-pdf-missing">
                <span className="pd-pdf-missing-icon"><FaFolderOpen /></span>
                <span>لم يتم إرفاق ملف PDF بعد</span>
              </div>
            )}
          </div>

          {paper.status === 'rejected' && paper.rejection_reason && (
            <div className="pd-rejection-box">
              <div className="pd-rejection-label">سبب الرفض</div>
              <p className="pd-rejection-text">{paper.rejection_reason}</p>
            </div>
          )}

        </div>

        <div className="pd-side-col">

          <div className="pd-meta-card">
            <div className="pd-section-label">معلومات البحث</div>

            <div className="pd-meta-row">
              <span className="pd-meta-key">رقم البحث</span>
              <span className="pd-meta-val pd-meta-val--gold">#{paper.id}</span>
            </div>

            <div className="pd-meta-row">
              <span className="pd-meta-key">الحالة</span>
              <span className={`pd-meta-val ${st.metaCls}`}>{st.ar}</span>
            </div>

            <div className="pd-meta-row">
              <span className="pd-meta-key">نوع الوصول</span>
              <span className="pd-meta-val">
                {paper.is_paid_open_access ? (
                  <span className="pd-oa-indicator pd-oa-yes"><FaLockOpen size={12} /> مفتوح مدفوع</span>
                ) : (
                  <span className="pd-oa-indicator pd-oa-no">مغلق</span>
                )}
              </span>
            </div>

            <div className="pd-meta-row">
              <span className="pd-meta-key">الباحث</span>
              <span className="pd-meta-val pd-meta-val--blue">{paper.author_name}</span>
            </div>

            <div className="pd-meta-row">
              <span className="pd-meta-key">ملف PDF</span>
              <span className="pd-meta-val">
                {paper.pdf_file ? (
                  <>متوفر <FaCheck size={11} /></>
                ) : (
                  'غير مرفق'
                )}
              </span>
            </div>
          </div>

          <div className="pd-meta-card">
            <div className="pd-section-label">مسار الحالة</div>
            <div className="pd-status-track">
              {TIMELINE_STEPS.map((step, i) => {
                const dotCls = getStepDotCls(i, paper.status);
                const sub =
                  typeof step.subAr === 'function'
                    ? step.subAr(paper.status)
                    : step.subAr;

                return (
                  <div className="pd-st-step" key={i}>
                    <div className={`pd-st-dot ${dotCls}`}>
                      {dotCls === 'pd-st-dot--done' ? <FaCheck /> : step.icon}
                    </div>
                    <div className="pd-st-info">
                      <div className="pd-st-name">{step.ar}</div>
                      <div className="pd-st-sub">{sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pd-action-card">
            <div className="pd-section-label">الإجراءات</div>

            <button
              className="pd-action-btn pd-btn-secondary"
              onClick={() => navigate(`/papers/${id}/edit`)}
            >
              <span><FaEdit /></span>
              <span>تعديل البحث</span>
            </button>

            <button
              className="pd-action-btn pd-btn-secondary"
              onClick={handleCopyLink}
            >
              <span><FaClipboard /></span>
              <span>نسخ الرابط</span>
            </button>

            <DeletePaperButton id={id} redirectTo="/papers" />
          </div>

        </div>
      </div>
    </>
  );
}