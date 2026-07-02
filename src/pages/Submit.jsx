import React, { useState, useRef, useEffect } from 'react';
import { createPaper } from '../api/research';
import { getProfile } from '../api/auth';
import styles from '../styling/Submit.module.css';
import Navbar from '../components/Navbar.jsx';
import Logo from '../components/Logo.jsx';
import {
  Robot,
  LockKey,
  Globe,
  DeviceMobile,
  ChartBar,
  Code,
  Shapes,
  UploadSimple,
  CheckCircle,
  X,
  ArrowLeft,
  CaretDown,
  User,
} from '@phosphor-icons/react';

const ROLE_LABELS = {
  author: 'باحث',
  reviewer: 'مراجع',
  editor: 'محرر',
};

const RTYPE_OPTIONS = [
  { value: 'technical', label: 'بحث علمي / تقني', badge: 'للجميع', badgeClass: 'rbBoth' },
  { value: 'semester', label: 'مشروع فصلي', badge: 'طالب', badgeClass: 'rbStu' },
  { value: 'graduation', label: 'مشروع تخرج (SRS)', badge: 'طالب', badgeClass: 'rbStu' },
  { value: 'master', label: "رسالة ماجستير", badge: 'طالب', badgeClass: 'rbStu' },
  { value: 'phd', label: 'رسالة دكتوراه', badge: 'طالب', badgeClass: 'rbStu' },
];

const DISCIPLINE_OPTIONS = [
  { value: 'ai', icon: Robot, name: 'ذكاء اصطناعي' },
  { value: 'sec', icon: LockKey, name: 'أمن معلومات' },
  { value: 'net', icon: Globe, name: 'شبكات' },
  { value: 'app', icon: DeviceMobile, name: 'تطوير تطبيقات' },
  { value: 'data', icon: ChartBar, name: 'علم البيانات' },
  { value: 'se', icon: Code, name: 'هندسة برمجيات' },
  { value: 'other', icon: Shapes, name: 'أخرى' },
];

const STEPS = [
  { num: 1, label: 'تفاصيل البحث', desc: 'العنوان والخلاصة' },
  { num: 2, label: 'الكلمات المفتاحية', desc: 'الكلمات الدالة على البحث' },
  { num: 3, label: 'ملف البحث', desc: 'رفع ملف PDF' },
];

