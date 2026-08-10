import { useState } from "react";
import { changePassword } from "../../api/auth";
import EditField from "./EditField";

export default function ChangePasswordModal({ onClose, t }) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        setError("");

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError(t("auth.profile.modal.error.emptyFields"));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t("auth.profile.modal.error.mismatch"));
            return;
        }
        if (newPassword.length < 8) {
            setError(t("auth.profile.modal.error.shortPassword"));
            return;
        }

        setLoading(true);
        try {
            await changePassword(oldPassword, newPassword, confirmPassword);
            setSuccess(true);
            setTimeout(() => onClose(), 1200);
        } catch (err) {
            const errData = err?.response?.data;
            setError(
                errData
                    ? Object.values(errData).flat().join(" ")
                    : t("auth.profile.modal.error.submitFailed")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, padding: 20,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "var(--surf1)", borderRadius: 12, padding: 28,
                    width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    border: "1px solid var(--bd)",
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx1)", marginBottom: 20 }}>
                    {t("auth.profile.modal.title")}
                </div>

                <EditField
                    label={t("auth.profile.modal.oldPassword")}
                    type="password"
                    value={oldPassword}
                    onChange={setOldPassword}
                    placeholder={t("auth.profile.modal.oldPasswordPlaceholder")}
                />
                <EditField
                    label={t("auth.profile.modal.newPassword")}
                    type="password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder={t("auth.profile.modal.newPasswordPlaceholder")}
                />
                <EditField
                    label={t("auth.profile.modal.confirmPassword")}
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder={t("auth.profile.modal.confirmPasswordPlaceholder")}
                />

                {error && <div className="form-msg error">{error}</div>}
                {success && <div className="form-msg success">{t("auth.profile.modal.success")}</div>}

                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button onClick={handleSubmit} disabled={loading} className="edit-btn primary">
                        {loading ? t("auth.profile.action.saving") : t("auth.profile.modal.title")}
                    </button>
                    <button onClick={onClose} disabled={loading} className="edit-btn">
                        {t("auth.profile.action.cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
}