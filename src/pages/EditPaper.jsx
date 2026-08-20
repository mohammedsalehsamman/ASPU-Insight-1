import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaper, updatePaper } from '../api/research';
import '../styling/EditPaper.css';
import { getErrorMessage } from '../i18n/errorMessages';
import { EditPaperDict, createLocalT } from '../i18n';
import { useLanguage } from '../context/LanguageContext';
import EditPaperForm from '../components/EditPaper/EditPaperForm';

export default function EditPaper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = createLocalT(EditPaperDict, lang);

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

  /* ── جلب بيانات البحث الحالية ── */
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
          is_paid_open_access: !!data.is_paid_open_access,
        });
        setCurrentPdfName(data.pdf_file ? data.pdf_file.split('/').pop() : '');
      })
      .catch((err) => {
        if (!cancelled) setError(err);
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
      setSaveError(t('required_fields'));
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
      setSaveError(getErrorMessage(err, lang));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ep-state-center">
        <div className="ep-spinner" />
        <span>{t('loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ep-state-center">
        <span className="ep-error-msg">{getErrorMessage(error, lang)}</span>
        <button className="ep-retry-btn" onClick={() => window.location.reload()}>
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="ep-page">
      <EditPaperForm
        id={id}
        form={form}
        onChange={handleChange}
        pdfFile={pdfFile}
        currentPdfName={currentPdfName}
        onFileChange={handleFileChange}
        saving={saving}
        saveError={saveError}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
