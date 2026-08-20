import client from "./client";

export async function getMyInvitations() {
    const res = await client.get("/api/v1/committees-app/members/mine/");
    return Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
}

export async function respondToInvitation(committeeMemberId, response) {
    const res = await client.post(
        `/api/v1/committees-app/members/${committeeMemberId}/respond/`,
        { is_approved: response === "accepted" }
    );
    return res.data;
}

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