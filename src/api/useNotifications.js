
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "./client";

const BASE = "/api/notifications/notificationsAspu2004";

const WS_BASE =
  import.meta.env?.VITE_WS_BASE_URL || "ws://localhost:8000/ws/notifications/";

export const notificationsApi = {
  list: (params) => axios.get(`${BASE}/`, { params }),
  grouped: () => axios.get(`${BASE}/grouped/`),
  unreadCount: () => axios.get(`${BASE}/unread-count/`),
  markRead: (id) => axios.post(`${BASE}/${id}/read/`),
  markAllRead: () => axios.post(`${BASE}/mark-all-read/`),
  preferences: () => axios.get(`${BASE}/preferences/`),
  getWsTicket: () => axios.post(`${BASE}/ws-ticket/`),
};

function useNotificationSocket({ onMessage, enabled = true }) {
  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const isUnmounted = useRef(false);
  const [status, setStatus] = useState("idle"); 

  const connect = useCallback(async () => {
    if (isUnmounted.current || !enabled) return;

    try {
      setStatus("connecting");

      const { data } = await notificationsApi.getWsTicket();
      const { ticket } = data;

      const socket = new WebSocket(`${WS_BASE}?ticket=${ticket}`);
      ws.current = socket;

      socket.onopen = () => setStatus("open");

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          onMessage?.(payload);
        } catch (err) {
          console.error("[notifications] فشل تحليل رسالة WS:", err);
        }
      };

      socket.onclose = () => {
        setStatus("closed");
        ws.current = null;
        if (!isUnmounted.current && enabled) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };

      socket.onerror = (err) => {
        console.error("[notifications] خطأ WS:", err);
        socket.close();
      };
    } catch (err) {
      console.error("[notifications] فشل جلب تذكرة WS:", err);
      if (!isUnmounted.current && enabled) {
        reconnectTimer.current = setTimeout(connect, 5000);
      }
    }
  }, [onMessage, enabled]);

  useEffect(() => {
    isUnmounted.current = false;
    if (enabled) connect();

    return () => {
      isUnmounted.current = true;
      clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect, enabled]);

  return { status };
}

// ─── الـ Hook الرئيسي ──────────────────────────────────────────────
export function useNotifications({ enabled = true } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تحميل أولي عبر REST
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [listRes, countRes] = await Promise.all([
          notificationsApi.list(),
          notificationsApi.unreadCount(),
        ]);
        if (cancelled) return;
        setNotifications(listRes.data.results ?? []);
        setUnreadCount(countRes.data.unread_count ?? 0);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err);
        console.error("[notifications] فشل التحميل الأولي:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // رسالة جديدة جاية من WebSocket
  const handleWsMessage = useCallback((payload) => {
    // ⚠️ إذا شكل الـ payload الفعلي يلي بيبعته الباك مختلف، عدّل هون فقط
    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === payload.id);
      if (exists) return prev;
      return [payload, ...prev];
    });
    if (payload.is_read === false || payload.is_read === undefined) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);

  const { status: connectionStatus } = useNotificationSocket({
    onMessage: handleWsMessage,
    enabled,
  });

  const markAsRead = useCallback(async (id) => {
    // تحديث متفائل (optimistic) بالواجهة
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationsApi.markRead(id);
    } catch (err) {
      console.error("[notifications] فشل تعليم الإشعار كمقروء:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const prevNotifications = notifications;
    const prevUnread = unreadCount;
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await notificationsApi.markAllRead();
    } catch (err) {
      console.error("[notifications] فشل تعليم الكل كمقروء:", err);
      // تراجع عند الفشل
      setNotifications(prevNotifications);
      setUnreadCount(prevUnread);
    }
  }, [notifications, unreadCount]);

  const refresh = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationsApi.list(),
        notificationsApi.unreadCount(),
      ]);
      setNotifications(listRes.data.results ?? []);
      setUnreadCount(countRes.data.unread_count ?? 0);
    } catch (err) {
      console.error("[notifications] فشل التحديث:", err);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}