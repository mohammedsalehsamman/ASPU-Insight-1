export default function PageHeader({ navigate, papers, loading }) {
  return (
    <div className="page-header">
      <div className="ph-inner">
        <div className="ph-breadcrumb">
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--ac)' }}>الرئيسية</span>
          <span className="ph-sep">›</span>
          <span>مراجعة الأبحاث</span>
        </div>
        <h1 className="ph-title">مراجعة الأبحاث<br />المنشورة</h1>
        <p className="ph-sub">
        استعراض شامل لجميع الأبحاث الأكاديمية ضمن المنصة .
        </p>
        {!loading && (
          <div className="ph-stats-row">
            <div className="ph-stat">
              <div className="ph-stat-n">{papers.length}</div>
              <div className="ph-stat-l">بحث</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}