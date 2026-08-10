export default function ResearchCard({ card, isAr, tr }) {
  const ok = card.approved;
  return (
    <div className="aspu-r-card aspu-r-card--noimg">
      <div className="aspu-r-tags">
        {card.tags.map((tag, i) => (
          <span key={i} className={`aspu-rtag ${tag.cls}`}>
            {isAr ? tag.ar : tag.en}
          </span>
        ))}
      </div>
      <h3 className="aspu-r-h aspu-r-h--noimg">{isAr ? card.titleAr : card.titleEn}</h3>
      <p className="aspu-r-body aspu-r-body--noimg">{isAr ? card.bodyAr : card.bodyEn}</p>
      <div className="aspu-r-meta">
        <span className="aspu-r-au">{isAr ? card.authorAr : card.authorEn}</span>
        <span className="aspu-r-sep">•</span>
        <span>{isAr ? card.discAr : card.discEn}</span>
        <span className="aspu-r-sep">•</span>
        <span>{card.year}</span>
      </div>
      <div className="aspu-r-foot">
        <div className="aspu-int-w">
          <span className="aspu-int-lbl">{tr.simLabel}</span>
          <div className="aspu-int-tr">
            <div
              className={`aspu-int-f ${ok ? "if-ok" : "if-wn"}`}
              style={{ width: card.sim + "%" }}
            />
          </div>
          <span className={`aspu-int-pct ${ok ? "ip-ok" : "ip-wn"}`}>{card.sim}%</span>
          <span className={`aspu-r-badge ${ok ? "b-ok" : "b-pd"}`}>
            {ok ? tr.approved : tr.pending}
          </span>
        </div>
        <span className="aspu-r-stars">
          {"★".repeat(card.stars)}{"☆".repeat(5 - card.stars)}
        </span>
      </div>
    </div>
  );
}