import { List, SquaresFour } from '@phosphor-icons/react';

export default function ResultsBar({ count, isSmartSearch, view, setView }) {
  return (
    <div className="results-bar">
      <div className="results-count">
        عرض <strong>{count}</strong> بحث
        {isSmartSearch && (
          <span style={{ marginRight: 8, fontSize: 12, color: 'var(--ac)' }}>
            (نتائج بحث دلالي AI)
          </span>
        )}
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
  );
}