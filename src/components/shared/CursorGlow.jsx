import { useEffect, useRef } from 'react';

// ← تأثير الهالة يلي بتتبع الماوس، معطّل تلقائياً على الشاشات اللمسية
export default function CursorGlow() {
  const cgRef = useRef(null);

  useEffect(() => {
    const el = cgRef.current;
    if (!el || window.matchMedia('(pointer:coarse)').matches) { if (el) el.style.display = 'none'; return; }
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    const move = e => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', move, { passive: true });
    let raf;
    const loop = () => {
      cx += (mx - cx) * 0.1; cy += (my - cy) * 0.1;
      el.style.left = cx + 'px'; el.style.top = cy + 'px';
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  }, []);

  return <div className="ea-cg" ref={cgRef} />;
}