const Submit = () => {
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [successRef, setSuccessRef] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const [openSection, setOpenSection] = useState(1);
  const [publisher, setPublisher] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [rtype, setRtype] = useState('technical');
  const [discipline, setDiscipline] = useState('ai');
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ✅ جلب بيانات المستخدم الحالي وتحديد الناشر تلقائياً من role
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setPublisher(data.role || '');
      } catch (err) {
        console.error(err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fileInputRef = useRef(null);

  const toggleSection = (n) => setOpenSection((cur) => (cur === n ? null : n));

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const trimmed = keywordInput.trim();
      if (trimmed && !keywords.includes(trimmed)) {
        setKeywords([...keywords, trimmed]);
        setKeywordInput('');
      }
    }
  };

  const handleRemoveKeyword = (indexToRemove) => {
    setKeywords(keywords.filter((_, index) => index !== indexToRemove));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !abstract || !file) {
      setError('الرجاء تعبئة الحقول الأساسية ورفع ملف البحث.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('abstract', abstract);
    formData.append('file', file);
    formData.append('keywords', keywords.join(','));
    formData.append('publisher', publisher);
    formData.append('rtype', rtype);
    // ✅ الباك بيطلب اسم الحقل "specialization" (كان "discipline")
    formData.append('specialization', discipline);

    try {
      const response = await createPaper(formData);
      setSuccessRef(response.reference_id || response.id || 'ASPU-' + Math.floor(Math.random() * 90000 + 10000));
      setShowSuccess(true);
      handleReset();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'حدث خطأ أثناء إرسال البحث، يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setAbstract('');
    setKeywords([]);
    setFile(null);
    setOpenSection(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const roleLabel = ROLE_LABELS[publisher] || publisher || '';
  const rtypeLabel = RTYPE_OPTIONS.find((r) => r.value === rtype)?.label || '';
  const discLabel = DISCIPLINE_OPTIONS.find((d) => d.value === discipline)?.name || '';

  return (
    <div className={styles.pageContainer} dir="rtl" lang="ar">
      <Navbar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        hoveredMenu={hoveredMenu}
        setHoveredMenu={setHoveredMenu}
        scrolled={scrolled}
        Logo={Logo}
      />

      {/* ══ الهيرو ══ */}
      <header className={styles.heroHeader}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroInner}>
          <nav className={`${styles.rr} ${styles.breadcrumb}`} aria-label="Breadcrumb">
            <a href="/">الرئيسية</a>
            <span className={styles.crumbSep}>›</span>
            <a href="/research_review">الأبحاث</a>
            <span className={styles.crumbSep}>›</span>
            <span>نشر بحث جديد</span>
          </nav>
          <h1 className={`${styles.bb} ${styles.formTitle} ${styles.heroTitle}`}>
            نشر بحث
            <br />
            جديد
          </h1>
          <p className={styles.formSubtitle}>
            قم بتعبئة بيانات البحث ورفع الملف بصيغة PDF ليتم مراجعته من قبل النظام والمحررين.
          </p>
        </div>
      </header>

      <div className={`${styles.formCard} ${styles.formCardWide}`}>
        <div className={styles.layoutGrid}>
          {/* ══ الشريط الجانبي ══ */}
          <aside className={styles.sidebarCol}>
            <button
              type="button"
              className={styles.filterToggle}
              onClick={() => setSidebarMobileOpen((v) => !v)}
            >
              <span>📋 معلومات البحث</span>
              <span className={`${styles.ftArrow} ${sidebarMobileOpen ? styles.open : ''}`}>
                <CaretDown size={16} />
              </span>
            </button>

            <div className={`${styles.sidebar} ${sidebarMobileOpen ? styles.mobileOpen : ''}`}>
              {/* ✅ الناشر — للعرض فقط، مأخوذ من بروفايل المستخدم */}
              <div>
                <div className={styles.filterLabel}>الناشر</div>
                <div className={styles.discItem} style={{ cursor: 'default' }}>
                  <span className={styles.discIco}>
                    <User size={14} weight="duotone" />
                  </span>
                  <span>
                    {profileLoading
                      ? 'جارٍ التحميل...'
                      : `${profile?.full_name || '—'} (${roleLabel})`}
                  </span>
                </div>
              </div>

              {/* خطوات النشر */}
              <div>
                <div className={styles.filterLabel}>خطوات النشر</div>
                <div className={styles.stepsList}>
                  {STEPS.map((s) => {
                    const state =
                      s.num === openSection ? styles.active : s.num < openSection ? styles.done : '';
                    return (
                      <div className={`${styles.step} ${state}`} key={s.num}>
                        <div className={styles.stepCircle}>{s.num}</div>
                        <div>
                          <div className={styles.stepLabel}>{s.label}</div>
                          <div className={styles.stepDesc}>{s.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* التخصص */}
              <div>
                <div className={styles.filterLabel}>التخصص</div>
                <div className={styles.discGrid}>
                  {DISCIPLINE_OPTIONS.map((d) => (
                    <label key={d.value} className={styles.discItem}>
                      <input
                        type="radio"
                        name="discipline"
                        value={d.value}
                        checked={discipline === d.value}
                        onChange={() => setDiscipline(d.value)}
                      />
                      <span className={styles.discIco}>
                        <d.icon size={14} weight="duotone" />
                      </span>
                      <span>{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ══ الفورم الرئيسي ══ */}
          <div className={styles.contentCol}>
            {error && <div className={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.mainForm}>

              {/* قسم 1: تفاصيل البحث */}
              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionTitle}
                  onClick={() => toggleSection(1)}
                  aria-expanded={openSection === 1}
                >
                  <span className={styles.sectionTitleText}>
                    تفاصيل البحث
                    <span className={styles.sectionSubtitle}>العنوان والخلاصة</span>
                  </span>
                  <span className={`${styles.chevron} ${openSection === 1 ? styles.open : ''}`}>
                    <CaretDown size={14} />
                  </span>
                </button>

                {openSection === 1 && (
                  <div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="title">
                        عنوان البحث <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        maxLength={150}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="أدخل عنوان البحث كاملاً..."
                        required
                      />
                      <span className={styles.charCount}>{title.length}/150</span>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="abstract">
                        الخلاصة (Abstract) <span className={styles.required}>*</span>
                      </label>
                      <textarea
                        id="abstract"
                        maxLength={1000}
                        rows={6}
                        value={abstract}
                        onChange={(e) => setAbstract(e.target.value)}
                        placeholder="اكتب خلاصة البحث هنا..."
                        required
                      />
                      <span className={styles.charCount}>{abstract.length}/1000</span>
                    </div>
                  </div>
                )}
              </div>

              {/* قسم 2: الكلمات المفتاحية */}
              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionTitle}
                  onClick={() => toggleSection(2)}
                  aria-expanded={openSection === 2}
                >
                  <span className={styles.sectionTitleText}>
                    الكلمات المفتاحية
                    <span className={styles.sectionSubtitle}>الكلمات الدالة على البحث</span>
                  </span>
                  <span className={`${styles.chevron} ${openSection === 2 ? styles.open : ''}`}>
                    <CaretDown size={14} />
                  </span>
                </button>

                {openSection === 2 && (
                  <div>
                    <div className={styles.inputGroup}>
                      <div className={styles.keywordWrapper}>
                        <input
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={handleAddKeyword}
                          placeholder="أضف كلمة واضغط Enter..."
                        />
                        <button type="button" onClick={handleAddKeyword} className={styles.addBtn}>
                          إضافة
                        </button>
                      </div>

                      <div className={styles.tagsContainer}>
                        {keywords.map((kw, idx) => (
                          <span key={idx} className={styles.tag}>
                            {kw}
                            <button type="button" onClick={() => handleRemoveKeyword(idx)} aria-label="حذف">
                              <X size={12} weight="bold" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <span className={styles.fieldHint}>أضف عدة كلمات مفتاحية مفصولة بـ Enter</span>
                    </div>
                  </div>
                )}
              </div>

              {/* قسم 3: ملف البحث */}
              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionTitle}
                  onClick={() => toggleSection(3)}
                  aria-expanded={openSection === 3}
                >
                  <span className={styles.sectionTitleText}>
                    ملف البحث
                    <span className={styles.sectionSubtitle}>رفع ملف PDF</span>
                  </span>
                  <span className={`${styles.chevron} ${openSection === 3 ? styles.open : ''}`}>
                    <CaretDown size={14} />
                  </span>
                </button>

                {openSection === 3 && (
                  <div>
                    <div className={styles.inputGroup}>
                      <div className={styles.fileUploadZone}>
                        <input
                          type="file"
                          id="file-upload"
                          accept=".pdf"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className={styles.hiddenFileInput}
                          required={!file}
                        />
                        <label
                          htmlFor="file-upload"
                          className={`${styles.fileLabel} ${dragOver ? styles.dragOver : ''}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                          }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleFileDrop}
                        >
                          <div className={styles.uploadIcon}>
                            <UploadSimple size={32} weight="duotone" />
                          </div>
                          {file ? (
                            <span className={styles.fileName}>
                              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                          ) : (
                            <span>اسحب ملف البحث بصيغة PDF أو انقر للاختيار</span>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ملخص الطلب */}
              <div className={styles.summaryBox}>
                <div className={styles.summaryTitle}>ملخص الطلب</div>
                <div className={styles.summaryRow}>
                  <span>نوع الناشر</span>
                  <strong>{roleLabel}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>التخصص</span>
                  <strong>{discLabel}</strong>
                </div>
                <div className={styles.summaryDivider} />
                <div className={styles.summaryRow}>
                  <span>ملف البحث</span>
                  {file ? (
                    <strong className={styles.summaryOk}>
                      <CheckCircle size={14} weight="fill" /> {file.name}
                    </strong>
                  ) : (
                    <span className={styles.summaryMuted}>لم يُرفع بعد</span>
                  )}
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className={styles.actionRow}>
                <div className={styles.actionInfo}>
                  <div className={styles.actionTitle}>هل أنت جاهز للإرسال؟</div>
                  <div className={styles.actionSub}>سيتم مراجعة البحث من قبل النظام والمحررين</div>
                </div>
                <div className={styles.actionBtns}>
                  <button type="button" onClick={handleReset} className={styles.resetBtn} disabled={loading}>
                    إعادة تعيين
                  </button>
                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? 'جاري الإرسال...' : (
                      <>
                        تقديم البحث للمراجعة{' '}
                        <span className={styles.arrow}>
                          <ArrowLeft size={16} weight="bold" />
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* شاشة النجاح المنبثقة (Overlay) */}
      {showSuccess && (
        <div className={styles.overlay}>
          <div className={styles.overlayCard}>
            <div className={styles.successCheck}>
              <CheckCircle size={36} weight="fill" />
            </div>
            <h3>تم تقديم البحث بنجاح!</h3>
            <p>تم تسجيل البحث في نظام ASPU Insight بنجاح وجاري تحويله إلى نظام مراجعة الذكاء الاصطناعي.</p>
            <div className={styles.refBox}>رقم المرجع: {successRef}</div>
            <button onClick={() => setShowSuccess(false)} className={styles.closeOverlayBtn}>
              موافق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submit;