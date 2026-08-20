import { createContext, useContext, useEffect, useState } from "react";
import i18n from "../i18n";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("aspu:lang") || "ar";
    } catch (e) {
      return "ar";
    }
  });

  useEffect(() => {
    try { localStorage.setItem("aspu:lang", lang); } catch (e) { }
    i18n.changeLanguage(lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang]);

  const value = { lang, setLang };
  return <LanguageContext.Provider value={value}>
    {children}
  </LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
