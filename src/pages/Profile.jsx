import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "../styling/Profile.css";
import { updateProfile, changePassword } from "../api/auth";
import api, { BASE_URL } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Logo from "../components/Logo";

const MOCK_STATS = [
    { n: "12", labelAr: "بحث منشور", labelEn: "Published", deltaAr: "3 هذا العام", deltaEn: "3 this year" },
    { n: "4,821", labelAr: "مرة قُرئت الأبحاث", labelEn: "Total Reads", deltaAr: "+18%", deltaEn: "+18%" },
    { n: "37", labelAr: "اقتباس علمي", labelEn: "Citations", deltaAr: null, deltaEn: null },
    { n: "94", labelAr: "نقطة تقييم", labelEn: "Reputation Score", deltaAr: "مرتبة ممتاز", deltaEn: "Excellent rank" },
];

const MOCK_RESEARCH = [
    {
        typeAr: "بحث علمي / تقني", typeEn: "Scientific / Technical",
        titleAr: "نموذج تنبؤي لاكتشاف الاحتيال المالي باستخدام خوارزميات التعلم العميق",
        titleEn: "Predictive Model for Financial Fraud Detection Using Deep Learning",
        dateAr: "مارس 2025", dateEn: "March 2025",
        reads: "1,240", citations: 14, status: "published", trending: true,
    },
    {
        typeAr: "رسالة دكتوراه", typeEn: "PhD Dissertation",
        titleAr: "تحليل الأنماط السلوكية في شبكات التواصل الاجتماعي باستخدام معالجة اللغة الطبيعية",
        titleEn: "Behavioural Pattern Analysis in Social Networks Using NLP",
        dateAr: "يناير 2025", dateEn: "Jan 2025",
        reads: "980", citations: 9, status: "published", trending: false,
    },
    {
        typeAr: "بحث علمي", typeEn: "Scientific Paper",
        titleAr: "تحسين أداء خوارزميات التجميع في قواعد البيانات الضخمة",
        titleEn: "Optimising Clustering Algorithms in Large-Scale Databases",
        dateAr: "سبتمبر 2024", dateEn: "Sep 2024",
        reads: "430", citations: 6, status: "review", trending: false,
    },
    {
        typeAr: "مشروع تخرج", typeEn: "Graduation Project",
        titleAr: "نظام ذكي لإدارة المختبرات الجامعية",
        titleEn: "Smart University Lab Management System",
        dateAr: "يونيو 2024", dateEn: "Jun 2024",
        reads: "2,171", citations: null, status: "draft", trending: false,
    },
];

const MOCK_LEVEL = {
    nameAr: "مستوى: باحث متقدم", nameEn: "Advanced Researcher",
    badge: "LV. 4", pts: 94, ptsAr: "94 نقطة", ptsEn: "94 pts",
    nextAr: "150 للترقي", nextEn: "150 to next", percent: 63,
    milestones: [
        { done: true, ar: "أول نشر", en: "First Publish" },
        { done: true, ar: "5 أبحاث", en: "5 Papers" },
        { done: true, ar: "100 قراءة", en: "100 Reads" },
        { done: false, ar: "20 اقتباس", en: "20 Citations" },
    ],
};

const MOCK_SKILLS = ["Machine Learning", "NLP", "Deep Learning", "Data Mining", "Python", "TensorFlow"];

const MOCK_SOCIAL = [
    { ico: "✉", label: "email" },
    { ico: "🔬", label: "ResearchGate" },
    { ico: "📚", label: "Google Scholar" },
    { ico: "💼", label: "LinkedIn" },
];

const ACT_LABELS = [
    { ar: "يناير", en: "Jan" }, { ar: "أبريل", en: "Apr" },
    { ar: "يوليو", en: "Jul" }, { ar: "أكتوبر", en: "Oct" },
    { ar: "الآن", en: "Now" },
];

