import { useState, useEffect, useRef } from "react";

export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function RevealSection({ sec, isAr }) {
  const [ref, inView] = useInView(0.2);
  return (
    <div ref={ref} className="aspu-ht-section">
      <div className={`aspu-ht-meta ${inView ? "visible" : ""}`}>
        <div className="aspu-ht-dot" />
        <span className="aspu-ht-num">{sec.num}</span>
        <div className={`aspu-ht-rule ${inView ? "visible" : ""}`} />
        <span className={`aspu-ht-tag ${inView ? "visible" : ""}`}>
          {isAr ? "استعرض" : "EXPLORE"}
        </span>
      </div>
      <div className="aspu-ht-wm">{sec.num}</div>
      <div className="aspu-ht-headline">
        {sec.lines.map((line, i) => (
          <div className="aspu-ht-lw" key={i}>
            <span
              className={`aspu-ht-line${i === sec.accent ? " accent" : ""}${inView ? " visible" : ""}`}
              style={{ transitionDelay: inView ? `${0.1 + i * 0.1}s` : "0s" }}
            >
              {line}
            </span>
          </div>
        ))}
      </div>
      <p className={`aspu-ht-body ${inView ? "visible" : ""}`}>{sec.body}</p>
    </div>
  );
}