import { PiListBold, PiSquaresFourBold } from 'react-icons/pi';
import { useTranslation } from 'react-i18next';

export default function ResultsBar({ count, isSmartSearch, view, setView }) {
  const { t } = useTranslation();
  const rr = t('researchReview', { returnObjects: true });

  return (
    <div className="results-bar">
      <div className="results-count">
        {rr.showing} <strong>{count}</strong> {rr.papersWord}
        {isSmartSearch && (
          <span style={{ marginRight: 8, fontSize: 12, color: 'var(--ac)' }}>
            {rr.smartSearchTag}
          </span>
        )}
      </div>
      <div className="view-btns">
        <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} title={rr.viewList}>
          <PiListBold size={16} />
        </button>
        <button className={`view-btn ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')} title={rr.viewGrid}>
          <PiSquaresFourBold size={16} />
        </button>
      </div>
    </div>
  );
}