/* ══ RESOLVE MEDIA URL ══ */
function resolveMediaUrl(url) {
    if (!url) return null;
    return /^https?:\/\//i.test(url) ? url : `${BASE_URL}${url}`;
}

/* ══ ACTIVITY GRID ══ */
function generateActivityGrid() {
    const cols = [];
    for (let col = 0; col < 12; col++) {
        const cells = [];
        for (let row = 0; row < 5; row++) {
            const r = Math.random();
            const cls = r < 0.4 ? "" : r < 0.65 ? "l1" : r < 0.8 ? "l2" : r < 0.92 ? "l3" : "l4";
            cells.push(cls);
        }
        cols.push(cells);
    }
    return cols;
}

/* ══ LOADING SKELETON ══ */
function ProfileSkeleton() {
    return (
        <div className="profile-hero" style={{ minHeight: 320 }}>
            <div className="hero-inner" style={{ paddingTop: 40 }}>
                <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 32 }}>
                    <div style={{ width: 108, height: 108, borderRadius: "50%", background: "var(--surf2)", animation: "pulse 1.4s ease-in-out infinite" }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ height: 16, width: "40%", borderRadius: 4, background: "var(--surf2)", animation: "pulse 1.4s ease-in-out infinite" }} />
                        <div style={{ height: 32, width: "60%", borderRadius: 4, background: "var(--surf2)", animation: "pulse 1.4s ease-in-out infinite" }} />
                        <div style={{ height: 14, width: "50%", borderRadius: 4, background: "var(--surf2)", animation: "pulse 1.4s ease-in-out infinite" }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ══ ERROR STATE ══ */
function ProfileError({ message, onRetry, t }) {
    return (
        <div className="empty-state" style={{ marginTop: 120 }}>
            <div className="empty-state-ico">⚠️</div>
            <div className="empty-state-t">{t("auth.profile.error.loadFailed")}</div>
            <div className="empty-state-s">{message}</div>
            <button onClick={onRetry} className="edit-btn" style={{ marginTop: 16, display: "inline-flex" }}>
                {t("auth.profile.action.retry")}
            </button>
        </div>
    );
}

/* ══ INLINE EDIT FIELD ══ */
function EditField({ label, value, onChange, type = "text", placeholder = "" }) {
    return (
        <div className="field-group">
            <label className="field-label">{label}</label>
            {type === "textarea" ? (
                <textarea
                    className="field-input"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                />
            ) : (
                <input
                    className="field-input"
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
}

/* ══ CHANGE PASSWORD MODAL ══ */
function ChangePasswordModal({ onClose, t }) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        setError("");

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError(t("auth.profile.modal.error.emptyFields"));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t("auth.profile.modal.error.mismatch"));
            return;
        }
        if (newPassword.length < 8) {
            setError(t("auth.profile.modal.error.shortPassword"));
            return;
        }

        setLoading(true);
        try {
            await changePassword(oldPassword, newPassword, confirmPassword);
            setSuccess(true);
            setTimeout(() => onClose(), 1200);
        } catch (err) {
            const errData = err?.response?.data;
            setError(
                errData
                    ? Object.values(errData).flat().join(" ")
                    : t("auth.profile.modal.error.submitFailed")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000, padding: 20,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "var(--surf1)", borderRadius: 12, padding: 28,
                    width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    border: "1px solid var(--bd)",
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--tx1)", marginBottom: 20 }}>
                    {t("auth.profile.modal.title")}
                </div>

                <EditField
                    label={t("auth.profile.modal.oldPassword")}
                    type="password"
                    value={oldPassword}
                    onChange={setOldPassword}
                    placeholder={t("auth.profile.modal.oldPasswordPlaceholder")}
                />
                <EditField
                    label={t("auth.profile.modal.newPassword")}
                    type="password"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder={t("auth.profile.modal.newPasswordPlaceholder")}
                />
                <EditField
                    label={t("auth.profile.modal.confirmPassword")}
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder={t("auth.profile.modal.confirmPasswordPlaceholder")}
                />

                {error && <div className="form-msg error">{error}</div>}
                {success && <div className="form-msg success">{t("auth.profile.modal.success")}</div>}

                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button onClick={handleSubmit} disabled={loading} className="edit-btn primary">
                        {loading ? t("auth.profile.action.saving") : t("auth.profile.modal.title")}
                    </button>
                    <button onClick={onClose} disabled={loading} className="edit-btn">
                        {t("auth.profile.action.cancel")}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══ ACTIVITY TAB CONTENT ══ */
function ActivityTab({ grid, isAr, t }) {
    return (
        <div>
            <div className="section-label">{t("auth.profile.activity.title", { defaultValue: isAr ? "النشاط خلال 12 شهراً" : "Activity — Last 12 Months" })}</div>
            <div className="info-card">
                <div className="activity-grid">
                    {grid.map((col, i) => (
                        <div key={i} className="act-col">
                            {col.map((cls, j) => (
                                <div key={j} className={`act-cell ${cls}`} />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="act-labels">
                    {ACT_LABELS.map((l, i) => <span key={i}>{isAr ? l.ar : l.en}</span>)}
                </div>
            </div>
        </div>
    );
}

/* ══ INFO TAB CONTENT (بيانات حقيقية من الـ API) ══ */
function InfoTab({ student, isAr, t }) {
    return (
        <div>
            <div className="section-label">{isAr ? "المعلومات الأساسية" : "Basic Information"}</div>
            <div className="info-card">
                <div className="info-card-title">
                    🎓 <span>{isAr ? "المعلومات الأكاديمية" : "Academic Info"}</span>
                </div>
                <div className="info-grid">
                    <div className="info-item">
                        <div className="info-item-label">{isAr ? "الدور" : "Role"}</div>
                        <div className="info-item-val ac">{isAr ? student.roleAr : student.roleEn}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-item-label">{isAr ? "الجامعة / المؤسسة" : "Institution"}</div>
                        <div className="info-item-val">{isAr ? student.universityAr : student.universityEn}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-item-label">ORCID iD</div>
                        <div className="info-item-val">{student.orcid_id || "—"}</div>
                    </div>
                    <div className="info-item">
                        <div className="info-item-label">{isAr ? "البريد الإلكتروني" : "Email"}</div>
                        <div className="info-item-val">{student.email || "—"}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ══ RESEARCH TAB (موك داتا) ══ */
function ResearchTab({ isAr, t }) {
    return (
        <div>
            <div className="section-label">{isAr ? "الأبحاث المنشورة" : "Published Research"}</div>
            <div className="research-list">
                {MOCK_RESEARCH.map((r, i) => (
                    <div key={i} className="research-item">
                        <div>
                            <div className="ri-type">{isAr ? r.typeAr : r.typeEn}</div>
                            <div className="ri-title">{isAr ? r.titleAr : r.titleEn}</div>
                            <div className="ri-meta">
                                <div className="ri-meta-item">📅 {isAr ? r.dateAr : r.dateEn}</div>
                                <div className="ri-meta-item">👁 {r.reads} {isAr ? "قراءة" : "reads"}</div>
                                {r.citations != null && (
                                    <div className="ri-meta-item">🔗 {r.citations} {isAr ? "اقتباس" : "citations"}</div>
                                )}
                            </div>
                        </div>
                        <div className="ri-status">
                            <div className={`ri-badge ${r.status}`}>
                                {r.status === "published" && (isAr ? "منشور" : "Published")}
                                {r.status === "review" && (isAr ? "قيد المراجعة" : "Under Review")}
                                {r.status === "draft" && (isAr ? "مسودة" : "Draft")}
                            </div>
                            {r.trending && <div className="ri-reads">⬆ {isAr ? "رائج هذا الأسبوع" : "Trending"}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ══ SIDEBAR (موك داتا) ══ */
function ProfileSidebar({ isAr }) {
    return (
        <div>
            <div className="level-section">
                <div className="section-label">{isAr ? "المستوى الأكاديمي" : "Academic Level"}</div>
                <div className="level-card">
                    <div className="level-header">
                        <div className="level-name">{isAr ? MOCK_LEVEL.nameAr : MOCK_LEVEL.nameEn}</div>
                        <div className="level-badge">{MOCK_LEVEL.badge}</div>
                    </div>
                    <div className="level-bar-wrap">
                        <div className="level-bar-labels">
                            <span>{isAr ? MOCK_LEVEL.ptsAr : MOCK_LEVEL.ptsEn}</span>
                            <span>{isAr ? MOCK_LEVEL.nextAr : MOCK_LEVEL.nextEn}</span>
                        </div>
                        <div className="level-bar-bg">
                            <div className="level-bar-fill" style={{ width: `${MOCK_LEVEL.percent}%` }} />
                        </div>
                    </div>
                    <div className="level-milestones">
                        {MOCK_LEVEL.milestones.map((m, i) => (
                            <div key={i} className={`milestone ${m.done ? "done" : ""}`}>
                                {m.done ? "✓" : "⬡"} {isAr ? m.ar : m.en}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="side-card">
                <div className="side-card-title">{isAr ? "مجالات البحث" : "Research Areas"}</div>
                <div className="skills-list">
                    {MOCK_SKILLS.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                </div>
            </div>

            <div className="side-card">
                <div className="side-card-title">{isAr ? "التواصل" : "Contact"}</div>
                <div className="social-links">
                    {MOCK_SOCIAL.map((s, i) => (
                        <a key={i} href="#" className="social-link">
                            <span className="social-ico">{s.ico}</span> {s.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ══ MAIN COMPONENT ══ */
export default function StudentProfile() {
    const { t, i18n, ready } = useTranslation();
    const lang = i18n.language || "ar";
    const setLang = (l) => {
        i18n.changeLanguage(l);
        document.documentElement.setAttribute("dir", l === "ar" ? "rtl" : "ltr");
        document.documentElement.setAttribute("lang", l);
    };
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hoveredMenu, setHoveredMenu] = useState(null);
    const [activityGrid] = useState(generateActivityGrid);
    const [activeTab, setActiveTab] = useState("research");
    const cursorRef = useRef(null);

    // ══ API STATE ══
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Guard يمنع الاستدعاء المزدوج في React StrictMode
    const hasFetched = useRef(false);

    // ══ EDIT STATE ══
    const [isEditing, setIsEditing] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: "",
        institution: "",
        orcid_id: "",
        bio: "",
        preferred_language: "ar",
        role: "author",
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const avatarInputRef = useRef(null);

    // ══ CHANGE PASSWORD MODAL STATE ══
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // ══ FETCH PROFILE ══
    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/api/auth/ASPU-2004/profile/');
            setProfile(data);
        } catch (err) {
            setError(err?.response?.data?.detail || err.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchProfile();
    }, []);

    // ══ عند فتح وضع التعديل ══
    const handleStartEdit = () => {
        setEditForm({
            full_name: profile.full_name || "",
            institution: profile.institution || "",
            orcid_id: profile.orcid_id || "",
            bio: profile.bio || "",
            preferred_language: profile.preferred_language || "ar",
            role: profile.role || "author",
        });
        setAvatarPreview(null);
        setAvatarFile(null);
        setSaveError("");
        setSaveSuccess(false);
        setIsEditing(true);
    };

    // ══ إلغاء التعديل ══
    const handleCancelEdit = () => {
        setIsEditing(false);
        setSaveError("");
        setSaveSuccess(false);
        setAvatarPreview(null);
        setAvatarFile(null);
    };

    // ══ حفظ التعديلات ══
    const handleSave = async () => {
        setSaveLoading(true);
        setSaveError("");
        setSaveSuccess(false);

        try {
            const changed = {};
            Object.keys(editForm).forEach(key => {
                if (editForm[key] !== (profile[key] || "")) {
                    changed[key] = editForm[key];
                }
            });

            const hasChanges = Object.keys(changed).length > 0;
            const hasNewAvatar = !!avatarFile;

            if (!hasChanges && !hasNewAvatar) {
                setIsEditing(false);
                return;
            }

            let updated;

            if (hasNewAvatar) {
                const formData = new FormData();
                Object.keys(changed).forEach(key => {
                    formData.append(key, changed[key]);
                });
                formData.append("profile_picture_url", avatarFile, avatarFile.name);
                updated = await updateProfile(formData);
            } else {
                updated = await updateProfile(changed);
            }

            setProfile(prev => ({ ...prev, ...updated }));
            setSaveSuccess(true);

            setTimeout(() => {
                setIsEditing(false);
                setSaveSuccess(false);
                setAvatarPreview(null);
                setAvatarFile(null);
            }, 1200);

        } catch (err) {
            const errData = err?.response?.data;
            setSaveError(
                errData
                    ? Object.values(errData).flat().join(" ")
                    : t("auth.profile.error.saveFailed")
            );
        } finally {
            setSaveLoading(false);
        }
    };

    // ══ معالجة اختيار الصورة ══
    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setSaveError(t("auth.profile.error.imageType"));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setSaveError(t("auth.profile.error.imageSize"));
            return;
        }

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setSaveError("");
    };

    // ══ SIDE EFFECTS ══
    useEffect(() => {
        document.documentElement.setAttribute("data-lang", lang);
        document.documentElement.setAttribute("lang", lang);
        document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    }, [lang]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const el = cursorRef.current;
        if (!el || window.matchMedia("(pointer:coarse)").matches) {
            if (el) el.style.display = "none";
            return;
        }
        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let cx = mx, cy = my;
        const onMove = (e) => { mx = e.clientX; my = e.clientY; };
        window.addEventListener("mousemove", onMove, { passive: true });
        let raf;
        const loop = () => {
            cx += (mx - cx) * 0.1;
            cy += (my - cy) * 0.1;
            el.style.left = cx + "px";
            el.style.top = cy + "px";
            raf = requestAnimationFrame(loop);
        };
        loop();
        return () => {
            window.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    // ══ لسا الترجمة ما جهزت → إظهار سكيلتون بدل أي محاولة قراءة مفاتيح ══
    if (!ready) {
        return <ProfileSkeleton />;
    }

    const isAr = lang === "ar";
    const tProfile = t("auth.profile", { returnObjects: true }) || {};
    const navT = t("nav", { returnObjects: true }) || {};
    const menuT = t("menu", { returnObjects: true }) || {};
    const footer = t("footer", { returnObjects: true }) || {};

    // ══ MAP API → UI ══
    const student = profile ? {
        nameAr: profile.full_name || "",
        nameEn: profile.full_name || "",
        avatarInitial: (profile.full_name || "؟")[0].toUpperCase(),
        avatarUrl: resolveMediaUrl(profile.profile_picture_url),
        roleAr: profile.role === "محرر" ? "طالب" : profile.role,
        roleEn: profile.role === "author" ? "Student" : profile.role,
        universityAr: profile.institution || "جامعة الشام الخاصة",
        universityEn: profile.institution || "ASPU University",
        email: profile.email || "",
        bio: profile.bio || "",
        institution: profile.institution || "",
        orcid_id: profile.orcid_id || "",
    } : null;

    return (
        <div className="profile-page">
            <div className="cursor-glow" ref={cursorRef} />

            <Navbar
                menuOpen={menuOpen} setMenuOpen={setMenuOpen}
                lang={lang} setLang={setLang}
                hoveredMenu={hoveredMenu} setHoveredMenu={setHoveredMenu}
                scrolled={scrolled}
                isAr={isAr}
                menuT={menuT} navT={navT}
                Logo={Logo}
            />

            {loading && <ProfileSkeleton />}
            {!loading && error && <ProfileError message={error} onRetry={fetchProfile} t={t} />}

            {!loading && !error && profile && (
                <>
                    {/* ══ PROFILE HERO ══ */}
                    <div className="profile-hero">
                        <div className="hero-glow-1" />
                        <div className="hero-glow-2" />
                        <div className="hero-inner">
                            <div className="ph-breadcrumb">
                                <a href="/">{tProfile?.breadcrumb?.home}</a>
                                <span className="ph-sep">›</span>
                                <span>{tProfile?.breadcrumb?.profile}</span>
                            </div>

                            <div className="profile-card-top">
                                {/* Avatar */}
                                <div
                                    className="avatar-wrap"
                                    style={{ cursor: isEditing ? "pointer" : "default" }}
                                    onClick={() => isEditing && avatarInputRef.current?.click()}
                                >
                                    <div className="avatar">
                                        {avatarPreview
                                            ? <img src={avatarPreview} alt="preview" />
                                            : student.avatarUrl
                                                ? <img src={student.avatarUrl} alt={student.nameAr} />
                                                : student.avatarInitial}
                                    </div>
                                    <div className="avatar-ring" />
                                    <div className="avatar-ring-spin" />
                                    <div className="avatar-badge">{isEditing ? "📷" : "🎓"}</div>
                                    {isEditing && (
                                        <div style={{
                                            position: "absolute", inset: 0, borderRadius: "50%",
                                            background: "rgba(0,0,0,0.35)", display: "flex",
                                            alignItems: "center", justifyContent: "center",
                                            fontSize: 22, opacity: 0.85,
                                        }}>📷</div>
                                    )}
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleAvatarChange}
                                    />
                                </div>

                                {/* Info */}
                                <div className="profile-info">
                                    {isEditing ? (
                                        /* ══ وضع التعديل ══ */
                                        <div style={{ minWidth: 280 }}>
                                            <EditField
                                                label={tProfile?.field?.fullName}
                                                value={editForm.full_name}
                                                onChange={v => setEditForm(f => ({ ...f, full_name: v }))}
                                                placeholder={tProfile?.placeholder?.fullName}
                                            />
                                            <EditField
                                                label={tProfile?.field?.institution}
                                                value={editForm.institution}
                                                onChange={v => setEditForm(f => ({ ...f, institution: v }))}
                                                placeholder={tProfile?.placeholder?.institution}
                                            />
                                            <EditField
                                                label={tProfile?.field?.orcid}
                                                value={editForm.orcid_id}
                                                onChange={v => setEditForm(f => ({ ...f, orcid_id: v }))}
                                                placeholder={tProfile?.placeholder?.orcid}
                                            />

                                            {/* الدور */}
                                            <div className="field-group">
                                                <label className="field-label">{tProfile?.field?.role}</label>
                                                <div className="pill-row">
                                                    {[
                                                        { val: "author", label: tProfile?.roleOptions?.author },
                                                        { val: "reviewer", label: tProfile?.roleOptions?.reviewer },
                                                        { val: "editor", label: tProfile?.roleOptions?.editor },
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.val}
                                                            onClick={() => setEditForm(f => ({ ...f, role: opt.val }))}
                                                            className={`pill-btn ${editForm.role === opt.val ? "on" : ""}`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <EditField
                                                label={tProfile?.field?.bio}
                                                value={editForm.bio}
                                                onChange={v => setEditForm(f => ({ ...f, bio: v }))}
                                                type="textarea"
                                                placeholder={tProfile?.placeholder?.bio}
                                            />

                                            {/* اللغة المفضلة */}
                                            <div className="field-group">
                                                <label className="field-label">{tProfile?.field?.preferredLanguage}</label>
                                                <div className="pill-row">
                                                    {[{ val: "ar", label: tProfile?.languageOptions?.ar }, { val: "en", label: tProfile?.languageOptions?.en }].map(opt => (
                                                        <button
                                                            key={opt.val}
                                                            onClick={() => setEditForm(f => ({ ...f, preferred_language: opt.val }))}
                                                            className={`pill-btn ${editForm.preferred_language === opt.val ? "on" : ""}`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* رسائل الخطأ / النجاح */}
                                            {saveError && <div className="form-msg error">{saveError}</div>}
                                            {saveSuccess && <div className="form-msg success">{tProfile?.action?.saved}</div>}

                                            {/* أزرار الحفظ والإلغاء */}
                                            <div style={{ display: "flex", gap: 10 }}>
                                                <button onClick={handleSave} disabled={saveLoading} className="edit-btn primary">
                                                    {saveLoading ? tProfile?.action?.saving : tProfile?.action?.saveChanges}
                                                </button>
                                                <button onClick={handleCancelEdit} disabled={saveLoading} className="edit-btn">
                                                    {tProfile?.action?.cancel}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ══ الوضع الطبيعي (عرض البيانات) ══ */
                                        <div>
                                            <div className="profile-role-tag">
                                                <span>●</span>
                                                <span>{isAr ? student.roleAr : student.roleEn}</span>
                                            </div>
                                            <div className="profile-name">{isAr ? student.nameAr : student.nameEn}</div>
                                            <div className="profile-meta">
                                                <div className="profile-meta-item">🏛️ {isAr ? student.universityAr : student.universityEn}</div>
                                                {student.email && (
                                                    <>
                                                        <div className="profile-meta-dot" />
                                                        <div className="profile-meta-item">✉ {student.email}</div>
                                                    </>
                                                )}
                                            </div>
                                            {student.bio && <div className="profile-bio">{student.bio}</div>}
                                        </div>
                                    )}
                                </div>

                                {/* Edit actions */}
                                {!isEditing && (
                                    <div className="hero-actions">
                                        <button onClick={handleStartEdit} className="edit-btn">
                                            {tProfile?.action?.editProfile}
                                        </button>
                                        <button onClick={() => setShowPasswordModal(true)} className="edit-btn">
                                            {tProfile?.action?.changePassword}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ══ STATS STRIP ══ */}
                        <div className="stats-strip">
                            {MOCK_STATS.map((s, i) => (
                                <div key={i} className="stat-cell">
                                    <div className="stat-n">{s.n}</div>
                                    <div className="stat-l">{isAr ? s.labelAr : s.labelEn}</div>
                                    {s.deltaAr && <div className="stat-delta">▲ {isAr ? s.deltaAr : s.deltaEn}</div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ══ TABS ══ */}
                    <div className="profile-tabs">
                        <button className={`ptab ${activeTab === "research" ? "on" : ""}`} onClick={() => setActiveTab("research")}>
                            {isAr ? "الأبحاث" : "Research"}
                        </button>
                        <button className={`ptab ${activeTab === "info" ? "on" : ""}`} onClick={() => setActiveTab("info")}>
                            {isAr ? "المعلومات الأساسية" : "Basic Info"}
                        </button>
                        <button className={`ptab ${activeTab === "activity" ? "on" : ""}`} onClick={() => setActiveTab("activity")}>
                            {isAr ? "النشاط" : "Activity"}
                        </button>
                    </div>

                    {/* ══ PAGE BODY ══ */}
                    <div className="page-body">
                        <div>
                            {activeTab === "research" && <ResearchTab isAr={isAr} t={t} />}
                            {activeTab === "info" && <InfoTab student={student} isAr={isAr} t={t} />}
                            {activeTab === "activity" && <ActivityTab grid={activityGrid} isAr={isAr} t={t} />}
                        </div>
                        <ProfileSidebar isAr={isAr} />
                    </div>
                </>
            )}

            {showPasswordModal && (
                <ChangePasswordModal onClose={() => setShowPasswordModal(false)} t={t} />
            )}

            <Footer isAr={isAr} footer={footer} Logo={Logo} />
        </div>
    );
}