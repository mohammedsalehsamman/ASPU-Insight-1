import client from "./client";

/* ══════════════════════════════════════════════════
   جلب دعوات التحكيم الخاصة بالمستخدم الحالي
   الريسبونس paginated: { count, next, previous, results: [...] }
   منستخرج results هون حتى الكومبوننتات المستهلكة تضل شغالة
   من غير أي تعديل عليها.
══════════════════════════════════════════════════ */
export async function getMyInvitations() {
    const res = await client.get("/api/v1/committees-app/members/mine/");
    return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
}

/* ══════════════════════════════════════════════════
   الرد على دعوة تحكيم (قبول / رفض)
   ⚠ تحديث: الباك غيّر الـ endpoint والـ method والـ body كلياً:
     - القديم: PATCH /members/{invitationId}/invitation/   { response }
     - الجديد: POST  /members/{committee_member_id}/respond/  { is_approved }
   الـ committee_member_id هو نفسه invitation.id يلي عم يرجعه /members/mine/
   (شفناها بالـ Postman: "Method PATCH not allowed" كان بسبب هاد التغيير)
══════════════════════════════════════════════════ */
export async function respondToInvitation(committeeMemberId, response) {
    // response: "accepted" | "declined"
    const res = await client.post(
        `/api/v1/committees-app/members/${committeeMemberId}/respond/`,
        { is_approved: response === "accepted" }
    );
    return res.data;
}

/* ══════════════════════════════════════════════════
   تفاصيل البحث كما تظهر للجنة (محجوبة حسب نوع التعمية —
   الاسم بيطلع "Anonymous Author (Hidden for Committee Review)"
   بحالة single/double blind)
   ⚠ يحتاج paper_id — لازم نتأكد إنو الباك عم يرجعه ضمن
   عناصر /members/mine/ (مش موجود بالعينة يلي شفناها لهلق)
══════════════════════════════════════════════════ */
export async function getCommitteePaperDetails(paperId) {
    const res = await client.get(`/api/v1/committees-app/papers/${paperId}/details/`);
    return res.data;
}

export async function submitPaperDecision(committeeMemberId, decision, comment = "") {
    const body = { decision };
    if (comment) body.comment = comment;

    const res = await client.post(
        `/api/v1/committees-app/members/${committeeMemberId}/decision/`,
        body
    );
    return res.data;
}