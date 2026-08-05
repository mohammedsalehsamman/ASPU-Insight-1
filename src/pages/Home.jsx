import { useState, useEffect, useRef, useCallback } from "react";
import { MagnifyingGlass, Archive, ShieldCheck, GitPullRequest, Translate, ChartLineUp } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import '../styling/Home.css'
import { RESEARCH_CARDS, GALLERY_IMAGES } from '../MokData/Data.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx'
import Logo from '../components/Logo.jsx'


function useCounter(target, suffix, inView) {
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

function useInView(threshold = 0.15) {
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

function StatItem({ stat }) {
  const [ref, inView] = useInView(0.3);
  const display = useCounter(stat.n, stat.s, inView);
  return (
    <div ref={ref} className="aspu-stat-c">
      <div className="aspu-stat-n">{display}</div>
      <div className="aspu-stat-l">{stat.l}</div>
    </div>
  );
}

function RevealSection({ sec, isAr }) {
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

function ResearchCard({ card, isAr, tr }) {
  const ok = card.approved;
  return (
    <div className="aspu-r-card">
      <div className="aspu-r-thumb">
        <img src={card.img} alt="" loading="lazy" />
      </div>
      <div className="aspu-r-tags">
        {card.tags.map((tag, i) => (
          <span key={i} className={`aspu-rtag ${tag.cls}`}>
            {isAr ? tag.ar : tag.en}
          </span>
        ))}


      </div>
      <h3 className="aspu-r-h">{isAr ? card.titleAr : card.titleEn}</h3>
      <p className="aspu-r-body">{isAr ? card.bodyAr : card.bodyEn}</p>
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

function ScrollHijack({ isAr, t }) {
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

export default function ASPUInsight() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [rotateIdx, setRotateIdx] = useState(0);
  const [rotateVisible, setRotateVisible] = useState(true);

  const { t, i18n: i18nInst } = useTranslation();
  const cursorRef = useRef(null);
  const lang = i18nInst.language || "ar";
  const isAr = lang === "ar";

  const setLang = useCallback((l) => {
    i18nInst.changeLanguage(l);
    document.documentElement.setAttribute("dir", l === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", l);
  }, [i18nInst]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", isAr ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }, [lang, isAr]);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const rotArr = t("hero.rotate", { returnObjects: true });
  useEffect(() => {
    const iv = setInterval(() => {
      setRotateVisible(false);
      setTimeout(() => {
        setRotateIdx((p) => (p + 1) % rotArr.length);
        setRotateVisible(true);
      }, 320);
    }, 2800);
    return () => clearInterval(iv);
  }, [rotArr.length]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el || window.matchMedia("(pointer:coarse)").matches) {
      if (el) el.style.display = "none";
      return;
    }
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMove, { passive: true });
    let raf;
    const loop = () => {
      cx += (mx - cx) * 0.1;
      cy += (my - cy) * 0.1;
      el.style.left = cx + "px";
      el.style.top = cy + "px";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const h = t("hero", { returnObjects: true });
  const stats = t("stats", { returnObjects: true });
  const search = t("search", { returnObjects: true });
  const sections = t("sections", { returnObjects: true });
  const gallery = t("gallery", { returnObjects: true });
  const features = t("features", { returnObjects: true });
  const footer = t("footer", { returnObjects: true });
  const menuT = t("menu", { returnObjects: true });
  const navT = t("nav", { returnObjects: true });

  const FEAT_ICONS = [
    <MagnifyingGlass size={30} weight="duotone" />,
    <ShieldCheck size={30} weight="duotone" />,
    <Archive size={30} weight="duotone" />,
    <GitPullRequest size={30} weight="duotone" />,
    <ChartLineUp size={30} weight="duotone" />,
    <Translate size={30} weight="duotone" />,
  ];
  return (
    <div
      className={`aspu-root${menuOpen ? " menu-is-open" : ""}`}
      data-lang={lang}
    >
      <div className="aspu-noise" />

      <div ref={cursorRef} className="aspu-cursor-glow" />

      <Navbar
        menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        lang={lang} setLang={setLang}
        hoveredMenu={hoveredMenu} setHoveredMenu={setHoveredMenu}
        scrolled={scrolled}
        isAr={isAr}
        menuT={menuT} navT={navT}
        Logo={Logo}
      />

      <section className="aspu-hero">
        <div className="aspu-hero-grid" />
        <div className="aspu-orb o1" />
        <div className="aspu-orb o2" />
        <div className={`aspu-hero-wm${!isAr ? " en" : ""}`}>{h.watermark}</div>

        <div className="aspu-hero-inner">
          <div className="aspu-issue-badge">
            <span className="aspu-badge-dot" />
            {h.badge}
          </div>

          <h1 className="aspu-hero-title">
            {h.titleLine1}<br />
            {h.titleLine2}{" "}
            <span className="ht-gold">{h.titleHighlight}</span><br />
            <span className={`aspu-ht-rotate${!rotateVisible ? " hide" : ""}`}>
              {rotArr[rotateIdx]}
            </span>
          </h1>

          <p className="aspu-hero-sub">{h.sub}</p>

          <div className="aspu-hero-btns">
            <a className="aspu-btn-gold" href="/research_review">
              {h.cta1} <span className="arr">→</span>
            </a>
            <a href="/submit" className="aspu-btn-outline">{h.cta2}</a>
          </div>
        </div>

        <div className="aspu-scroll-hint">
          <span>{h.scroll}</span>
          <div className="aspu-scroll-line" />
        </div>
      </section>

      <div className="aspu-stats-bar">
        {stats.map((s, i) => <StatItem key={i} stat={s} />)}
      </div>

      <div className="aspu-search-zone">
        <div className="aspu-s-wrap">
          <p className="aspu-s-ey">{search.eyebrow}</p>
          <div className="aspu-s-box">
            <span className="aspu-s-ico">⌕</span>
            <input
              className="aspu-s-inp"
              type="text"
              placeholder={search.placeholder}
            />
            <button className="aspu-s-btn">{search.btn}</button>
          </div>
          <div className="aspu-s-chips">
            <span className="aspu-s-clbl">{search.trendLabel}</span>
            {search.chips.map((c, i) => (
              <span key={i} className="aspu-s-chip">{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="aspu-herotext-wrap">
        {sections.map((sec, i) => (
          <div key={i}>
            <RevealSection sec={sec} isAr={isAr} />
            {i < sections.length - 1 && <div className="aspu-ht-sep" />}
          </div>
        ))}
      </div>

      <ScrollHijack isAr={isAr} t={t} />

      <div className="aspu-gallery-sec">
        <div className="aspu-gallery-inner">
          <div className="aspu-gallery-text">
            <div className="aspu-sec-ey">{gallery.eyebrow}</div>
            <h2>
              {gallery.title.split("\n").map((l, i) => (
                <span key={i}>{l}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p>{gallery.desc}</p>
            <div className="aspu-gallery-bullets">
              {gallery.bullets.map((b, i) => (
                <div key={i} className="aspu-gb-item">
                  <div className="aspu-gb-dot">{b.icon}</div>
                  <p><strong>{b.strong}</strong> — {b.text}</p>
                </div>
              ))}
            </div>
            <a href="/submit" className="aspu-btn-gold">
              {gallery.cta} <span className="arr">→</span>
            </a>
          </div>
          <div className="aspu-gallery-grid">
            {GALLERY_IMAGES.map((img, i) => (
              <div key={i} className={`aspu-gallery-img${img.tall ? " tall" : ""}`}>
                <img src={img.src} alt="" loading="lazy" />
                <div className="aspu-gimg-badge">{gallery.badges[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="aspu-feat-sec">
        <div className="aspu-feat-inner">
          <div className="aspu-feat-header">
            <div className="aspu-feat-ey">{features.eyebrow}</div>
            <h2 className="aspu-feat-title">{features.title}</h2>
          </div>
          <div className="aspu-feat-grid">
            {features.items.map((f, i) => (
              <div key={i} className="aspu-feat-card">
                <div className="aspu-feat-ico">{FEAT_ICONS[i]}</div>
                <div className="aspu-feat-num">{f.num}</div>
                <div className="aspu-feat-h">{f.h}</div>
                <div className="aspu-feat-d">{f.d}</div>
                <span className="aspu-feat-tag">{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer isAr={isAr} footer={footer} Logo={Logo} />
    </div>
  );
}