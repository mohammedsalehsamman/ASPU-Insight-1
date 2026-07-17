import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout";
import LoginPage from "./Auth/LoginPage";
import RegisterPage from "./Auth/RegisterPage";
import QRPage from "./Auth/QRPage";
import OTPPage from "./Auth/OTPPage";
import SuccessBox from "../../components/SuccessBox";
import "../../styling/auth.css";

export default function Auth() {
  const [step, setStep] = useState("login");
  const [prefillEmail, setPrefillEmail] = useState("");
  const [preAuthToken, setPreAuthToken] = useState(null);
  const [lang, setLang] = useState("ar");
  const [setupMsg, setSetupMsg] = useState("");

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const goToLogin = (email) => {
    setPrefillEmail(email);
    setStep("login");
  };

  /* الرد يلي بيرجعه confirm2FA (تفعيل أول مرة) ما فيه tokens/user —
     هو بس بيفعّل الـ 2FA، لازم المستخدم يسجّل دخول من جديد بعده عشان ياخد التوكنز الفعلية */
  const onOtpSuccess = (data) => {
    if (preAuthToken) {
      onSuccess(data);
      return;
    }
    setSetupMsg(
      lang === "ar"
        ? "تم تفعيل المصادقة الثنائية بنجاح. الرجاء تسجيل الدخول مرة أخرى وإدخال رمز التحقق."
        : "Two-factor authentication enabled successfully. Please sign in again and enter the verification code."
    );
    setPreAuthToken(null);
    setStep("login");
  };

  const onSuccess = (data) => {
    setUser(data.user);

    if (data?.user?.role === "admin") {
      navigate("/admin");
      return;
    }

    if (data?.user?.role === "reviewer_assistant") {
      navigate("/EditorAssistant");
      return;
    }


    if (data?.user?.role === "editor") {
      navigate("/Editor");
      return;
    }
    navigate("/");
  };

  const sharedLayout = (content) => (
    <AuthLayout
      lang={lang}
      setLang={setLang}
      step={step}
      activeTab={step === "register" ? "register" : "login"}
      onTabChange={(tab) => setStep(tab)}
    >
      {content}
    </AuthLayout>
  );

  if (step === "login") return sharedLayout(
    <>
      <SuccessBox message={setupMsg} />
      <LoginPage
        lang={lang}
        prefillEmail={prefillEmail}
        onQRRequired={() => { setSetupMsg(""); setStep("qr"); }}
        onOTPRequired={(token) => { setSetupMsg(""); setPreAuthToken(token); setStep("otp"); }}
        onGoToRegister={() => { setSetupMsg(""); setStep("register"); }}
        onSuccess={onSuccess}
      />
    </>
  );

  if (step === "register") return sharedLayout(
    <RegisterPage lang={lang} onGoToLogin={goToLogin} />
  );

  if (step === "qr") return sharedLayout(
    <QRPage lang={lang} onNext={() => setStep("otp")} />
  );

  if (step === "otp") return sharedLayout(
    <OTPPage lang={lang} preAuthToken={preAuthToken} onSuccess={onOtpSuccess} />
  );

  if (step === "done") return sharedLayout(
    <div className="auth-done">
      <div className="auth-done-ring">✓</div>
      <p className="auth-done-title">{t('auth.done.title')}</p>
      <p className="auth-done-desc">{t('auth.done.desc')}</p>
    </div>
  );

  return null;
}