import LogoMark from './LogoMark';

const FOOTER_COLS = [
  { title_ar: 'الأبحاث', title_en: 'Research', links: [['آخر الإضافات', 'Latest'], ['الأكثر تقييماً', 'Top Rated'], ['حسب التخصص', 'By Discipline'], ['الأرشيف', 'Archive']] },
  { title_ar: 'للطلبة', title_en: 'Students', links: [['تقديم بحث', 'Submit Paper'], ['إرشادات النشر', 'Guidelines'], ['فحص التشابه', 'Similarity Check']] },
  { title_ar: 'للأساتذة', title_en: 'Faculty', links: [['لوحة المراجعة', 'Review Panel'], ['تقارير النزاهة', 'Integrity Reports'], ['إدارة اللجنة', 'Committee']] },
];

export default function EditorFooter({ lang }) {
  return (
    <footer className="ea-footer">
      <div className="ft-grid">
        <div>
          <div className="ft-brand">
            <LogoMark />
            <div>
              <div className="logo-n">ASPU Insight</div>
              <div className="logo-s">{lang === 'ar' ? 'المجلة الأكاديمية الرقمية' : 'Digital Academic Journal'}</div>
            </div>
          </div>
          <p className="ft-desc">
            {lang === 'ar'
              ? 'مجلة رقمية أكاديمية تسلط الضوء على أبحاث الطلبة وإنجازاتهم في جامعة الشام الخاصة.'
              : 'A digital academic journal spotlighting student research at Al-Sham Private University.'}
          </p>
        </div>
        {FOOTER_COLS.map((col, i) => (
          <div className="ft-col" key={i}>
            <h5>{lang === 'ar' ? col.title_ar : col.title_en}</h5>
            <ul>
              {col.links.map(([ar, en], j) => (
                <li key={j}><a href="#">{lang === 'ar' ? ar : en}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="ft-btm">
        <span>© 2025 ASPU Insight — {lang === 'ar' ? 'جامعة الشام الخاصة' : 'Al-Sham Private University'}</span>
        <span>{lang === 'ar' ? 'مشروع تخرج · 2025–2026' : 'Graduation Project · 2025–2026'}</span>
      </div>
    </footer>
  );
}
