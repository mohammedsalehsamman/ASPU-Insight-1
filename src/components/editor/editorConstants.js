// ← ثوابت/هلبرز مشتركة بين مكوّنات لوحة المحرر (منفصلة عن مكوّنات الـ JSX حتى يشتغل Fast Refresh بشكل صحيح)

export const REQUIRED_PRIMARY_COUNT = 3;

export const ASSISTANT_DECISION_MAP = {
  APPROVE: { ar: 'قبول', en: 'Approve', cls: 'status-done' },
  REJECT: { ar: 'رفض', en: 'Reject', cls: 'status-rejected' },
};

export const MEMBER_RESPONSE_MAP = {
  pending: { ar: 'بانتظار الرد', en: 'Pending', cls: 'status-pending' },
  accepted: { ar: 'وافق', en: 'Accepted', cls: 'status-done' },
  declined: { ar: 'اعتذر', en: 'Declined', cls: 'status-rejected' },
};

export const MEMBER_DECISION_MAP = {
  pending: { ar: 'قيد الدراسة', en: 'Pending', cls: 'status-pending' },
  accept_paper: { ar: 'قبول الورقة', en: 'Accept Paper', cls: 'status-done' },
  reject_paper: { ar: 'رفض الورقة', en: 'Reject Paper', cls: 'status-rejected' },
  modify_paper: { ar: 'طلب تعديلات', en: 'Request Modifications', cls: 'status-noted' },
};

export const FINAL_DECISION_OPTIONS = [
  { value: 'ACCEPT', ar: 'قبول', en: 'Accept' },
  { value: 'REJECT', ar: 'رفض', en: 'Reject' },
  { value: 'REVISION_REQUIRED', ar: 'طلب تعديلات', en: 'Request Revision' },
];

export function committeeHasVerdict(status) {
  return !!(
    status &&
    Array.isArray(status.members) &&
    status.members.some(m => m.paper_decision && m.paper_decision !== 'pending')
  );
}
