import { useEffect, useState } from 'react';

// ← يقرأ اسم المستخدم الحالي من بيانات تسجيل الدخول المخزّنة بالـ localStorage
// نفس الآلية يلي كانت مكررة بـ Editor.jsx و EditorAssistant.jsx
function readCurrentUser() {
  if (typeof window === 'undefined') return null;
  const candidateKeys = ['authData', 'auth', 'authResponse', 'loginData', 'user', 'userData'];
  for (const key of candidateKeys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const user = parsed?.user ?? parsed;
      if (user && (user.full_name || user.email)) return user;
    } catch (e) {
      // تجاهل المفاتيح غير الصالحة والمتابعة
    }
  }
  return null;
}

export default function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    setCurrentUser(readCurrentUser());
  }, []);
  return currentUser;
}
