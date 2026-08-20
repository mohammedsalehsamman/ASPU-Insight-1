import { useState } from "react";
import {
    FaGavel,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaUserFriends,
    FaFileAlt,
    FaTimes,
    FaDownload,
    FaCalendarAlt,
    FaUserSecret,
} from "react-icons/fa";
import {
    respondToInvitation,
    getCommitteePaperDetails,
    submitPaperDecision, // ⚠ تأكد إنها موجودة بـ api/committees.js — شوف الملاحظة تحت الرد
} from "../../api/committees";
import { downloadPaper } from "../../api/research";

/* ══ قيم القرار بالحرف متل ما الباك مستنيها (DECISION_CHOICES) ══ */
const DECISION_OPTIONS = [
    { value: "accept_paper", labelAr: "قبول الورقة", labelEn: "Accept Paper" },
    { value: "reject_paper", labelAr: "رفض الورقة", labelEn: "Reject Paper" },
    { value: "modify_paper", labelAr: "طلب تعديلات", labelEn: "Request Modifications" },
];

/* ══ تنسيق الحالة (response / decision) ══ */
function getStatusMeta(status, isAr) {
    const map = {
        pending: { labelAr: "قيد الانتظار", labelEn: "Pending", cls: "status-pending", icon: <FaClock /> },
        accepted: { labelAr: "مقبولة", labelEn: "Accepted", cls: "status-accepted", icon: <FaCheckCircle /> },
        approved: { labelAr: "مقبولة", labelEn: "Approved", cls: "status-accepted", icon: <FaCheckCircle /> },
        declined: { labelAr: "مرفوضة", labelEn: "Declined", cls: "status-declined", icon: <FaTimesCircle /> },
        rejected: { labelAr: "مرفوضة", labelEn: "Rejected", cls: "status-declined", icon: <FaTimesCircle /> },
        committee_review: { labelAr: "قيد مراجعة اللجنة", labelEn: "Committee Review", cls: "status-pending", icon: <FaClock /> },
        accept_paper: { labelAr: "مقبولة", labelEn: "Accepted", cls: "status-accepted", icon: <FaCheckCircle /> },
        reject_paper: { labelAr: "مرفوضة", labelEn: "Rejected", cls: "status-declined", icon: <FaTimesCircle /> },
        modify_paper: { labelAr: "طلب تعديلات", labelEn: "Modifications Requested", cls: "status-pending", icon: <FaClock /> },
    };
    const meta = map[status] || map.pending;
    return { ...meta, label: isAr ? meta.labelAr : meta.labelEn };
}

function formatDate(iso, isAr) {
    if (!iso) return "";
    try {
        return new Date(iso).toLocaleDateString(isAr ? "ar-EG" : "en-US", {
            year: "numeric", month: "short", day: "numeric",
        });
    } catch {
        return iso;
    }
}

const roleLabel = (role, isAr) => {
    const map = {
        primary: { ar: "محكّم رئيسي", en: "Primary Reviewer" },
        secondary: { ar: "محكّم مساعد", en: "Secondary Reviewer" },
    };
    const r = map[role] || { ar: role, en: role };
    return isAr ? r.ar : r.en;
};

