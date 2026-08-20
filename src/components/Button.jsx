import { useTranslation } from 'react-i18next';
import { FiArrowLeft } from 'react-icons/fi';

export default function Button({ children, onClick, loading, variant = "primary" }) {
  const { t } = useTranslation();
  const common = t('auth.common', { returnObjects: true });
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`auth-btn${variant === "ghost" ? " auth-btn-ghost" : ""}`}
    >
      {loading ? common.loading : children}
      {!loading && <span className="barr"><FiArrowLeft size={14} /></span>}
    </button>
  );
}