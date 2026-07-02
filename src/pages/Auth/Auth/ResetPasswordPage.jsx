import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { confirmPasswordReset } from "../../../api/auth";
import InputBox from "../../../components/InputBox";
import Button from "../../../components/Button";
import ErrorBox from "../../../components/ErrorBox";
import SuccessBox from "../../../components/SuccessBox";
import EyeBtn from "../../../components/EyeBtn";
import TopBar from "../../../components/TopBar";
import AccentPanel from "../../../components/AccentPanel";
import "../../../styling/Auth.css";
import { Lock } from '@phosphor-icons/react';


export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState("ar");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const token = searchParams.get("token");

  const handleSubmit = async () => {
    setError("");
    if (!newPassword || !confirmPassword) { setError(t("auth.resetPassword.errEmpty")); return; }
    if (newPassword !== confirmPassword) { setError(t("auth.resetPassword.errMatch")); return; }
    try {
      setLoading(true);
      await confirmPasswordReset(token, newPassword, confirmPassword);
      setDone(true);
    } catch (e) {
      const msg = e?.response?.data;
      if (msg?.error) {
        setError(msg.error);
      } else if (typeof msg === "object") {
        const first = Object.values(msg).flat()[0];
        setError(typeof first === "string" ? first : t("auth.resetPassword.errGeneral"));
      } else { setError(t("auth.resetPassword.errGeneral")); }
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-root" dir={lang === "ar" ? "rtl" : "ltr"} data-theme="light">
      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-form-panel">
            <a href="/" className="auth-back">{t("auth.common.backToHome")}</a>
            <div className="auth-panel">
              {!token ? (
                <div className="auth-fields">
                  <ErrorBox message={t("auth.resetPassword.errNoToken")} />
                  <Button onClick={() => navigate("/auth")}>{t("auth.resetPassword.goLogin")}</Button>
                </div>
              ) : done ? (
                <div className="auth-fields">
                  <SuccessBox message={t("auth.resetPassword.success")} />
                  <Button onClick={() => navigate("/auth")}>{t("auth.resetPassword.goLogin")}</Button>
                </div>
              ) : (
                <div className="auth-fields">
                  <ErrorBox message={error} />
                  <InputBox
                    icon={<Lock size={18} />}
                    label={t("auth.resetPassword.newPassword")}
                    type={showPw ? "text" : "password"}
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder={t("auth.resetPassword.pwPh")}
                    autoComplete="new-password"
                    extra={<EyeBtn show={showPw} onToggle={() => setShowPw(p => !p)} />}
                  />
                  <InputBox
                    icon={<Lock size={18} />}
                    label={t("auth.resetPassword.confirmPassword")}
                    type={showPw2 ? "text" : "password"}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder={t("auth.resetPassword.pw2Ph")}
                    autoComplete="new-password"
                    extra={<EyeBtn show={showPw2} onToggle={() => setShowPw2(p => !p)} />}
                  />
                  <Button onClick={handleSubmit} loading={loading}>
                    {t("auth.resetPassword.submit")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}