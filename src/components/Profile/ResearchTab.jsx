import { FaPen, FaSearch, FaStar, FaFileAlt } from "react-icons/fa";

export default function ResearchTab({ papers, loading, error, isAr }) {
    const statusLabel = (status) => {
        switch (status) {
            case "published": return isAr ? "منشور" : "Published";
            case "pending": return isAr ? "قيد المراجعة" : "Under Review";
            case "rejected": return isAr ? "مرفوض" : "Rejected";
            case "needs_revision": return isAr ? "بحاجة لتعديل" : "Needs Revision";
            default: return status || (isAr ? "غير معروف" : "Unknown");
        }
    };

    const statusClass = (status) => {
        if (status === "published") return "published";
        if (status === "rejected") return "rejected";
        return "review";
    };

    if (loading) {
        return (
            <div>
                <div className="section-label">{isAr ? "الأبحاث المنشورة" : "Published Research"}</div>
                <div className="info-card">{isAr ? "جارٍ التحميل..." : "Loading..."}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <div className="section-label">{isAr ? "الأبحاث المنشورة" : "Published Research"}</div>
                <div className="info-card">{error}</div>
            </div>
        );
    }

    if (!papers || papers.length === 0) {
        return (
            <div>
                <div className="section-label">{isAr ? "الأبحاث المنشورة" : "Published Research"}</div>
                <div className="empty-state">
                    <div className="empty-state-ico"><FaFileAlt /></div>
                    <div className="empty-state-t">{isAr ? "لا توجد أبحاث بعد" : "No research yet"}</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="section-label">{isAr ? "الأبحاث المنشورة" : "Published Research"}</div>
            <div className="research-list">
                {papers.map((r) => (
                    <div key={r.id} className="research-item">
                        <div>
                            <div className="ri-type">{r.specialization}</div>
                            <div className="ri-title">{r.title}</div>
                            <div className="ri-meta">
                                {r.author_name && (
                                    <div className="ri-meta-item"><FaPen /> {r.author_name}</div>
                                )}
                                {r.plagiarism_score != null && (
                                    <div className="ri-meta-item">
                                        <FaSearch /> {isAr ? "نسبة الاقتباس" : "Plagiarism"}: {r.plagiarism_score}%
                                    </div>
                                )}
                                {r.metadata_quality_score != null && (
                                    <div className="ri-meta-item">
                                        <FaStar /> {isAr ? "جودة البيانات" : "Quality"}: {r.metadata_quality_score}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="ri-status">
                            <div className={`ri-badge ${statusClass(r.status)}`}>
                                {statusLabel(r.status)}
                            </div>
                            {r.rejection_reason && (
                                <div className="ri-reads">{r.rejection_reason}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}