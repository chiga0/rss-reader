import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from './en/common.json';
import enFeed from './en/feed.json';
import enArticle from './en/article.json';
import enCategory from './en/category.json';
import enSettings from './en/settings.json';

import zhCommon from './zh/common.json';
import zhFeed from './zh/feed.json';
import zhArticle from './zh/article.json';
import zhCategory from './zh/category.json';
import zhSettings from './zh/settings.json';

const resources = {
  en: {
    common: enCommon,
    feed: enFeed,
    article: enArticle,
    category: enCategory,
    settings: enSettings,
  },
  zh: {
    common: zhCommon,
    feed: zhFeed,
    article: zhArticle,
    category: zhCategory,
    settings: zhSettings,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'feed', 'article', 'category', 'settings'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;