import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    FiBell,
    FiCheck,
    FiCheckCircle,
    FiAlertTriangle,
    FiInfo,
    FiXCircle,
} from "react-icons/fi";
import { useNotifications } from "../api/useNotifications";
import "../styling/NotificationBell.css";
import { useNavigate } from "react-router-dom";


// أيقونة + لون حسب مستوى الإشعار (warning / info / success / error)
const LEVEL_META = {
    warning: { Icon: FiAlertTriangle, className: "warning" },
    info: { Icon: FiInfo, className: "info" },
    success: { Icon: FiCheckCircle, className: "success" },
    error: { Icon: FiXCircle, className: "error" },
};



function getLevelMeta(level) {
    return LEVEL_META[level] || LEVEL_META.info;
}

// وقت نسبي بسيط (عربي/إنجليزي)
function formatRelativeTime(isoString, lang) {
    const then = new Date(isoString).getTime();
    const now = Date.now();
    const diffSec = Math.max(0, Math.floor((now - then) / 1000));

    const units = [
        { limit: 60, div: 1, ar: "الآن", en: "just now" },
        { limit: 3600, div: 60, ar: "د", en: "m" },
        { limit: 86400, div: 3600, ar: "س", en: "h" },
        { limit: 2592000, div: 86400, ar: "ي", en: "d" },
    ];

    if (diffSec < 60) return lang === "ar" ? "الآن" : "just now";

    for (const u of units) {
        if (diffSec < u.limit) {
            const value = Math.floor(diffSec / u.div);
            return lang === "ar" ? `منذ ${value} ${u.ar}` : `${value}${u.en} ago`;
        }
    }
    return new Date(isoString).toLocaleDateString(lang === "ar" ? "ar" : "en");
}

export default function NotificationBell({ onSeeAll }) {
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);
    const btnRef = useRef(null);
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const lang = i18n.language || "ar";

    const {
        notifications,
        unreadCount,
        loading,
        connectionStatus,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    // إغلاق البوب أب عند الضغط برا
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target) &&
                !btnRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleItemClick = (n) => {
        if (!n.is_read) markAsRead(n.id);
    };

    const handleSeeAll = () => {
        setOpen(false);
        if (onSeeAll) {
            onSeeAll();
        } else {
            navigate("/notifications");
        }
    };

    const recentNotifications = notifications.slice(0, 8);

    return (
        <div className="aspu-notif-wrap">
            <button
                ref={btnRef}
                className={`aspu-notif-bell${open ? " active" : ""}`}
                onClick={() => setOpen((v) => !v)}
                aria-label={lang === "ar" ? "الإشعارات" : "Notifications"}
                aria-expanded={open}
            >
                <FiBell size={20} strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="aspu-notif-badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
                {connectionStatus !== "open" && (
                    <span
                        className="aspu-notif-status-dot"
                        title={lang === "ar" ? "جاري إعادة الاتصال..." : "Reconnecting..."}
                    />
                )}
            </button>

            {open && (
                <div ref={panelRef} className="aspu-notif-panel">
                    <div className="aspu-notif-header">
                        <span className="aspu-notif-title">
                            {lang === "ar" ? "الإشعارات" : "Notifications"}
                        </span>
                        {unreadCount > 0 && (
                            <button className="aspu-notif-markall" onClick={markAllAsRead}>
                                <FiCheck size={13} strokeWidth={2.4} />
                                {lang === "ar" ? "تعليم الكل كمقروء" : "Mark all read"}
                            </button>
                        )}
                    </div>

                    <div className="aspu-notif-list">
                        {loading && (
                            <div className="aspu-notif-empty">
                                {lang === "ar" ? "جاري التحميل..." : "Loading..."}
                            </div>
                        )}

                        {!loading && recentNotifications.length === 0 && (
                            <div className="aspu-notif-empty">
                                {lang === "ar" ? "ولا إشعار لسا" : "No notifications yet"}
                            </div>
                        )}

                        {!loading &&
                            recentNotifications.map((n) => {
                                const { Icon, className } = getLevelMeta(n.level);
                                return (
                                    <button
                                        key={n.id}
                                        className={`aspu-notif-item${n.is_read ? "" : " unread"}`}
                                        onClick={() => handleItemClick(n)}
                                    >
                                        <span className={`aspu-notif-icon ${className}`}>
                                            <Icon size={15} strokeWidth={2.2} />
                                        </span>
                                        <span className="aspu-notif-body">
                                            <span className="aspu-notif-item-title">{n.title}</span>
                                            <span className="aspu-notif-item-text">{n.body}</span>
                                            <span className="aspu-notif-item-time">
                                                {formatRelativeTime(n.created_at, lang)}
                                            </span>
                                        </span>
                                        {!n.is_read && <span className="aspu-notif-dot" />}
                                    </button>
                                );
                            })}
                    </div>

                    <button className="aspu-notif-seeall" onClick={() => navigate("/notifications")}>
                                                عرض الكل
                    </button>
                </div>
            )}
        </div>
    );
}