import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshIntervalSelector } from '@components/Settings/RefreshIntervalSelector';
import { ThemeSelector } from '../components/Settings/ThemeSelector';
import { LanguageSelector } from '../components/Settings/LanguageSelector';
import { OPMLExportButton } from '@components/Settings/OPMLExportButton';
import { OPMLImportDialog } from '@components/Settings/OPMLImportDialog';
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

const SYNC_CONFIG_KEY = 'rss-reader-sync-config';
const NEWSLETTER_ID_KEY = 'rss-reader-newsletter-id';

function getOrCreateNewsletterId(): string {
  let id = localStorage.getItem(NEWSLETTER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(NEWSLETTER_ID_KEY, id);
  }
  return id;
}

interface SyncConfig {
  enabled: boolean;
  serverUrl: string;
  apiKey: string;
}

export default function Settings() {
  const { t } = useTranslation('settings');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync section state
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({ enabled: false, serverUrl: '', apiKey: '' });
  const [syncToast, setSyncToast] = useState('');

  // Newsletter section state
  const [newsletterId] = useState(() => getOrCreateNewsletterId());
  const [copied, setCopied] = useState(false);
  const newsletterEmail = `${newsletterId}@newsletters.rss-reader.app`;

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const stored = await storage.get('settings', 'default');
      if (stored) {
        setSettings(stored);
      }
    };
    loadSettings();

    // Load sync config
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    if (raw) {
      try { setSyncConfig(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  const handleRefreshIntervalChange = async (minutes: number) => {
    const newSettings = { ...settings, defaultRefreshIntervalMinutes: minutes };
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
                {t('backgroundSync.label')}
              </span>
            </label>
            <p className="ml-6 mt-1 text-xs text-muted-foreground">
              {t('backgroundSync.description')}
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
            {t('notifications.title')}
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
              {t('notifications.label')}
            </span>
          </label>
          <p className="ml-6 mt-1 text-xs text-muted-foreground">
            {t('notifications.description')}
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
                {t('opml.exportDescription')}
              </p>
              <OPMLExportButton />
            </div>

            <div>
              <h3 className="mb-1 text-sm font-medium text-card-foreground">
                {t('opml.import')}
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                {t('opml.importDescription')}
              </p>
              <OPMLImportDialog />
            </div>
          </div>
        </div>

        {/* Sync Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Sync</h2>
          <label className="flex items-center gap-2" htmlFor="enable-sync">
            <input
              id="enable-sync"
              type="checkbox"
              checked={syncConfig.enabled}
              onChange={(e) => setSyncConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-card-foreground">Enable sync</span>
          </label>
          {syncConfig.enabled && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground" htmlFor="sync-server-url">
                  Server URL
                </label>
                <input
                  id="sync-server-url"
                  type="url"
                  value={syncConfig.serverUrl}
                  onChange={(e) => setSyncConfig((prev) => ({ ...prev, serverUrl: e.target.value }))}
                  placeholder="https://sync.example.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-card-foreground" htmlFor="sync-api-key">
                  API Key
                </label>
                <input
                  id="sync-api-key"
                  type="password"
                  value={syncConfig.apiKey}
                  onChange={(e) => setSyncConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Your API key"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(syncConfig));
                setSyncToast('Sync settings saved.');
                setTimeout(() => setSyncToast(''), 2000);
              }}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
            <button
              onClick={() => {
                setSyncToast('Sync feature coming soon');
                setTimeout(() => setSyncToast(''), 2000);
              }}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-card-foreground hover:bg-accent"
            >
              Sync Now
            </button>
          </div>
          {syncToast && (
            <p className="mt-2 text-xs text-muted-foreground">{syncToast}</p>
          )}
        </div>

        {/* Newsletter Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-card-foreground">Newsletter</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Your unique forwarding address:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground">
              {newsletterEmail}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newsletterEmail).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="shrink-0 rounded-md border border-border px-3 py-2 text-sm font-medium text-card-foreground hover:bg-accent"
            >
              {copied ? 'Copied!' : 'Copy address'}
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Forward newsletters to this address to read them here. Backend sync required.
          </p>
        </div>
      </div>

      {/* Save Indicator */}
      {saved && (
        <div className="mt-4 rounded-md border border-border bg-secondary p-3 text-center text-sm text-secondary-foreground">
          {t('saved')}
        </div>
      )}

      {isSaving && (
        <div className="mt-4 rounded-md border border-border bg-secondary p-3 text-center text-sm text-muted-foreground">
          {t('saving')}
        </div>
      )}
    </div>
  );
}