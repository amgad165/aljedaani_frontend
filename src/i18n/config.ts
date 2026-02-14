import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import arCommon from './locales/ar/common.json';
import enNav from './locales/en/navigation.json';
import arNav from './locales/ar/navigation.json';
import enForms from './locales/en/forms.json';
import arForms from './locales/ar/forms.json';
import enPages from './locales/en/pages.json';
import arPages from './locales/ar/pages.json';

const resources = {
  en: {
    common: enCommon,
    navigation: enNav,
    forms: enForms,
    pages: enPages,
  },
  ar: {
    common: arCommon,
    navigation: arNav,
    forms: arForms,
    pages: arPages,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'navigation', 'forms', 'pages'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
