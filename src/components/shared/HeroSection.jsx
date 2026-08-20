import { FiCheckCircle } from 'react-icons/fi';

// ← قسم الـ Hero (البادج + العنوان + الإحصائيات) — نفس الشكل بالضبط بالصفحتين
// الفرق الوحيد هو نص role_badge (مساعد محرر / محرر) وهو جاي من t('role') أصلاً
export default function HeroSection({ lang, t, displayName, papers, statPending, statNoted }) {
  return (
    <section className="ea-hero">
      <div className="hero-grid" />
      <div className="orb o1" /><div className="orb o2" />
      <div className="hero-wm">{lang === 'ar' ? 'مراجعة' : 'Review'}</div>

      <div className="hero-inner">
        <div className="role-badge">
          {t('role')}
          <span className="badge-active"><FiCheckCircle size={12} /> ACTIVE</span>
        </div>
        <h1 className="hero-title">
          {lang === 'ar' ? (
            <>{t('welcome_ar')} <span className="ht-gold">{displayName}.</span><br />
              <span className="ht-blue">{statPending} بحثاً</span> {t('papers_await_ar')}</>
          ) : (
            <>{t('welcome_en')} <span className="ht-gold">{displayName}.</span><br />
              <span className="ht-blue">{statPending} papers</span> {t('papers_await_en')}</>
          )}
        </h1>
        <p className="hero-sub">{lang === 'ar' ? t('sub_ar') : t('sub_en')}</p>
        <div className="hero-stats">
          <div className="hstat">
            <span className="hstat-n">{papers.length}</span>
            <span className="hstat-l">{t('total')}</span>
          </div>
          <div className="hstat">
            <span className="hstat-n">{statPending}</span>
            <span className="hstat-l">{t('pending')}</span>
          </div>
          <div className="hstat">
            <span className="hstat-n">{statNoted}</span>
            <span className="hstat-l">{t('noted')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
