import { Link } from 'react-router-dom';

export default function RecommendationCard({ rec }) {
  return (
    <Link
      to={`/papers/${rec.id}`}
      style={{
        display: 'block',
        padding: '14px 16px',
        border: '1px solid var(--bd)',
        borderRadius: 10,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color .2s',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
        {rec.title}
      </div>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
        {rec.author_name}
      </div>
      {rec.abstract && (
        <div style={{
          fontSize: 12,
          opacity: 0.6,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {rec.abstract}
        </div>
      )}
    </Link>
  );
}
