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


export function useCounter(target, suffix, inView) {
  const [val, setVal] = useState(0);
  const ran = useRef(false);
  useEffect(() => {
    if (!inView || ran.current) return;
    ran.current = true;
    const dur = 1800, start = performance.now();
    const ease = (p) => 1 - Math.pow(1 - p, 3);
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setVal(Math.round(ease(p) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);
  return val.toLocaleString() + suffix;
}

export default function StatItem({ stat }) {
  const [ref, inView] = useInView(0.3);
  const display = useCounter(stat.n, stat.s, inView);
  return (
    <div ref={ref} className="aspu-stat-c">
      <div className="aspu-stat-n">{display}</div>
      <div className="aspu-stat-l">{stat.l}</div>
    </div>
  );
}