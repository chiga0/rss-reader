/**
 * Language Selector Component
 * Allows users to switch between supported languages
 */

import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

export function LanguageSelector() {
  const { t, i18n } = useTranslation('common');

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
        <Languages className="h-4 w-4" />
        {t('language.title')}
      </label>
      <div className="flex gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              i18n.language === lang.code || (i18n.language.startsWith(lang.code))
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-card-foreground hover:bg-accent'
            }`}
          >
            {lang.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
}