import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { verify2FA, confirm2FA } from "../../../api/auth";
import Button from "../../../components/Button";
import ErrorBox from "../../../components/ErrorBox";

export default function OTPPage({ lang, preAuthToken, onSuccess }) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value; setOtp(next);
    if (value && index < 5)
      document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError(t('auth.otp.placeholderErr')); return; }
    setError("");
    try {
      setLoading(true);

      const data = preAuthToken
        ? await verify2FA(preAuthToken, code)
        : await confirm2FA(code);
      onSuccess(data);
    }
     catch (e) {
      const msg = e?.response?.data;
      if (typeof msg === "object") {
        const first = Object.values(msg).flat()[0];
        setError(typeof first === "string" ? first : t('auth.otp.invalid'));
      } else { setError(t('auth.otp.invalidOrExpired')); }
    } finally { setLoading(false); }
  };

  return (
    <>
      <ErrorBox message={error} />
      <div className="auth-otp-row" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`auth-otp-box${digit ? " filled" : ""}`} />
        ))}
      </div>
      <p className="auth-otp-hint">{t('auth.otp.hint')}</p>
      <Button onClick={handleVerify} loading={loading}>{t('auth.otp.verify')}</Button>
    </>
  );
}