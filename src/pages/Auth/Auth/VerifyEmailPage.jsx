import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { verifyEmail } from "../../../api/auth";
import ErrorBox from "../../../components/ErrorBox";
import SuccessBox from "../../../components/SuccessBox";
import Button from "../../../components/Button";
import TopBar from "../../../components/TopBar";
import AccentPanel from "../../../components/AccentPanel";
import "../../../styling/Auth.css";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState("ar");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage(t("auth.verifyEmail.errorNoToken"));
      return;
    }
    verifyEmail(token)
      .then((data) => {
        setStatus("success");
        setMessage(data.message || t("auth.verifyEmail.success"));
      })
      .catch((e) => {
        const err = e?.response?.data?.error || t("auth.verifyEmail.errorInvalid");
        setStatus("error");
        setMessage(err);
      });
  }, []);

  return (
    <div className="auth-root" dir={lang === "ar" ? "rtl" : "ltr"}>
      <TopBar lang={lang} setLang={setLang} />
      <main className="auth-page">
        <div className="auth-container">
          <AccentPanel lang={lang} />
          <div className="auth-form-panel">
            <a href="/" className="auth-back">{t("auth.common.backToHome")}</a>
            <div className="auth-fh auth-panel">
              <h2 className="auth-ftitle">{t("auth.verifyEmail.title")}</h2>
            </div>
            <div className="auth-panel">
              {status === "loading" && (
                <p className="auth-fsub">{t("auth.verifyEmail.sub")}</p>
              )}
              {status === "success" && (
                <>
                  <SuccessBox message={message} />
                  <Button onClick={() => navigate("/auth")}>
                    {t("auth.verifyEmail.goLogin")}
                  </Button>
                </>
              )}
              {status === "error" && (
                <>
                  <ErrorBox message={message} />
                  <Button onClick={() => navigate("/auth")}>
                    {t("auth.verifyEmail.goLogin")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
