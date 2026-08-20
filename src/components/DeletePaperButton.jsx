import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deletePaper } from '../api/research';
import { FaTrash } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { getErrorMessage } from '../i18n/errorMessages';
import ErrorBox from './ErrorBox';

export default function DeletePaperButton({
  id,
  redirectTo = '/research_review',
  className = 'pd-action-btn pd-btn-danger',
}) {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا البحث؟' : 'Are you sure you want to delete this paper?')) return;
    setError(null);
    setDeleting(true);
    try {
      await deletePaper(id);
      navigate(redirectTo);
    } catch (err) {
      setError(getErrorMessage(err, lang));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button className={className} onClick={handleDelete} disabled={deleting}>
        <span><FaTrash /></span>
        <span>{deleting ? (lang === 'ar' ? 'جارٍ الحذف...' : 'Deleting...') : (lang === 'ar' ? 'حذف البحث' : 'Delete paper')}</span>
      </button>
      <ErrorBox message={error} />
    </>
  );
}