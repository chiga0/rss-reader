import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshIntervalSelector } from '@components/Settings/RefreshIntervalSelector';
import { ThemeSelector } from '../components/Settings/ThemeSelector';
import { LanguageSelector } from '../components/Settings/LanguageSelector';
import { OPMLExportButton } from '@components/Settings/OPMLExportButton';
import { OPMLImportDialog } from '@components/Settings/OPMLImportDialog';
import { useStore } from '@hooks/useStore';
import { storage } from '@lib/storage';
import { syncService } from '@services/syncService';
import type { UserSettings } from '@models/Feed';

const DEFAULT_SETTINGS: UserSettings = {
  id: 'default',
  theme: 'system',
  defaultRefreshIntervalMinutes: 60,
  maxArticlesPerFeed: 100,
  enableNotifications: false,
  enableBackgroundSync: true,
};

export default function Settings() {
  const { t } = useTranslation('settings');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const stored = await storage.get('settings', 'default');
      if (stored) {
        setSettings(stored);
      }
    };
    loadSettings();
  }, []);

  const handleRefreshIntervalChange = async (minutes: number) => {
    const newSettings = { ...settings, defaultRefreshIntervalMinutes: minutes };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleToggleNotifications = async () => {
    const newSettings = { ...settings, enableNotifications: !settings.enableNotifications };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleToggleBackgroundSync = async () => {
    const newSettings = { ...settings, enableBackgroundSync: !settings.enableBackgroundSync };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const saveSettings = async (newSettings: UserSettings) => {
    setIsSaving(true);
    setSaved(false);

    try {
      await storage.put('settings', newSettings);
      
      // Restart auto-refresh with new interval
      if (newSettings.enableBackgroundSync && newSettings.defaultRefreshIntervalMinutes > 0) {
        await syncService.startAutoRefresh(newSettings.defaultRefreshIntervalMinutes);
      } else {
        syncService.stopAutoRefresh();
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-2xl font-bold text-foreground">{t('title')}</h1>

      <div className="space-y-6">
        {/* Language Settings Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            {t('common:language.title')}
          </h2>
          <LanguageSelector />
        </div>

        {/* Refresh Settings Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            {t('refreshInterval.title')}
          </h2>
          
          <RefreshIntervalSelector 
            value={settings.defaultRefreshIntervalMinutes}
            onChange={handleRefreshIntervalChange}
          />

          <div className="mt-4">
            <label className="flex items-center" htmlFor="enable-background-sync">
              <input
                id="enable-background-sync"
                type="checkbox"
                checked={settings.enableBackgroundSync}
                onChange={handleToggleBackgroundSync}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-card-foreground">
                Enable background sync
              </span>
            </label>
            <p className="ml-6 mt-1 text-xs text-muted-foreground">
              Automatically refresh feeds in the background
            </p>
          </div>
        </div>

        {/* Theme Settings Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            {t('theme.title')}
          </h2>
          <ThemeSelector />
        </div>

        {/* Notification Settings Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            Notifications
          </h2>
          
          <label className="flex items-center" htmlFor="enable-notifications">
            <input
              id="enable-notifications"
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={handleToggleNotifications}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-card-foreground">
              Enable new article notifications
            </span>
          </label>
          <p className="ml-6 mt-1 text-xs text-muted-foreground">
            Get notified when new articles are available
          </p>
        </div>

        {/* OPML Import/Export Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">
            {t('opml.import')} / {t('opml.export')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="mb-1 text-sm font-medium text-card-foreground">
                {t('opml.export')}
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Export your subscriptions as an OPML file for backup or migration
              </p>
              <OPMLExportButton />
            </div>

            <div>
              <h3 className="mb-1 text-sm font-medium text-card-foreground">
                {t('opml.import')}
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Import subscriptions from an OPML file
              </p>
              <OPMLImportDialog />
            </div>
          </div>
        </div>
      </div>

      {/* Save Indicator */}
      {saved && (
        <div className="mt-4 rounded-md border border-border bg-secondary p-3 text-center text-sm text-secondary-foreground">
          ✓ Settings saved
        </div>
      )}

      {isSaving && (
        <div className="mt-4 rounded-md border border-border bg-secondary p-3 text-center text-sm text-muted-foreground">
          Saving...
        </div>
      )}
    </div>
  );
}