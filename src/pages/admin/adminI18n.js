import { useLanguage } from '../../context/LanguageContext';

/* لغة لوحة الأدمن — نفس اللغة المشتركة لكامل الموقع (LanguageContext)، مشتركة بين كل صفحات /admin */
export function useAdminLang() {
  const { lang, setLang } = useLanguage();
  return [lang, setLang];
}

const DICT = {
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  users: { ar: 'المستخدمون', en: 'Users' },
  papers: { ar: 'الأبحاث', en: 'Papers' },
  reviews: { ar: 'المراجعات واللجان', en: 'Reviews & Committees' },
  settings: { ar: 'إعدادات المجلة', en: 'Journal Settings' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  admin_panel: { ar: 'لوحة تحكم الأدمن', en: 'Admin Panel' },
  search_ph: { ar: 'ابحث...', en: 'Search...' },
  loading: { ar: 'جارٍ التحميل...', en: 'Loading...' },
  error: { ar: 'حدث خطأ أثناء جلب البيانات', en: 'Failed to load data' },
  retry: { ar: 'إعادة المحاولة', en: 'Retry' },
  no_results: { ar: 'لا توجد نتائج', en: 'No results found' },
  no_results_sub: { ar: 'جرّب تغيير الفلاتر أو مصطلح البحث', en: 'Try changing filters or search term' },
  all: { ar: 'الكل', en: 'All' },
  yes: { ar: 'نعم', en: 'Yes' },
  no: { ar: 'لا', en: 'No' },
  save: { ar: 'حفظ', en: 'Save' },
  saving: { ar: 'جارٍ الحفظ...', en: 'Saving...' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  edit: { ar: 'تعديل', en: 'Edit' },
  close: { ar: 'إغلاق', en: 'Close' },
  actions: { ar: 'إجراءات', en: 'Actions' },
  role: { ar: 'الدور', en: 'Role' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  name: { ar: 'الاسم', en: 'Name' },
  status: { ar: 'الحالة', en: 'Status' },
  active: { ar: 'نشط', en: 'Active' },
  inactive: { ar: 'معطّل', en: 'Inactive' },
  verified: { ar: 'موثّق', en: 'Verified' },
  not_verified: { ar: 'غير موثّق', en: 'Not Verified' },
  next: { ar: 'التالي', en: 'Next' },
  prev: { ar: 'السابق', en: 'Previous' },
  confirm: { ar: 'تأكيد', en: 'Confirm' },
  success: { ar: 'تم بنجاح', en: 'Success' },

  // ── Users.jsx ──
  action_failed: { ar: 'فشل تنفيذ الإجراء', en: 'Action failed' },
  verification_failed: { ar: 'فشل التوثيق', en: 'Verification failed' },
  verification_sent: { ar: 'تم إرسال رابط التوثيق', en: 'Verification email sent' },
  send_failed: { ar: 'فشل الإرسال', en: 'Failed to send' },
  users_page_sub: { ar: 'إدارة كل مستخدمي المنصة، أدوارهم، وحالة حساباتهم', en: 'Manage all platform users, their roles, and account status' },
  all_roles: { ar: 'كل الأدوار', en: 'All Roles' },
  all_statuses: { ar: 'كل الحالات', en: 'All Statuses' },
  all_verification: { ar: 'كل حالات التوثيق', en: 'All Verification' },
  newest_first: { ar: 'الأحدث أولاً', en: 'Newest First' },
  oldest_first: { ar: 'الأقدم أولاً', en: 'Oldest First' },
  name_asc: { ar: 'الاسم (أ-ي)', en: 'Name (A-Z)' },
  verification_col: { ar: 'التوثيق', en: 'Verification' },
  resend: { ar: 'إعادة إرسال', en: 'Resend' },

  // ── Reviews.jsx ──
  reviews_page_sub: { ar: 'عرض شامل لمراجعات المحررين والمساعدين ولجان التحكيم', en: 'Overview of editor reviews, assistant reviews, and committees' },

  // ── AdminLayout.jsx ──
  admin_role_fallback: { ar: 'مدير النظام', en: 'Administrator' },

  // ── Settings.jsx ──
  settings_save_failed: { ar: 'فشل حفظ الإعدادات', en: 'Failed to save settings' },
  settings_page_sub: { ar: 'التحكم بنمط الوصول العام لمحتوى المجلة الأكاديمية', en: 'Control the public access mode of the academic journal content' },

  // ── Papers.jsx ──
  papers_page_sub: { ar: 'إشراف شامل على كل الأبحاث المقدَّمة وحالتها ومحرريها', en: 'Full oversight of all submitted papers, status, and editors' },
  papers_search_ph: { ar: 'ابحث بالعنوان أو الباحث...', en: 'Search by title or author...' },
  title_asc: { ar: 'العنوان (أ-ي)', en: 'Title (A-Z)' },
  title_col: { ar: 'العنوان', en: 'Title' },
  author_col: { ar: 'الباحث', en: 'Author' },
  editor_col: { ar: 'المحرر', en: 'Editor' },
  unassigned: { ar: 'غير معيّن', en: 'Unassigned' },

  // ── Dashboard.jsx ──
  dashboard_page_sub: { ar: 'نظرة عامة شاملة على أداء المجلة الأكاديمية', en: 'A comprehensive overview of journal performance' },

  disable_confirm: { ar: 'هل أنت متأكد من تعطيل {name}؟', en: 'Disable {name}?' },
  users_count: { ar: '{count} مستخدم', en: '{count} users' },
  papers_count: { ar: '{count} بحث', en: '{count} papers' },

  // ── PaperDrawer.jsx ──
  paper_details_title: { ar: 'تفاصيل البحث', en: 'Paper Details' },
  reference_id: { ar: 'الرقم المرجعي', en: 'Reference ID' },
  plagiarism_score: { ar: 'درجة الانتحال', en: 'Plagiarism Score' },
  paid_open_access: { ar: 'وصول مفتوح مدفوع', en: 'Paid Open Access' },
  abstract_label: { ar: 'الملخص', en: 'Abstract' },
  status_history: { ar: 'سجل تغيّر الحالة', en: 'Status History' },
  no_history: { ar: 'لا يوجد سجل بعد', en: 'No history yet' },
};

export function adminT(lang, key, vars) {
  const template = DICT[key]?.[lang] ?? DICT[key]?.ar ?? key;
  if (!vars) return template;
  return Object.keys(vars).reduce(
    (str, k) => str.replace(`{${k}}`, vars[k]),
    template
  );
}
