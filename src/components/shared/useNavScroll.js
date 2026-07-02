import { useEffect, useState } from 'react';

// ← بيرجع true لما المستخدم يعمل سكرول أكتر من threshold (تستخدمها الـ Navbar لصف الـ scrolled)
export default function useNavScroll(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);
  return scrolled;
}
