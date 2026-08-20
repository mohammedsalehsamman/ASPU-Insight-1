// ← ثوابت/هلبرز مشتركة بين مكوّنات صفحة مساعد المحرر (منفصلة عن مكوّنات الـ JSX حتى يشتغل Fast Refresh بشكل صحيح)

export const ASSISTANT_DECISION_MAP = {
  APPROVE: { ar: 'قبول', en: 'Approve', cls: 'status-done' },
  REJECT: { ar: 'رفض', en: 'Reject', cls: 'status-rejected' },
};

// ← حالة تقرير الـ IEEE (status العام: pending / completed / failed...الخ) — عرض عام لأي قيمة غير معروفة
export const IEEE_STATUS_CLS = {
  pending: 'status-pending',
  completed: 'status-done',
  failed: 'status-rejected',
};

// ← حالة تقرير تحليل الادعاءات والأدلة (نفس فلسفة IEEE_STATUS_CLS)
export const CLAIM_STATUS_CLS = {
  pending: 'status-pending',
  completed: 'status-done',
  failed: 'status-rejected',
};

// ← بيرجع لون حسب الدرجة (أخضر/أصفر/أحمر) — مستخدم بعرض درجة جودة الميتاداتا وبنودها الفرعية
export function scoreColor(score) {
  if (score >= 70) return 'var(--ac2)';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

// بتقرّب أي نسبة (مهما كانت عدد الفواصل العشرية القادم من الباك) لخانتين عشريتين للعرض
export function fmtPct(n) {
  return n == null ? n : Math.round(n * 100) / 100;
}
