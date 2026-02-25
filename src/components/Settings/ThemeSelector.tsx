import { useTheme } from '@/lib/theme/ThemeProvider';

export function ThemeSelector() {
  const { mode: theme, setTheme } = useTheme();

  return (
    <div className="space-y-2">
      <label
        htmlFor="theme-selector"
        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        Theme
      </label>
      <select
        id="theme-selector"
        data-testid="theme-selector"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
      >
        <option value="system">🌓 System Default</option>
        <option value="light">☀️ Light</option>
        <option value="dark">🌙 Dark</option>
      </select>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {theme === 'system'
          ? 'Automatically matches your system theme preference'
          : `Using ${theme} theme`}
      </p>
    </div>
  );
}
