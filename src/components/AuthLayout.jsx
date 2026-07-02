import { useTranslation } from 'react-i18next';
import TopBar from "./TopBar";
import AccentPanel from "./AccentPanel";

export default function AuthLayout({ lang, setLang, children, step, activeTab, onTabChange }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const { t } = useTranslation();
  const titles = t('auth.titles', { returnObjects: true });
  const subs = t('auth.subs', { returnObjects: true });
  const showTabs = step === "login" || step === "register";

  return (
    <div className="auth-root" dir={dir}>
      <TopBar lang={lang} setLang={setLang} />
      <main className="auth-page">
        <div className="auth-container">
          <AccentPanel lang={lang} />
          <div className="auth-form-panel">
            <a href="/" className="auth-back">{t('auth.common.backToHome')}</a>
            {showTabs && (
              <div className="auth-tabs">
                <button className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
                  onClick={() => onTabChange("login")}>{t('auth.tabs.login')}</button>
                <button className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
                  onClick={() => onTabChange("register")}>{t('auth.tabs.register')}</button>
              </div>
            )}
            <div className="auth-fh auth-panel">
              <h2 className="auth-ftitle">{titles[step]}</h2>
              {subs[step] && <p className="auth-fsub">{subs[step]}</p>}
            </div>
            <div className="auth-panel">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}