import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPaper, updatePaper } from '../api/research';
import '../styling/EditPaper.css';
import { FaSave, FaTimes, FaFileUpload } from 'react-icons/fa';

export default function EditPaper() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    abstract: '',
    is_paid_open_access: false,
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [currentPdfName, setCurrentPdfName] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPaper(id)
      .then((data) => {
        if (cancelled) return;
        setForm({
          title: data.title || '',
          abstract: data.abstract || '',
          is_paid_open_access: !! data.is_paid_open_access,
        });
        setCurrentPdfName(data.pdf_file ? data.pdf_file.split('/').pop() : '');
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'حدث خطأ في جلب البيانات');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const handleChange = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPdfFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);

    if (!form.title.trim() || !form.abstract.trim()) {
      setSaveError('يرجى تعبئة العنوان والملخص');
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('title', form.title.trim());
      payload.append('abstract', form.abstract.trim());
      payload.append('is_paid_open_access', form.is_paid_open_access);
      if (pdfFile) payload.append('pdf_file', pdfFile);

      await updatePaper(id, payload);
      navigate(`/papers/${id}`);
    } catch (err) {
      const msg = err?.response?.data;
      if (typeof msg === 'object') {
        const first = Object.values(msg).flat()[0];
        setSaveError(typeof first === 'string' ? first : 'فشل حفظ التعديلات');
      } else {
        setSaveError('فشل حفظ التعديلات، حاول مرة أخرى');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ep-state-center">
        <div className="ep-spinner" />
        <span>جاري التحميل…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ep-state-center">
        <span className="ep-error-msg">{error}</span>
        <button className="ep-retry-btn" onClick={() => window.location.reload()}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="ep-page">
      <div className="ep-card">
        <div className="ep-header">
          <h1 className="ep-title">تعديل البحث</h1>
          <Link to={`/papers/${id}`} className="ep-cancel-link">
            <FaTimes size={12} /> إلغاء
          </Link>
        </div>

        {saveError && <div className="ep-error-box">{saveError}</div>}

        <form className="ep-form" onSubmit={handleSubmit}>
          <div className="ep-field">
            <label className="ep-label">عنوان البحث</label>
            <input
              type="text"
              className="ep-input"
              value={form.title}
              onChange={handleChange('title')}
              placeholder="اكتب عنوان البحث"
            />
          </div>

          <div className="ep-field">
            <label className="ep-label">الملخص</label>
            <textarea
              className="ep-textarea"
              rows={6}
              value={form.abstract}
              onChange={handleChange('abstract')}
              placeholder="اكتب ملخص البحث"
            />
          </div>

          <div className="ep-field ep-field-row">
            <label className="ep-checkbox-row">
              <input
                type="checkbox"
                checked={form.is_paid_open_access}
                onChange={handleChange('is_paid_open_access')}
              />
              <span>وصول مفتوح مدفوع</span>
            </label>
          </div>

          <div className="ep-field">
            <label className="ep-label">ملف PDF</label>
            <label className="ep-file-drop">
              <FaFileUpload />
              <span>{pdfFile ? pdfFile.name : (currentPdfName || 'اختر ملف PDF جديد (اختياري)')}</span>
              <input type="file" accept="application/pdf" onChange={handleFileChange} hidden />
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
    </div>
  );
}