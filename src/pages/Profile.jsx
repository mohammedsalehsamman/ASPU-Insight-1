import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "../styling/Profile.css";
import { getProfile, updateProfile, changePassword } from "../api/auth";
import { getPapers } from "../api/research";
import { BASE_URL } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import {
    FaGraduationCap,
    FaCamera,
    FaUniversity,
    FaEnvelope,
    FaChevronRight,
    FaCaretUp,
} from "react-icons/fa";
import InvitationsTab from "../components/Profile/InvitationsTab";
import { getMyInvitations } from "../api/committees";
import ProfileSkeleton from "../components/Profile/ProfileSkeleton";
import ProfileError from "../components/Profile/ProfileError";
import EditField from "../components/Profile/EditField";
import ChangePasswordModal from "../components/Profile/ChangePasswordModal";
import InfoTab from "../components/Profile/InfoTab";
import ResearchTab from "../components/Profile/ResearchTab";


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
    const [invitations, setInvitations] = useState([]);
    const [invitationsLoading, setInvitationsLoading] = useState(true);
    const [invitationsError, setInvitationsError] = useState(null);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [papers, setPapers] = useState([]);
    const [papersLoading, setPapersLoading] = useState(true);
    const [papersError, setPapersError] = useState(null);

    const hasFetched = useRef(false);

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

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const fetchInvitations = async () => {
        setInvitationsLoading(true);
        setInvitationsError(null);
        try {
            const data = await getMyInvitations();
            setInvitations(Array.isArray(data) ? data : []);
        } catch (err) {
            setInvitationsError(err?.response?.data?.detail || err.message || "Unknown error");
        } finally {
            setInvitationsLoading(false);
        }
    };

    // عدّل useEffect تبع الفتش الأولي
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchProfile();
        fetchPapers();
        fetchInvitations();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProfile();
            setProfile(data);
        } catch (err) {
            setError(err?.response?.data?.detail || err.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const fetchPapers = async () => {
        setPapersLoading(true);
        setPapersError(null);
        try {
            const data = await getPapers();
            setPapers(Array.isArray(data) ? data : []);
        } catch (err) {
            setPapersError(err?.response?.data?.detail || err.message || "Unknown error");
        } finally {
            setPapersLoading(false);
        }
    };

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchProfile();
        fetchPapers();
    }, []);

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

    const handleCancelEdit = () => {
        setIsEditing(false);
        setSaveError("");
        setSaveSuccess(false);
        setAvatarPreview(null);
        setAvatarFile(null);
    };

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
                                <span className="ph-sep"><FaChevronRight /></span>
                                <span>{tProfile?.breadcrumb?.profile}</span>
                            </div>

                            <div className="profile-card-top">
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
                                    <div className="avatar-badge">{isEditing ? <FaCamera /> : <FaGraduationCap />}</div>
                                    {isEditing && (
                                        <div style={{
                                            position: "absolute", inset: 0, borderRadius: "50%",
                                            background: "rgba(0,0,0,0.35)", display: "flex",
                                            alignItems: "center", justifyContent: "center",
                                            fontSize: 22, opacity: 0.85,
                                        }}><FaCamera /></div>
                                    )}
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleAvatarChange}
                                    />
                                </div>

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
                                        <div>
                                            <div className="profile-role-tag">
                                                <span>●</span>
                                                <span>{isAr ? student.roleAr : student.roleEn}</span>
                                            </div>
                                            <div className="profile-name">{isAr ? student.nameAr : student.nameEn}</div>
                                            <div className="profile-meta">
                                                <div className="profile-meta-item"><FaUniversity /> {isAr ? student.universityAr : student.universityEn}</div>
                                                {student.email && (
                                                    <>
                                                        <div className="profile-meta-dot" />
                                                        <div className="profile-meta-item"><FaEnvelope /> {student.email}</div>
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
                    </div>

                    {/* ══ TABS ══ */}
                    <div className="profile-tabs">
                        <button className={`ptab ${activeTab === "research" ? "on" : ""}`} onClick={() => setActiveTab("research")}>
                            {isAr ? "الأبحاث" : "Research"}
                        </button>
                        <button className={`ptab ${activeTab === "info" ? "on" : ""}`} onClick={() => setActiveTab("info")}>
                            {isAr ? "المعلومات الأساسية" : "Basic Info"}
                        </button>
                        <button className={`ptab ${activeTab === "invitations" ? "on" : ""}`} onClick={() => setActiveTab("invitations")}>
                            {isAr ? "دعوات التحكيم" : "Review Invitations"}
                        </button>
                    </div>

                    {/* ══ PAGE BODY ══ */}
                    <div className="page-body">
                        <div>
                            {activeTab === "research" && (
                                <ResearchTab
                                    papers={papers}
                                    loading={papersLoading}
                                    error={papersError}
                                    isAr={isAr}
                                    t={t}
                                />
                            )}
                            {activeTab === "invitations" && (
                                <InvitationsTab
                                    invitations={invitations}
                                    loading={invitationsLoading}
                                    error={invitationsError}
                                    isAr={isAr}
                                    t={t}
                                    onRetry={fetchInvitations}
                                    onResponded={(id, response) => {
                                        setInvitations(prev =>
                                            prev.map(i => (i.id === id ? { ...i, response } : i))
                                        );
                                    }}
                                />
                            )}
                            {activeTab === "info" && <InfoTab student={student} isAr={isAr} t={t} />}
                        </div>
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