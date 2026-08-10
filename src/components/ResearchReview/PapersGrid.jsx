import PaperCard from '../PaperCard';

export default function PapersGrid({ papers, view, onPaperClick }) {
  return (
    <div className={`research-grid ${view === 'grid' ? 'grid-2col' : ''}`}>
      {papers.map((paper) => (
        <PaperCard
          key={paper.id}
          paper={paper}
          onClick={() => onPaperClick(paper.id)}
        />
      ))}
    </div>
  );
}