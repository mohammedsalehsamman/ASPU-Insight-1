import { FaExclamationTriangle } from "react-icons/fa";

export default function ProfileError({ message, onRetry, t }) {
    return (
        <div className="empty-state" style={{ marginTop: 120 }}>
            <div className="empty-state-ico"><FaExclamationTriangle /></div>
            <div className="empty-state-t">{t("auth.profile.error.loadFailed")}</div>
            <div className="empty-state-s">{message}</div>
            <button onClick={onRetry} className="edit-btn" style={{ marginTop: 16, display: "inline-flex" }}>
                {t("auth.profile.action.retry")}
            </button>
        </div>
    );
}