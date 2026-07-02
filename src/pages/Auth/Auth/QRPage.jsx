import { useState, useEffect, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from "qrcode.react";
import { enable2FA } from "../../../api/auth";
import Button from "../../../components/Button";
import ErrorBox from "../../../components/ErrorBox";
import { FaSpinner } from "react-icons/fa";

export default function QRPage({ lang, onNext }) {
  const { t } = useTranslation();
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    enable2FA()
      .then((data) => setQrUrl(data.qr_code_url))
      .catch(() => setError(t('auth.qr.loading')))
      .finally(() => setLoading(false));
  }, []);

  const steps = t('auth.qr.steps', { returnObjects: true });

  return (
    <>
      <ErrorBox message={error} />
      <div className="auth-qr-wrapper">
        {loading
          ? <div className="auth-qr-placeholder"><FaSpinner className="spin-icon" /> {t('auth.qr.loading')}</div>
          : qrUrl ? <div className="auth-qr-box"><QRCodeSVG value={qrUrl} size={200} /></div> : null}
        <div className="auth-qr-steps">
          {steps.map((s, i) => (
            <div key={i} className="auth-qr-step">
              <span className="auth-qr-step-num">{i + 1}.</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <Button onClick={onNext}>{t('auth.qr.scannedNext')}</Button>
    </>
  );
}