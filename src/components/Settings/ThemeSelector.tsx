import { useTheme } from '@/lib/theme/ThemeProvider';

export function ThemeSelector() {
  const { mode: theme, setTheme } = useTheme();

  return (
    <div className="space-y-2">
      <label
        htmlFor="theme-selector"
        className="block text-sm font-medium text-card-foreground"
      >
        Theme
      </label>
      <select
        id="theme-selector"
        data-testid="theme-selector"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="block w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary"
      >
        <option value="system">🌓 System Default</option>
        <option value="light">☀️ Light</option>
        <option value="dark">🌙 Dark</option>
      </select>
      <p className="text-xs text-muted-foreground">
        {theme === 'system'
          ? 'Automatically matches your system theme preference'
          : `Using ${theme} theme`}
      </p>
    </div>
  );
}
