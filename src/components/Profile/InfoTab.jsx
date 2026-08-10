import { FaGraduationCap } from "react-icons/fa";

export default function InfoTab({ student, isAr, t }) {
    return (
        <div>
            <div className="section-label">{isAr ? "المعلومات الأساسية" : "Basic Information"}</div>
            <div className="info-card">
                <div className="info-card-title">
                    <FaGraduationCap /> <span>{isAr ? "المعلومات الأكاديمية" : "Academic Info"}</span>
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