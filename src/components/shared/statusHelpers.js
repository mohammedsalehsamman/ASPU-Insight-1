// ← خريطة الحالات، متوافقة مع القيم يلي رجّعها الـ API
export const STATUS_MAP = {
  pending:            { ar: 'بانتظار المراجعة',     en: 'Pending Review',      cls: 'status-pending' },
  under_review:       { ar: 'قيد المراجعة',          en: 'Under Review',        cls: 'status-pending' },
  plagiarism_failed:  { ar: 'فشل فحص الانتحال',     en: 'Plagiarism Failed',   cls: 'status-rejected' },
  plagiarism_passed:  { ar: 'اجتاز فحص الانتحال',   en: 'Plagiarism Passed',   cls: 'status-noted'   },
  accepted:           { ar: 'مقبول',                 en: 'Accepted',            cls: 'status-done'    },
  rejected:           { ar: 'مرفوض',                 en: 'Rejected',            cls: 'status-rejected'},
  noted:              { ar: 'تمت الملاحظة',           en: 'Notes Added',         cls: 'status-noted'   },
};

// ← دالة موحّدة تشيك إذا فيه تقرير مساعد محرر (تُستخدم بكل مكان بدل تكرار الشرط)
export const hasAssistantReport = (paper) =>
  !!(paper?.is_reviewed_by_assistant || paper?.assistant_editor_report);

export const getStatus = (paper) => {
  if (hasAssistantReport(paper)) return STATUS_MAP['noted'];
  return STATUS_MAP[paper.status] ?? { ar: paper.status, en: paper.status, cls: 'status-pending' };
};
