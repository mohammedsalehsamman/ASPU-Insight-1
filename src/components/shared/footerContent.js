// ← نفس محتوى الفوتر يلي كان مكرر جوا Editor.jsx و EditorAssistant.jsx
// بيرجع الشكل يلي متوقعه الـ Footer المشترك: { brand, cols, copy, sub }
export function getFooterContent(lang) {
  return {
    brand: lang === 'ar'
      ? 'مجلة رقمية أكاديمية تسلط الضوء على أبحاث الطلبة وإنجازاتهم في جامعة الشام الخاصة.'
      : 'A digital academic journal spotlighting student research at Al-Sham Private University.',
    cols: [
      {
        title: lang === 'ar' ? 'الأبحاث' : 'Research',
        links: lang === 'ar'
          ? ['آخر الإضافات', 'الأكثر تقييماً', 'حسب التخصص', 'الأرشيف']
          : ['Latest', 'Top Rated', 'By Discipline', 'Archive'],
      },
      {
        title: lang === 'ar' ? 'للطلبة' : 'Students',
        links: lang === 'ar'
          ? ['تقديم بحث', 'إرشادات النشر', 'فحص التشابه']
          : ['Submit Paper', 'Guidelines', 'Similarity Check'],
      },
      {
        title: lang === 'ar' ? 'للأساتذة' : 'Faculty',
        links: lang === 'ar'
          ? ['لوحة المراجعة', 'تقارير النزاهة', 'إدارة اللجنة']
          : ['Review Panel', 'Integrity Reports', 'Committee'],
      },
    ],
    copy: lang === 'ar'
      ? '© 2025 ASPU Insight — جامعة الشام الخاصة'
      : '© 2025 ASPU Insight — Al-Sham Private University',
    sub: lang === 'ar' ? 'مشروع تخرج · 2025–2026' : 'Graduation Project · 2025–2026',
  };
}
