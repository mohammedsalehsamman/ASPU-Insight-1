import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PiMagnifyingGlassDuotone, PiArchiveDuotone, PiShieldCheckDuotone, PiGitPullRequestDuotone, PiTranslateDuotone, PiChartLineUpDuotone } from "react-icons/pi";
import { FiArrowRight, FiSearch, FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import '../styling/Home.css'
import { GALLERY_IMAGES } from '../MokData/Data';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'
import Logo from '../components/Logo'
import RevealSection from '../components/Home/RevealSection';
import { useLanguage } from '../context/LanguageContext';

export default function ASPUInsight() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [rotateIdx, setRotateIdx] = useState(0);
  const [rotateVisible, setRotateVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { t } = useTranslation();
  const cursorRef = useRef(null);
  const { lang, setLang } = useLanguage();
  const isAr = lang === "ar";

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
    <PiMagnifyingGlassDuotone size={30} />,
    <PiShieldCheckDuotone size={30} />,
    <PiArchiveDuotone size={30} />,
    <PiGitPullRequestDuotone size={30} />,
    <PiChartLineUpDuotone size={30} />,
    <PiTranslateDuotone size={30} />,
  ];

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/research_review?q=${encodeURIComponent(q)}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleChipClick = (chip) => {
    navigate(`/research_review?q=${encodeURIComponent(chip)}`);
  };

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
              {h.cta1} <span className="arr"><FiArrowRight /></span>
            </a>
            <a href="/submit" className="aspu-btn-outline">{h.cta2}</a>
          </div>
        </div>

        <div className="aspu-scroll-hint">
          <span>{h.scroll}</span>
          <div className="aspu-scroll-line" />
        </div>
      </section>

      <div className="aspu-search-zone">
        <div className="aspu-s-wrap">
          <p className="aspu-s-ey">{search.eyebrow}</p>
          <div className="aspu-s-box">
            <span className="aspu-s-ico"><FiSearch /></span>
            <input
              className="aspu-s-inp"
              type="text"
              placeholder={search.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button className="aspu-s-btn" onClick={handleSearch}>
              {search.btn}
            </button>
          </div>
          <div className="aspu-s-chips">
            <span className="aspu-s-clbl">{search.trendLabel}</span>
            {search.chips.map((c, i) => (
              <span
                key={i}
                className="aspu-s-chip"
                style={{ cursor: "pointer" }}
                onClick={() => handleChipClick(c)}
              >
                {c}
              </span>
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
                  <div className="aspu-gb-dot"><FiCheck /></div>
                  <p><strong>{b.strong}</strong> — {b.text}</p>
                </div>
              ))}
            </div>
            <a href="/submit" className="aspu-btn-gold">
              {gallery.cta} <span className="arr"><FiArrowRight /></span>
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