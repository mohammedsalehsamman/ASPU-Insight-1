import { FaEdit, FaClipboard } from 'react-icons/fa';
import DeletePaperButton from '../DeletePaperButton';

export default function ActionsCard({ id, t, onEdit, onCopyLink }) {
  return (
    <div className="pd-action-card">
      <div className="pd-section-label">{t('actions_label')}</div>

      <button className="pd-action-btn pd-btn-secondary" onClick={onEdit}>
        <span><FaEdit /></span>
        <span>{t('edit_paper')}</span>
      </button>

      <button className="pd-action-btn pd-btn-secondary" onClick={onCopyLink}>
        <span><FaClipboard /></span>
        <span>{t('copy_link')}</span>
      </button>

      <DeletePaperButton id={id} redirectTo="/papers" />
    </div>
  );
}
