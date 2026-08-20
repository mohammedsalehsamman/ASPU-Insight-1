import { useTranslation } from 'react-i18next';

export default function PageHeader({ navigate, papers, loading }) {
  const { t } = useTranslation();
  const rr = t('researchReview', { returnObjects: true });

  return (
    <div className="page-header">
      <div className="ph-inner">
        <div className="ph-breadcrumb">
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--ac)' }}>{rr.breadcrumbHome}</span>
          <span className="ph-sep">›</span>
          <span>{rr.breadcrumbCurrent}</span>
        </div>
        <h1 className="ph-title">{rr.titleLine1}<br />{rr.titleLine2}</h1>
        <p className="ph-sub">
        {rr.sub}
        </p>
        {!loading && (
          <div className="ph-stats-row">
            <div className="ph-stat">
              <div className="ph-stat-n">{papers.length}</div>
              <div className="ph-stat-l">{rr.statPapers}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
