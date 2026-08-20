import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ar } from "./ar";
import { en } from "./en";

export { ar, en };
export { EditorAssistantDict, EditorDict, PaperDetailDict, SubmitDict, EditPaperDict, AllNotificationsDict, createLocalT } from "./pageDicts";

export const resources = {
  ar: { translation: ar },
  en: { translation: en },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "ar",
    fallbackLng: "ar",
    interpolation: { escapeValue: false },
  });
}

export default i18n;
