import { useLanguage } from '../context/LanguageContext';
import { getErrorMessage } from '../i18n/errorMessages';

export default function ErrorBox({ message }) {
  const { lang } = useLanguage();
  if (!message) return null;
  return <div className="auth-error" role="alert" aria-live="assertive">{getErrorMessage(message, lang)}</div>;
}