import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { getErrorMessage } from '../i18n/errorMessages';
import Toast from '../components/Toast';
import '../styling/Toast.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const { lang } = useLanguage();
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((type, message) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    return id;
  }, []);

  /* يوافق توقيع notify(type, ar, en) القديم المحلي في Editor.jsx/EditorAssistant.jsx */
  const notify = useCallback((type, ar, en) => {
    push(type, lang === 'ar' ? ar : (en ?? ar));
  }, [push, lang]);

  const showError = useCallback((err) => {
    push('error', getErrorMessage(err, lang));
  }, [push, lang]);

  const showSuccess = useCallback((ar, en) => {
    push('success', lang === 'ar' ? ar : (en ?? ar));
  }, [push, lang]);

  const showInfo = useCallback((ar, en) => {
    push('info', lang === 'ar' ? ar : (en ?? ar));
  }, [push, lang]);

  const value = { notify, showError, showSuccess, showInfo };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="site-toast-stack">
        {toasts.map((item) => (
          <Toast key={item.id} toast={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
