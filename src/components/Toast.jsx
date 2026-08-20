import { useEffect } from 'react';
import { FiCheckCircle, FiX, FiXCircle, FiInfo } from 'react-icons/fi';
import '../styling/Toast.css';
import { useLanguage } from '../context/LanguageContext';
import { getErrorMessage } from '../i18n/errorMessages';

const ICONS = {
  success: FiCheckCircle,
  error: FiXCircle,
  info: FiInfo,
};

export default function Toast({ toast, onClose }) {
  const { lang } = useLanguage();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const Icon = ICONS[toast.type] || ICONS.info;

  return (
    <div className={`site-toast site-toast-${toast.type || 'info'}`} role={toast.type === 'error' ? 'alert' : 'status'} aria-live="polite">
      <Icon className="site-toast-icon" size={20} />
      <span className="site-toast-message">{getErrorMessage(toast.message, lang)}</span>
      <button className="site-toast-close" type="button" onClick={onClose} aria-label={lang === 'ar' ? 'إغلاق الإشعار' : 'Close notification'}>
        <FiX size={16} />
      </button>
    </div>
  );
}
