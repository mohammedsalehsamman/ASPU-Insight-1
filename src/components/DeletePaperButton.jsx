import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deletePaper } from '../api/research';
import { FaTrash } from 'react-icons/fa';

export default function DeletePaperButton({
  id,
  redirectTo = '/research_review',
  className = 'pd-action-btn pd-btn-danger',
}) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('هل أنت متأكد من حذف هذا البحث؟')) return;
    setDeleting(true);
    try {
      await deletePaper(id);
      navigate(redirectTo);
    } catch (err) {
      alert('فشل الحذف: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button className={className} onClick={handleDelete} disabled={deleting}>
      <span><FaTrash /></span>
      <span>{deleting ? 'جاري الحذف…' : 'حذف البحث'}</span>
    </button>
  );
}