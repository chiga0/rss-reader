import { useTheme } from '@/lib/theme/ThemeProvider';
import { useTranslation } from 'react-i18next';

export function ThemeSelector() {
  const { mode: theme, setTheme } = useTheme();
  const { t } = useTranslation('settings');

  return (
    <div className="space-y-2">
      <label
        htmlFor="theme-selector"
        className="block text-sm font-medium text-card-foreground"
      >
        {t('theme.title')}
      </label>
      <select
        id="theme-selector"
        data-testid="theme-selector"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary"
      >
        <option value="system">{t('theme.systemDefault')}</option>
        <option value="light">{t('theme.lightMode')}</option>
        <option value="dark">{t('theme.darkMode')}</option>
      </select>
      <p className="text-xs text-muted-foreground">
        {theme === 'system'
          ? t('theme.systemDescription')
          : t('theme.modeDescription', { mode: t(`theme.${theme}`) })}
      </p>
    </div>
  );
}
