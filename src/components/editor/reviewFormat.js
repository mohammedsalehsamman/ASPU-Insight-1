// ← هلبرز خاصين بشكل بيانات "الملاحظات الأولية" (initial review) — خاصين بصفحة المحرر فقط
export const DECISION_OPTIONS = [
  { value: 'REVISION_REQUIRED', ar: 'طلب تعديلات', en: 'Request Changes' },
  { value: 'SEND_TO_COMMITTEE', ar: 'إرسال للجنة', en: 'Send to Committee' },
];

// الباك بيرجع الحقل باسم "notes"، بس منخلي fallback لأسامي تانية احتياط
export function extractReportText(rev) {
  if (!rev) return '';
  if (typeof rev === 'string') return rev;
  return (
    rev.notes ??
    rev.report ??
    rev.comment ??
    rev.content ??
    rev.text ??
    rev.body ??
    JSON.stringify(rev)
  );
}

export function extractDecisionLabel(rev, lang) {
  if (!rev || !rev.decision) return '';
  const found = DECISION_OPTIONS.find(o => o.value === rev.decision);
  if (found) return lang === 'ar' ? found.ar : found.en;
  return rev.decision;
}
