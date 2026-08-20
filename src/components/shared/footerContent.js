// ← نفس محتوى الفوتر يلي كان مكرر جوا Editor.jsx و EditorAssistant.jsx و PaperDetail.jsx
// بيرجع الشكل يلي متوقعه الـ Footer المشترك: { brand, cols: [{ title, links: [{label, path}] }], copy, sub }
export function getFooterContent(lang) {
  return {
    brand: lang === 'ar'
      ? 'مجلة رقمية أكاديمية تسلط الضوء على أبحاث الطلبة وإنجازاتهم في جامعة الشام الخاصة.'
      : 'A digital academic journal spotlighting student research at Al-Sham Private University.',
    cols: [
      {
        title: lang === 'ar' ? 'الأبحاث' : 'Research',
        links: [
          { label: lang === 'ar' ? 'آخر الإضافات' : 'Latest', path: '/' },
          { label: lang === 'ar' ? 'الأكثر تقييماً' : 'Top Rated', path: '/research_review' },
          { label: lang === 'ar' ? 'حسب التخصص' : 'By Discipline', path: '/research_review' },
          { label: lang === 'ar' ? 'الأرشيف' : 'Archive', path: '/research_review' },
        ],
      },
      {
        title: lang === 'ar' ? 'للطلبة' : 'Students',
        links: [
          { label: lang === 'ar' ? 'تقديم بحث' : 'Submit Paper', path: '/submit' },
          { label: lang === 'ar' ? 'إرشادات النشر' : 'Guidelines', path: '/submit' },
          { label: lang === 'ar' ? 'فحص التشابه' : 'Similarity Check', path: '/EditorAssistant' },
        ],
      },
      {
        title: lang === 'ar' ? 'للأساتذة' : 'Faculty',
        links: [
          { label: lang === 'ar' ? 'لوحة المراجعة' : 'Review Panel', path: '/EditorAssistant' },
          { label: lang === 'ar' ? 'تقارير النزاهة' : 'Integrity Reports', path: '/EditorAssistant' },
          { label: lang === 'ar' ? 'إدارة اللجنة' : 'Committee', path: '/Editor' },
        ],
      },
    ],
    copy: lang === 'ar'
      ? '© 2025 ASPU Insight — جامعة الشام الخاصة'
      : '© 2025 ASPU Insight — Al-Sham Private University',
    sub: lang === 'ar' ? 'مشروع تخرج · 2025–2026' : 'Graduation Project · 2025–2026',
  };
}
