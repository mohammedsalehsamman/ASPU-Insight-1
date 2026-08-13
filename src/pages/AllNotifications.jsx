import { useEffect, useState } from "react";
import { notificationsApi } from "../api/useNotifications";
import "../styling/AllNotifications.css";

const LEVEL_COLORS = {
  info: "#3b82f6",
  warning: "#f59e0b",
  success: "#22c55e",
  error: "#ef4444",
};

export default function AllNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const { data } = await notificationsApi.grouped();
        if (!cancelled) setNotifications(data ?? []);
      } catch (err) {
        if (!cancelled) setError(err);
        console.error("[notifications] فشل تحميل كل الإشعارات:", err);
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
      console.error("[notifications] فشل تعليم الإشعار كمقروء:", err);
    }
  };

  if (loading) return <div className="all-notif-state">جاري التحميل...</div>;
  if (error) return <div className="all-notif-state">حدث خطأ أثناء التحميل</div>;

  return (
    <div className="all-notif-page">
      <h1 className="all-notif-title">كل الإشعارات</h1>

      {notifications.length === 0 ? (
        <div className="all-notif-empty">لا توجد إشعارات</div>
      ) : (
        <div className="all-notif-list">
          {notifications.map((n) => {
            const title = n.title || n.data?.fallback_title || "إشعار";
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
                    {new Date(n.created_at).toLocaleString("ar")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}