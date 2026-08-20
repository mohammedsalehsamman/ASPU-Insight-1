import { useEffect, useState } from 'react';
import { PiWarningDuotone, PiXBold } from 'react-icons/pi';
import { getDashboardPaperDetail, getResearchHistory } from '../../api/admin';
import { adminT } from '../../pages/admin/adminI18n';
import { getErrorMessage } from '../../i18n/errorMessages';

export const STATUS_OPTIONS = ['pending', 'under_review', 'plagiarism_failed', 'plagiarism_passed', 'accepted', 'rejected', 'noted', 'published'];

export const STATUS_LABELS = {
  ar: {
    pending: 'بانتظار المراجعة', under_review: 'قيد المراجعة', plagiarism_failed: 'فشل فحص الانتحال',
    plagiarism_passed: 'اجتاز فحص الانتحال', accepted: 'مقبول', rejected: 'مرفوض', noted: 'تمت الملاحظة', published: 'منشور',
  },
  en: {
    pending: 'Pending', under_review: 'Under Review', plagiarism_failed: 'Plagiarism Failed',
    plagiarism_passed: 'Plagiarism Passed', accepted: 'Accepted', rejected: 'Rejected', noted: 'Noted', published: 'Published',
  },
};

export const STATUS_BADGE = {
  pending: 'admin-badge-amber', under_review: 'admin-badge-amber', plagiarism_failed: 'admin-badge-red',
  plagiarism_passed: 'admin-badge-blue', accepted: 'admin-badge-green', rejected: 'admin-badge-red',
  noted: 'admin-badge-blue', published: 'admin-badge-green',
};

export function statusLabel(status, lang) {
  return STATUS_LABELS[lang]?.[status] ?? status;
}

export default function PaperDrawer({ paperId, lang, onClose }) {
  const t = (key) => adminT(lang, key);
  const isAr = lang === 'ar';

  const [paper, setPaper] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getDashboardPaperDetail(paperId),
      getResearchHistory(paperId).catch(() => []),
    ])
      .then(([detail, hist]) => {
        if (cancelled) return;
        setPaper(detail);
        const histArr = Array.isArray(hist) ? hist : (hist?.results ?? detail?.status_history ?? []);
        setHistory(Array.isArray(histArr) ? histArr : []);
      })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err, lang)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [paperId]);

  return (
    <>
      <div className="admin-drawer-overlay open" onClick={onClose} />
      <div className="admin-drawer open">
        <div className="admin-drawer-head">
          <strong>{t('paper_details_title')}</strong>
          <button className="admin-drawer-close" onClick={onClose}><PiXBold size={16} /></button>
        </div>

        <div className="admin-drawer-body">
          {loading && (
            <div className="admin-state-center">
              <div className="admin-spinner" />
              <span>{t('loading')}</span>
            </div>
          )}

          {!loading && error && (
            <div className="admin-state-center">
              <PiWarningDuotone size={30} style={{ color: 'var(--ac)' }} />
              <span className="admin-empty-sub">{String(error)}</span>
            </div>
          )}

          {!loading && !error && paper && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{paper.title}</h2>
              <p style={{ fontSize: 13, color: 'var(--tx2)' }}>{paper.author_name}</p>

              <div className="admin-info-grid">
                <div className="admin-info-cell">
                  <div className="admin-info-label">{t('reference_id')}</div>
                  <div className="admin-info-val">RES-{String(paper.id).padStart(3, '0')}</div>
                </div>
                <div className="admin-info-cell">
                  <div className="admin-info-label">{t('status')}</div>
                  <div className="admin-info-val">
                    <span className={`admin-badge ${STATUS_BADGE[paper.status] ?? 'admin-badge-gray'}`}>
                      {statusLabel(paper.status, lang)}
                    </span>
                  </div>
                </div>
                {paper.plagiarism_score != null && (
                  <div className="admin-info-cell">
                    <div className="admin-info-label">{t('plagiarism_score')}</div>
                    <div className="admin-info-val">{paper.plagiarism_score}%</div>
                  </div>
                )}
                <div className="admin-info-cell">
                  <div className="admin-info-label">{t('paid_open_access')}</div>
                  <div className="admin-info-val">{paper.is_paid_open_access ? t('yes') : t('no')}</div>
                </div>
              </div>

              {paper.abstract && (
                <>
                  <div className="admin-sec-label">{t('abstract_label')}</div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.8, color: 'var(--tx)' }}>{paper.abstract}</p>
                </>
              )}

              <div className="admin-sec-label">{t('status_history')}</div>
              {history.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--tx2)' }}>{t('no_history')}</p>
              ) : (
                history.map((h, i) => (
                  <div className="admin-history-item" key={h.id ?? i}>
                    <div>
                      <strong>{h.new_status ?? h.status ?? h.action ?? '—'}</strong>
                      {h.changed_by_name && <span style={{ color: 'var(--tx2)' }}> — {h.changed_by_name}</span>}
                      {h.created_at && <div style={{ fontSize: 11.5, color: 'var(--tx2)' }}>{new Date(h.created_at).toLocaleString(isAr ? 'ar' : 'en')}</div>}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
