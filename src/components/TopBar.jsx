import Logo from "../components/Logo"
import { useTranslation } from 'react-i18next';

export default function TopBar({ lang, setLang }) {
  const { t } = useTranslation();
  const top = t('auth.topbar', { returnObjects: true });
  return (
    <header className="auth-topbar">
      <a href="/" className="auth-tb-logo">
        <Logo/>
        <div>
          <div className="auth-tb-name">ASPU Insight</div>
          <div className="auth-tb-sub">{top.sub}</div>
        </div>
      </a>

      <div className="auth-pill">
        <button className={`auth-pill-btn ${lang === "ar" ? "on" : ""}`} onClick={() => setLang("ar")}>ع</button>
        <button className={`auth-pill-btn ${lang === "en" ? "on" : ""}`} onClick={() => setLang("en")}>EN</button>
      </div>
    </header>
  );
}
