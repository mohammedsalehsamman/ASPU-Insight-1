import { useState, useEffect, useCallback } from 'react';

/* لغة لوحة الأدمن — محفوظة بشكل منفصل عن i18next الرئيسي، مشتركة بين كل صفحات /admin */
export function useAdminLang() {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('aspu:admin:lang') || 'ar'; } catch { return 'ar'; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem('aspu:admin:lang', l); } catch { /* noop */ }
  }, []);

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
};

export function adminT(lang, key) {
  return DICT[key]?.[lang] ?? DICT[key]?.ar ?? key;
}
