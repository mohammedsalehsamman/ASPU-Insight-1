// شعار المجلة — شكل واحد مستخدم بكل الصفحات (Assistant + Editor + Navbar + Footer)
// أضفت prop اسمها size حتى تنسجم مع الاستخدام يلي بالـ Navbar/Footer الجاهزين: <Logo size={36} />
export default function LogoSVG({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#0D0F12"/>
      <circle cx="20" cy="19" r="14" fill="none" stroke="#C4A55A" strokeWidth="0.6" opacity="0.5"/>
      <path d="M14,22 Q14,14 20,12 Q26,14 26,22 Q26,28 20,29 Q14,28 14,22 Z" fill="#141820" stroke="#C4A55A" strokeWidth="0.9"/>
      <line x1="20" y1="12" x2="20" y2="29" stroke="#C4A55A" strokeWidth="1"/>
      <polygon points="20,13 16.5,20 23.5,20" fill="#C4A55A"/>
      <line x1="16.4" y1="20" x2="13" y2="24" stroke="#5A8FA0" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="17.5" y1="20" x2="15" y2="25" stroke="#6FA07A" strokeWidth="1" strokeLinecap="round" opacity="0.8"/>
      <line x1="20" y1="20" x2="20" y2="26" stroke="#C4A55A" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="22.5" y1="20" x2="25" y2="25" stroke="#8B6030" strokeWidth="1" strokeLinecap="round" opacity="0.8"/>
      <line x1="23.6" y1="20" x2="27" y2="24" stroke="#7A5A30" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="20" cy="13" r="1.5" fill="#E8D090"/>
    </svg>
  );
}
