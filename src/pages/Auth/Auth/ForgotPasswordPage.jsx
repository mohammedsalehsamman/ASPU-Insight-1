import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { requestPasswordReset } from "../../../api/auth";
import InputBox from "../../../components/InputBox";
import Button from "../../../components/Button";
import ErrorBox from "../../../components/ErrorBox";
import SuccessBox from "../../../components/SuccessBox";
import TopBar from "../../../components/TopBar";
import AccentPanel from "../../../components/AccentPanel";
import "../../../styling/Auth.css";
import { FaEnvelope } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lang, setLang] = useState("ar");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email.trim()) { setError(t("auth.forgotPassword.errEmpty")); return; }
    try {
      setLoading(true);
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (e) {
      const msg = e?.response?.data;
      if (typeof msg === "object") {
        const first = Object.values(msg).flat()[0];
        setError(typeof first === "string" ? first : t("auth.forgotPassword.errInvalid"));
      } else { setError(t("auth.forgotPassword.errInvalid")); }
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-root" dir={lang === "ar" ? "rtl" : "ltr"} data-theme="light">
      <TopBar lang={lang} setLang={setLang} />
      <main className="auth-page">
        <div className="auth-container">
          <AccentPanel lang={lang} />
          <div className="auth-form-panel">
            <a href="/" className="auth-back">{t("auth.common.backToHome")}</a>
            <div className="auth-fh auth-panel">
              <h2 className="auth-ftitle">{t("auth.forgotPassword.title")}</h2>
              <p className="auth-fsub">{t("auth.forgotPassword.sub")}</p>
            </div>
            <div className="auth-panel">
              {!sent ? (
                <div className="auth-fields">
                  <ErrorBox message={error} />
                  <InputBox
                    icon={<FaEnvelope />}
                    label={t("auth.forgotPassword.emailLabel")}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder={t("auth.forgotPassword.emailPh")}
                    autoComplete="email"
                  />
                  <Button onClick={handleSubmit} loading={loading}>
                    {t("auth.forgotPassword.submit")}
                  </Button>
                  <button className="auth-forgot" onClick={() => navigate("/auth")}>
                    {t("auth.forgotPassword.backToLogin")}
                  </button>
                </div>
              ) : (
                <div className="auth-fields">
                  <SuccessBox message={t("auth.forgotPassword.success")} />
                  <p className="auth-fsub">{t("auth.forgotPassword.successHint")}</p>
                  <Button onClick={() => navigate("/auth")}>
                    {t("auth.forgotPassword.backToLogin")}
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