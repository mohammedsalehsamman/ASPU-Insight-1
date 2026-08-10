import { useState, useEffect, useRef } from "react";
import { RESEARCH_CARDS } from '../../MokData/Data.js';
import ResearchCard from './ResearchCard';

export default function ScrollHijack({ isAr, t }) {
  const wrapRef = useRef(null);
  const stripRef = useRef(null);

  const N = RESEARCH_CARDS.length;
  const SPC = 420;
  const TOT = SPC * (N - 1);

  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const wrapper = wrapRef.current;
    const strip = stripRef.current;
    if (!wrapper || !strip) return;

    wrapper.style.height = `calc(100vh + ${TOT}px)`;

    function setSizes() {
      const w = strip.parentElement.offsetWidth;
      strip.style.width = `${N * w}px`;
      strip.querySelectorAll(".aspu-sh-slide").forEach((s) => {
        s.style.width = w + "px";
      });
    }

    setSizes();
    window.addEventListener("resize", setSizes);

    let off = 0;
    let rafId;

    function tick() {
      const rect = wrapper.getBoundingClientRect();
      const scrolled = Math.max(0, -rect.top);
      const clamped = Math.min(TOT, scrolled);
      const trackW = strip.parentElement.offsetWidth;

      const target = (clamped / SPC) * trackW;

      off += (target - off) * 0.1;

      const isRtl = document.documentElement.getAttribute("dir") === "rtl";
      strip.style.transform = `translateX(${(isRtl ? 1 : -1) * off}px)`;

      const cf = clamped / SPC;
      const newIdx = Math.min(N - 1, Math.round(cf));
      const newPct = Math.min(1, N > 1 ? cf / (N - 1) : 0) * 100;

      setIdx(newIdx);
      setPct(newPct);

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", setSizes);
      cancelAnimationFrame(rafId);
    };
  }, [N, TOT]);

  const tr = t("research", { returnObjects: true });

  return (
    <div ref={wrapRef} className="aspu-sh-wrapper">
      <div className="aspu-sh-sticky">

        <div className="aspu-sh-header">
          <div>
            <div className="aspu-sh-ey">{tr.eyebrow}</div>
            <h2 className="aspu-sh-h2">{tr.title}</h2>
          </div>
          <div className="aspu-sh-meta">
            <span className="aspu-sh-counter">{idx + 1} / {N}</span>
            <div className="aspu-sh-dots">
              {Array.from({ length: N }).map((_, i) => (
                <div key={i} className={`aspu-sh-dot${i === idx ? " on" : ""}`} />
              ))}
            </div>
            <div className="aspu-sh-pbar">
              <div className="aspu-sh-pfill" style={{ width: pct + "%" }} />
            </div>
          </div>
        </div>

        <div className="aspu-sh-track">
          <div ref={stripRef} className="aspu-sh-strip">
            {RESEARCH_CARDS.map((card, i) => (
              <div key={i} className="aspu-sh-slide">
                <ResearchCard card={card} isAr={isAr} tr={tr} />
              </div>
            ))}
          </div>
        </div>

        <div className="aspu-sh-foot">
          <p className="aspu-sh-hint">{tr.scrollHint}</p>
          <a
            className="aspu-btn-gold sm"
            href="/research_review"
          >
            {tr.viewAll} <span className="arr">→</span>
          </a>
        </div>

      </div>
    </div>
  );
}