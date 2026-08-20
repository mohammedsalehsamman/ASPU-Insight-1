import { Link } from 'react-router-dom';
import { FaSave, FaTimes, FaFileUpload } from 'react-icons/fa';

export default function EditPaperForm({
  id, form, onChange, pdfFile, currentPdfName, onFileChange,
  saving, saveError, onSubmit,
}) {
  return (
    <div className="ep-card">
      <div className="ep-header">
        <h1 className="ep-title">تعديل البحث</h1>
        <Link to={`/papers/${id}`} className="ep-cancel-link">
          <FaTimes size={12} /> إلغاء
        </Link>
      </div>

      {saveError && <div className="ep-error-box">{saveError}</div>}

      <form className="ep-form" onSubmit={onSubmit}>
        <div className="ep-field">
          <label className="ep-label">عنوان البحث</label>
          <input
            type="text"
            className="ep-input"
            value={form.title}
            onChange={onChange('title')}
            placeholder="اكتب عنوان البحث"
          />
        </div>

        <div className="ep-field">
          <label className="ep-label">الملخص</label>
          <textarea
            className="ep-textarea"
            rows={6}
            value={form.abstract}
            onChange={onChange('abstract')}
            placeholder="اكتب ملخص البحث"
          />
        </div>

        <div className="ep-field ep-field-row">
          <label className="ep-checkbox-row">
            <input
              type="checkbox"
              checked={form.is_paid_open_access}
              onChange={onChange('is_paid_open_access')}
            />
            <span>وصول مفتوح مدفوع</span>
          </label>
        </div>

        <div className="ep-field">
          <label className="ep-label">ملف PDF</label>
          <label className="ep-file-drop">
            <FaFileUpload />
            <span>{pdfFile ? pdfFile.name : (currentPdfName || 'اختر ملف PDF جديد (اختياري)')}</span>
            <input type="file" accept="application/pdf" onChange={onFileChange} hidden />
          </label>
        </div>

        <div className="ep-actions">
          <button type="submit" className="ep-save-btn" disabled={saving}>
            <FaSave size={13} />
            {saving ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}
          </button>
          <Link to={`/papers/${id}`} className="ep-cancel-btn">
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
