import { useEffect, useState, useCallback } from 'react';
import { LockOpen, Lock, ShieldCheck, FileText, Warning, ArrowClockwise, CheckCircle } from '@phosphor-icons/react';
import AdminLayout from './AdminLayout';
import { getConfiguration, updateConfiguration } from '../../api/admin';
import { useAdminLang, adminT } from './adminI18n';

const MODES = [
  {
    value: 'full_open',
    icon: LockOpen,
    title: { ar: 'مفتوح بالكامل', en: 'Fully Open' },
    desc: {
      ar: 'كل الأبحاث المنشورة متاحة للقراءة الكاملة والتحميل لأي زائر دون قيود.',
      en: 'All published papers are fully readable and downloadable by any visitor, no restrictions.',
    },
  },
  {
    value: 'full_closed',
    icon: Lock,
    title: { ar: 'مغلق بالكامل', en: 'Fully Closed' },
    desc: {
      ar: 'الوصول لمحتوى الأبحاث مقتصر على المستخدمين المسجَّلين والمصرَّح لهم فقط.',
      en: 'Access to paper content is restricted to registered and authorized users only.',
    },
  },
  {
    value: 'hybrid',
    icon: ShieldCheck,
    title: { ar: 'هجين', en: 'Hybrid' },
    desc: {
      ar: 'بعض الأبحاث مفتوحة بالكامل (وصول مفتوح مدفوع) والبعض الآخر مقيّد حسب إعداد كل بحث.',
      en: 'Some papers are fully open (paid open access) while others remain restricted per paper.',
    },
  },
  {
    value: 'abstract_only',
    icon: FileText,
    title: { ar: 'الملخص فقط', en: 'Abstract Only' },
    desc: {
      ar: 'يظهر للزوار ملخص البحث فقط، بينما يبقى النص الكامل والملف مقيّدين.',
      en: 'Visitors can only see the abstract, while the full text and file remain restricted.',
    },
  },
];

export default function Settings() {
  const [lang] = useAdminLang();
  const t = (key) => adminT(lang, key);
  const isAr = lang === 'ar';

  const [systemMode, setSystemMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConfiguration();
      setSystemMode(data.system_mode);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateConfiguration({ system_mode: systemMode });
      setSaveMsg({ type: 'success', text: t('success') });
    } catch (err) {
      const msg = err.response?.data ? Object.values(err.response.data).flat().join(' ') : (isAr ? 'فشل الحفظ' : 'Save failed');
      setSaveMsg({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-head">
        <div>
          <div className="admin-page-title">{t('settings')}</div>
          <div className="admin-page-sub">
            {isAr ? 'التحكم بنمط الوصول العام لمحتوى المجلة الأكاديمية' : 'Control the public access mode of the academic journal content'}
          </div>
        </div>
      </div>

      {loading && (
        <div className="admin-state-center">
          <div className="admin-spinner" />
          <span>{t('loading')}</span>
        </div>
      )}

      {!loading && error && (
        <div className="admin-state-center">
          <Warning size={36} weight="duotone" style={{ color: 'var(--ac)' }} />
          <span className="admin-empty-title">{t('error')}</span>
          <span className="admin-empty-sub">{String(error)}</span>
          <button className="admin-btn admin-btn-primary" onClick={fetchConfig} style={{ marginTop: 6 }}>
            <ArrowClockwise size={14} weight="bold" />
            {t('retry')}
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="admin-radio-cards">
            {MODES.map((m) => (
              <label
                key={m.value}
                className={`admin-radio-card ${systemMode === m.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="system_mode"
                  value={m.value}
                  checked={systemMode === m.value}
                  onChange={() => setSystemMode(m.value)}
                  style={{ display: 'none' }}
                />
                <div className="admin-radio-card-title">
                  <m.icon size={19} weight="duotone" style={{ color: 'var(--ac)' }} />
                  {m.title[lang]}
                  {systemMode === m.value && <CheckCircle size={16} weight="fill" style={{ color: 'var(--ac)', marginInlineStart: 'auto' }} />}
                </div>
                <div className="admin-radio-card-desc">{m.desc[lang]}</div>
              </label>
            ))}
          </div>

          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving || !systemMode}>
              {saving ? t('saving') : t('save')}
            </button>
            {saveMsg && <span className={`admin-msg admin-msg-${saveMsg.type}`}>{saveMsg.text}</span>}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
