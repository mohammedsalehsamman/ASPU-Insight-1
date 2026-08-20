import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { register } from "../../../api/auth";
import InputBox from "../../../components/InputBox";
import Button from "../../../components/Button";
import EyeBtn from "../../../components/EyeBtn";
import ErrorBox from "../../../components/ErrorBox";
import SuccessBox from "../../../components/SuccessBox";
import { FaUser, FaEnvelope, FaUniversity, FaLock } from "react-icons/fa";

const SPECIALIZATION_OPTIONS = [
  { value: "ai", ar: "ذكاء اصطناعي", en: "Artificial Intelligence" },
  { value: "sec", ar: "أمن معلومات", en: "Information Security" },
  { value: "net", ar: "شبكات", en: "Networks" },
  { value: "app", ar: "تطوير تطبيقات", en: "App Development" },
  { value: "data", ar: "علم البيانات", en: "Data Science" },
  { value: "se", ar: "هندسة برمجيات", en: "Software Engineering" },
  { value: "other", ar: "أخرى", en: "Other" },
];

export default function RegisterPage({ lang, onGoToLogin }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    password2: "",
    role: "author",
    institution: "",
    bio: "",
    specialization: "ai",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const { t } = useTranslation();
  const reg = t('auth.register', { returnObjects: true });
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));


  const handleSubmit = async () => {
    setError("");
    if (!form.full_name || !form.email || !form.password) {
      setError(reg.errFields); return;
    }
    if (form.password !== form.password2) {
      setError(reg.errMatch); return;
    }
    try {
      setLoading(true);
      const data = await register({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        password2: form.password2,
        role: form.role,
        institution: form.institution,
        bio: form.bio,
        specialization: form.specialization,
      });
      
      setSuccess(data.message || reg.successMsg);
      setTimeout(() => onGoToLogin(form.email), 2000);
    } catch (e) {
      const msg = e?.response?.data;
      if (typeof msg === "object") {
        const firstKey = Object.keys(msg)[0];
        const firstVal = Array.isArray(msg[firstKey]) ? msg[firstKey][0] : msg[firstKey];
        setError(typeof firstVal === "string" ? `${firstKey}: ${firstVal}` : reg.errGeneral);
      } else {
        setError(reg.errGeneral);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-fields">
      <ErrorBox message={error} />
      <SuccessBox message={success} />
      <InputBox
        icon={<FaUser />}
        label={reg.fullName}
        value={form.full_name}
        onChange={set("full_name")}
        placeholder={reg.namePh}
      />
      <InputBox
        icon={<FaEnvelope />}
        label={reg.email}
        type="email"
        value={form.email}
        onChange={set("email")}
        placeholder={reg.emailPh}
        autoComplete="email"
      />
      <div className="auth-field">
        <label className="auth-label">{reg.role}</label>
        <select
          value={form.role}
          onChange={(e) => set("role")(e.target.value)}
          className="auth-select">

          <option value="author">{reg.authorOpt}</option>
          <option value="reviewer">{reg.reviewerOpt}</option>
        </select>
      </div>
      <div className="auth-field">
        <label className="auth-label">{reg.specialization ?? (lang === "ar" ? "الاختصاص" : "Specialization")}</label>
        <select
          value={form.specialization}
          onChange={(e) => set("specialization")(e.target.value)}
          className="auth-select">

          {SPECIALIZATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {lang === "ar" ? opt.ar : opt.en}
            </option>
          ))}
        </select>
      </div>
      <InputBox
        icon={<FaUniversity />}
        label={reg.institution}
        value={form.institution}
        onChange={set("institution")}
        placeholder={reg.instPh}
      />
      <div className="auth-field">
        <label className="auth-label">{reg.bio}</label>
        <textarea
          value={form.bio}
          onChange={(e) => set("bio")(e.target.value)}
          placeholder={reg.bioPh}
          rows={3}
          className="auth-textarea" />
      </div>
      <InputBox
        icon={<FaLock />}
        label={reg.password}
        type={showPw ? "text" : "password"}
        value={form.password}
        onChange={set("password")}
        placeholder={reg.pwPh}
        autoComplete="new-password"
        extra={<EyeBtn show={showPw} onToggle={() => setShowPw(p => !p)}
        />}
      />
      <InputBox
        icon={<FaLock />}
        label={reg.confirm}
        type={showPw2 ? "text" : "password"}
        value={form.password2}
        onChange={set("password2")}
        placeholder={reg.pw2Ph}
        autoComplete="new-password"
        extra={<EyeBtn show={showPw2}
          onToggle={() => setShowPw2(p => !p)}
        />}
      />
      <Button
        onClick={handleSubmit}
        loading={loading}
      >
        {reg.create}
      </Button>
      <p className="auth-switch">
        {reg.haveAccount}{" "}
        <span className="auth-switch-link" onClick={() => onGoToLogin("")}>{reg.signIn}</span>
      </p>
    </div>
  );
}