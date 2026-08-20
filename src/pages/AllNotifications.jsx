import { useEffect, useState } from "react";
import { notificationsApi } from "../api/useNotifications";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import useNavScroll from "../components/shared/useNavScroll";
import { getFooterContent } from "../components/shared/footerContent";
import { AllNotificationsDict, createLocalT } from "../i18n";
import { getErrorMessage } from "../i18n/errorMessages";
import "../styling/AllNotifications.css";

const LEVEL_COLORS = {
  info: "#3b82f6",
  warning: "#f59e0b",
  success: "#22c55e",
  error: "#ef4444",
};

export default function AllNotifications() {
  const { lang } = useLanguage();
  const { theme } = useTheme();
  const { showError } = useToast();
  const t = createLocalT(AllNotificationsDict, lang);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const navScrolled = useNavScroll();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { data } = await notificationsApi.grouped();
        if (!cancelled) setNotifications(data ?? []);
      } catch (err) {
        if (!cancelled) setError(err);
        console.error("[notifications] failed to load all notifications:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleMarkRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    try {
      await notificationsApi.markRead(id);
    } catch (err) {
      console.error("[notifications] failed to mark notification as read:", err);
      showError(err);
    }
  };

  return (
    <div className={`all-notif-root theme-${theme} lang-${lang}`} dir={lang === "ar" ? "rtl" : "ltr"}>
      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        hoveredMenu={hoveredMenu}
        setHoveredMenu={setHoveredMenu}
        scrolled={navScrolled}
        Logo={Logo}
      />

      <main className="all-notif-page">
        <div className="all-notif-heading">
          <span className="all-notif-kicker">ASPU Insight</span>
          <h1 className="all-notif-title">{t('page_title')}</h1>
        </div>

      {loading ? (
        <div className="all-notif-state">{t('loading')}</div>
      ) : error ? (
        <div className="all-notif-state">{getErrorMessage(error, lang)}</div>
      ) : notifications.length === 0 ? (
        <div className="all-notif-empty">{t('empty')}</div>
      ) : (
        <div className="all-notif-list">
          {notifications.map((n) => {
            const title = n.title || n.data?.fallback_title || t('fallback_title');
            const body = n.body || n.data?.fallback_body || "";
            return (
              <div
                key={n.id}
                className={`all-notif-item${n.is_read ? "" : " unread"}`}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
              >
                <span
                  className="all-notif-dot"
                  style={{ background: LEVEL_COLORS[n.level] || "#888" }}
                />
                <div className="all-notif-content">
                  <div className="all-notif-item-title">
                    {title}
                    {n.count > 1 && (
                      <span className="all-notif-count"> ({n.count})</span>
                    )}
                  </div>
                  <div className="all-notif-item-body">{body}</div>
                  <div className="all-notif-item-time">
                    {new Date(n.created_at).toLocaleString(lang === "ar" ? "ar" : "en")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </main>

      <Footer isAr={lang === "ar"} footer={getFooterContent(lang)} Logo={Logo} />
    </div>
  );
}