/* ══ سكيلتون التحميل ══ */
function InvitationsSkeleton() {
    return (
        <div className="invitations-list">
            {[1, 2, 3].map(i => (
                <div key={i} className="invitation-card skeleton-card">
                    <div className="sk-line sk-title" />
                    <div className="sk-line sk-text" />
                    <div className="sk-line sk-text short" />
                </div>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════
   مودال تفاصيل البحث — بيفتح لما المحكّم يضغط على كارد
   دعوة مقبولة. بيجيب البيانات من getCommitteePaperDetails
   (نسخة البحث المحجوبة حسب نوع التعمية)، وبيسمح للمحكّم
   يبعت قراره (decision) عبر راديو بوتن بالقيم يلي الباك
   عم يستناها بالحرف (accept_paper / reject_paper / modify_paper).
══════════════════════════════════════════════════ */
function PaperDetailsModal({ invitation, isAr, onClose, onDecisionSubmitted }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // ── حالة إرسال القرار ──
    const [decision, setDecision] = useState(invitation.paper_decision && invitation.paper_decision !== "pending" ? invitation.paper_decision : "");
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useState(() => {
        let cancelled = false;
        setLoading(true);
        setErr("");
        getCommitteePaperDetails(invitation.paper_id)
            .then(res => { if (!cancelled) setData(res); })
            .catch(e => {
                if (!cancelled) {
                    setErr(
                        e?.response?.data?.detail ||
                        (isAr ? "تعذّر تحميل تفاصيل البحث" : "Failed to load paper details")
                    );
                }
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── تحميل ملف الـ PDF عبر الـ API الموثّق (blob) بدل رابط /media/ الخام ── */
    const handleDownloadPdf = async () => {
        if (!data?.pdf_file) return;
        try {
            const blob = await downloadPaper(invitation.paper_id);
            const filename = data.pdf_file.split('/').pop() || 'paper.pdf';
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmitDecision = async () => {
        if (!decision) return;
        setSubmitting(true);
        setSubmitErr("");
        try {
            // ⚠ تأكد إنو submitPaperDecision عم تبعت القيمة بالحرف متل ما بالـ choices
            await submitPaperDecision(invitation.id, decision, note);
            setSubmitted(true);
            onDecisionSubmitted?.(invitation.id, decision);
        } catch (e) {
            setSubmitErr(
                e?.response?.data?.detail ||
                (isAr ? "تعذّر إرسال القرار، حاول مرة أخرى" : "Failed to submit decision, try again")
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 999,
                background: "rgba(13,15,18,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 16,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: "var(--surf2, #171b21)",
                    border: "1px solid var(--bd, rgba(255,255,255,0.08))",
                    borderRadius: 16,
                    maxWidth: 560,
                    width: "100%",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    padding: 24,
                    position: "relative",
                }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute", top: 16, insetInlineEnd: 16,
                        background: "transparent", border: "none", cursor: "pointer",
                        color: "inherit", opacity: 0.6, fontSize: 18,
                        display: "flex", alignItems: "center",
                    }}
                >
                    <FaTimes />
                </button>

                {loading && (
                    <p style={{ opacity: 0.7, fontSize: 14 }}>
                        {isAr ? "جارٍ التحميل..." : "Loading..."}
                    </p>
                )}

                {!loading && err && (
                    <p style={{ color: "#EF4444", fontSize: 14 }}>{err}</p>
                )}

                {!loading && !err && data && (
                    <>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            fontSize: 12, fontWeight: 600, color: "#C4A55A",
                            background: "rgba(196,165,90,0.1)",
                            border: "1px solid rgba(196,165,90,0.3)",
                            borderRadius: 20, padding: "4px 12px", marginBottom: 14,
                        }}>
                            <FaUserSecret size={12} />
                            {data.author_name}
                        </div>

                        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 14px" }}>
                            {data.title}
                        </h2>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 16, fontSize: 13, opacity: 0.8 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                <FaCalendarAlt size={12} /> {formatDate(data.created_at, isAr)}
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                {data.is_paid_open_access
                                    ? (isAr ? "وصول مفتوح مدفوع" : "Paid Open Access")
                                    : (isAr ? "وصول مقيّد" : "Restricted Access")}
                            </span>
                        </div>

                        <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.6, marginBottom: 6 }}>
                            {isAr ? "الملخص" : "Abstract"}
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                            {data.abstract}
                        </p>

                        {data.rejection_reason && (
                            <p style={{ fontSize: 13, color: "#EF4444", marginBottom: 16 }}>
                                {isAr ? "سبب الرفض: " : "Rejection reason: "}{data.rejection_reason}
                            </p>
                        )}

                        {data.pdf_file ? (
                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                                className="edit-btn primary sm"
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 22 }}
                            >
                                <FaDownload size={12} />
                                {isAr ? "تحميل ملف البحث" : "Download Paper"}
                            </button>
                        ) : (
                            <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 22 }}>
                                {isAr ? "لا يوجد ملف مرفق" : "No file attached"}
                            </p>
                        )}

                        {/* ══ قسم قرار المحكّم ══ */}
                        <div style={{
                            borderTop: "1px solid var(--bd, rgba(255,255,255,0.08))",
                            paddingTop: 18,
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                                {isAr ? "قرارك على البحث" : "Your decision on the paper"}
                            </div>

                            {submitted ? (
                                <div className={`inv-status-pill ${getStatusMeta(decision, isAr).cls}`} style={{ display: "inline-flex" }}>
                                    {getStatusMeta(decision, isAr).icon} {getStatusMeta(decision, isAr).label}
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                                        {DECISION_OPTIONS.map(opt => (
                                            <label
                                                key={opt.value}
                                                style={{
                                                    display: "flex", alignItems: "center", gap: 8,
                                                    fontSize: 14, cursor: "pointer",
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`decision-${invitation.id}`}
                                                    value={opt.value}
                                                    checked={decision === opt.value}
                                                    onChange={() => setDecision(opt.value)}
                                                />
                                                {isAr ? opt.labelAr : opt.labelEn}
                                            </label>
                                        ))}
                                    </div>

                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        placeholder={isAr ? "ملاحظات (اختياري)" : "Notes (optional)"}
                                        rows={3}
                                        style={{
                                            width: "100%",
                                            resize: "vertical",
                                            borderRadius: 8,
                                            padding: 10,
                                            fontSize: 13,
                                            marginBottom: 12,
                                            background: "transparent",
                                            color: "inherit",
                                            border: "1px solid var(--bd, rgba(255,255,255,0.15))",
                                        }}
                                    />

                                    {submitErr && (
                                        <div className="form-msg error" style={{ marginBottom: 10 }}>
                                            {submitErr}
                                        </div>
                                    )}

                                    <button
                                        className="edit-btn primary sm"
                                        disabled={!decision || submitting}
                                        onClick={handleSubmitDecision}
                                    >
                                        {submitting
                                            ? (isAr ? "جارٍ الإرسال..." : "Submitting...")
                                            : (isAr ? "إرسال القرار" : "Submit Decision")}
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ══ بطاقة دعوة واحدة ══ */
function InvitationCard({ invitation, isAr, t, onResponded, onDecisionSubmitted }) {
    const [busy, setBusy] = useState(false);
    const [localResponse, setLocalResponse] = useState(invitation.response);
    const [localDecision, setLocalDecision] = useState(invitation.paper_decision);
    const [err, setErr] = useState("");
    const [detailsOpen, setDetailsOpen] = useState(false);

    const responseMeta = getStatusMeta(localResponse, isAr);
    const decisionMeta = getStatusMeta(localDecision, isAr);
    const isAccepted = localResponse === "accepted" || localResponse === "approved";

    const handleRespond = async (value) => {
        setBusy(true);
        setErr("");
        try {
            // ⚠ الـ id هون هو نفسه committee_member_id يلي بيتوقعه /respond/
            await respondToInvitation(invitation.id, value);
            setLocalResponse(value);
            onResponded?.(invitation.id, value);
        } catch (e) {
            setErr(
                e?.response?.data?.detail ||
                (isAr ? "تعذّر إرسال الرد، حاول مرة أخرى" : "Failed to respond, try again")
            );
        } finally {
            setBusy(false);
        }
    };

    const handleCardClick = () => {
        // بس إذا الدعوة مقبولة منسمح نفتح تفاصيل البحث
        if (!isAccepted) return;
        // ⚠ محتاجين invitation.paper_id — لسا مش مؤكد إنو الباك عم يرجعه
        if (!invitation.paper_id) {
            setErr(isAr ? "معرّف البحث غير متوفر من الخادم" : "Paper id not available from server");
            return;
        }
        setDetailsOpen(true);
    };

    const handleDecisionSubmitted = (id, decisionValue) => {
        setLocalDecision(decisionValue);
        onDecisionSubmitted?.(id, decisionValue);
    };

    return (
        <>
            <div
                className="invitation-card"
                style={{ cursor: isAccepted ? "pointer" : "default" }}
                onClick={handleCardClick}
            >
                <div className="inv-card-head">
                    <div className="inv-icon"><FaGavel /></div>
                    <div className="inv-head-text">
                        <div className="inv-paper-title">{invitation.paper_title}</div>
                        <div className="inv-meta-row">
                            <span className="inv-meta-item"><FaUserFriends /> {roleLabel(invitation.role, isAr)}</span>
                            {invitation.is_substitute && (
                                <span className="inv-badge substitute">
                                    {isAr ? "بديل" : "Substitute"}
                                </span>
                            )}
                            <span className="inv-meta-item">{formatDate(invitation.assigned_at, isAr)}</span>
                        </div>
                    </div>
                    <div className={`inv-status-pill ${responseMeta.cls}`}>
                        {responseMeta.icon} {responseMeta.label}
                    </div>
                </div>

                {invitation.paper_abstract && (
                    <p className="inv-abstract">
                        <FaFileAlt className="inv-abstract-icon" />
                        {invitation.paper_abstract}
                    </p>
                )}

                <div className="inv-card-footer">
                    <div className={`inv-decision-tag ${decisionMeta.cls}`}>
                        {isAr ? "قرار البحث: " : "Paper decision: "} {decisionMeta.label}
                    </div>

                    {localResponse === "pending" && (
                        <div className="inv-actions" onClick={e => e.stopPropagation()}>
                            <button
                                className="edit-btn primary sm"
                                disabled={busy}
                                onClick={() => handleRespond("accepted")}
                            >
                                {busy ? (isAr ? "جارٍ الإرسال..." : "Sending...") : (isAr ? "قبول" : "Accept")}
                            </button>
                            <button
                                className="edit-btn sm"
                                disabled={busy}
                                onClick={() => handleRespond("declined")}
                            >
                                {isAr ? "رفض" : "Decline"}
                            </button>
                        </div>
                    )}

                    {isAccepted && (
                        <span style={{ fontSize: 12, opacity: 0.6 }}>
                            {isAr ? "اضغط لعرض تفاصيل البحث" : "Click to view paper details"}
                        </span>
                    )}
                </div>

                {err && <div className="form-msg error">{err}</div>}
            </div>

            {detailsOpen && (
                <PaperDetailsModal
                    invitation={invitation}
                    isAr={isAr}
                    onClose={() => setDetailsOpen(false)}
                    onDecisionSubmitted={handleDecisionSubmitted}
                />
            )}
        </>
    );
}

/* ══ المكوّن الرئيسي ══ */
export default function InvitationsTab({ invitations, loading, error, isAr, t, onRetry, onResponded, onDecisionSubmitted }) {
    if (loading) return <InvitationsSkeleton />;

    if (error) {
        return (
            <div className="invitations-error">
                <p>{error}</p>
                {onRetry && (
                    <button className="edit-btn" onClick={onRetry}>
                        {isAr ? "إعادة المحاولة" : "Retry"}
                    </button>
                )}
            </div>
        );
    }

    if (!invitations || invitations.length === 0) {
        return (
            <div className="invitations-empty">
                <FaGavel size={32} />
                <p>{isAr ? "لا توجد دعوات تحكيم حالياً" : "No review invitations yet"}</p>
            </div>
        );
    }

    return (
        <div className="invitations-list">
            {invitations.map(inv => (
                <InvitationCard
                    key={inv.id}
                    invitation={inv}
                    isAr={isAr}
                    t={t}
                    onResponded={onResponded}
                    onDecisionSubmitted={onDecisionSubmitted}
                />
            ))}
        </div>
    );
}