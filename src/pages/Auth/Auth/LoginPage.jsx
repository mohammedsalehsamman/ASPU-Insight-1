import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { login } from "../../../api/auth";
import InputBox from "../../../components/InputBox";
import Button from "../../../components/Button";
import EyeBtn from "../../../components/EyeBtn";
import ErrorBox from "../../../components/ErrorBox";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function LoginPage({ lang, prefillEmail, onQRRequired, onOTPRequired, onGoToRegister, onSuccess }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState(prefillEmail || "");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPw, setShowPw] = useState(false);

    const { t } = useTranslation();
    const tLogin = t('auth.login', { returnObjects: true });

    const handleSubmit = async () => {
        setError("");
        if (!email || !password) { setError(tLogin.errEmpty); return; }
        try {
            setLoading(true);
            const data = await login(email, password);
            if (data.requires_2fa === false) {
                onQRRequired();
            } else {
                onOTPRequired(data.pre_auth_token);
            }
        } catch (e) {
            const msg = e?.response?.data;
            if (typeof msg === "object") {
                const first = Object.values(msg).flat()[0];
                setError(typeof first === "string" ? first : tLogin.errCreds);
            } else { setError(tLogin.errCreds); }
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-fields">
            <ErrorBox message={error} />
            <InputBox
                icon={<FaEnvelope />}
                label={tLogin.email}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder={tLogin.emailPh}
                autoComplete="email"
            />
            <InputBox
                icon={<FaLock />}
                label={tLogin.password}
                type={showPw ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder={tLogin.pwPh}
                autoComplete="current-password"
                extra={<EyeBtn show={showPw}
                    onToggle={() => setShowPw(p => !p)}
                />}
            />
            <button
                className="auth-forgot"
                onClick={() => navigate("/forgot-password")}
            >{tLogin.forgot}
            </button>

            <Button
                onClick={handleSubmit}
                loading={loading}>
                {tLogin.submit}
            </Button>
            <p className="auth-switch">
                {tLogin.noAccount}{" "}
                <span className="auth-switch-link"
                    onClick={onGoToRegister}>
                    {tLogin.createAcc}
                </span>
            </p>
        </div>
    );
}