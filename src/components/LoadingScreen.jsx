import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../styling/LoadingScreen.css";

const WORD = "ASPU";
const TYPE_SPEED = 160;
const ERASE_SPEED = 100;
const HOLD_FULL = 700;
const HOLD_EMPTY = 380;

export default function LoadingScreen({ fadeOut = false }) {
  const { t } = useTranslation();
  const [text, setText] = useState("");

  useEffect(() => {
    let timeoutId;
    let mounted = true;

    const schedule = (fn, delay) => {
      timeoutId = setTimeout(() => { if (mounted) fn(); }, delay);
    };

    const typeStep = (i) => {
      setText(WORD.slice(0, i));
      if (i < WORD.length) schedule(() => typeStep(i + 1), TYPE_SPEED);
      else schedule(() => eraseStep(WORD.length), HOLD_FULL);
    };

    const eraseStep = (i) => {
      setText(WORD.slice(0, i));
      if (i > 0) schedule(() => eraseStep(i - 1), ERASE_SPEED);
      else schedule(() => typeStep(0), HOLD_EMPTY);
    };

    typeStep(0);
    return () => { mounted = false; clearTimeout(timeoutId); };
  }, []);

  return (
    <div className={`aspu-splash${fadeOut ? " fade-out" : ""}`} role="status" aria-live="polite">
      <div className="aspu-splash-noise" />
      <div className="aspu-splash-glow" />
      <div className="aspu-splash-content">
        <div className="aspu-splash-word">
          <span>{text}</span>
          <span className="aspu-splash-cursor" />
        </div>
        <div className="aspu-splash-tagline">{t("splash.tagline")}</div>
      </div>
    </div>
  );
}
