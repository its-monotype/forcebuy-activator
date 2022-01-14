import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-electron-language-detector';
import { initReactI18next } from 'react-i18next';
import path from 'path';
import { remote } from 'electron';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    preload: ['en', 'ru'],
    load: 'languageOnly',
    debug: true,
    backend: {
      loadPath: `${path.join(
        remote.app.isPackaged
          ? path.join(process.resourcesPath, 'assets')
          : path.join(__dirname, '../assets')
      )}/locales/{{lng}}/{{ns}}.json`,
    },
    fallbackLng: 'en',
    whitelist: ['en', 'ru'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  });
