import { useState, useEffect } from 'react';
import { RefreshIntervalSelector } from '@components/Settings/RefreshIntervalSelector';
import { ThemeSelector } from '../components/Settings/ThemeSelector';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          设置
        </h1>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {/* Refresh Settings Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              刷新设置
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
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  启用后台同步
                </span>
              </label>
              <p className="ml-6 text-sm text-gray-500 dark:text-gray-400 mt-1">
                在后台自动刷新订阅源,即使应用关闭也会继续工作
              </p>
            </div>
          </div>

          {/* Theme Settings Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              主题
            </h2>
            
            <ThemeSelector />
          </div>

          {/* Notification Settings Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              通知
            </h2>
            
            <label className="flex items-center" htmlFor="enable-notifications">
              <input
                id="enable-notifications"
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={handleToggleNotifications}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                启用新文章通知
              </span>
            </label>
            <p className="ml-6 text-sm text-gray-500 dark:text-gray-400 mt-1">
              当订阅源有新文章时发送通知
            </p>
          </div>

          {/* OPML Import/Export Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              导入/导出
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  导出订阅源
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  将您的订阅源导出为 OPML 文件，以便备份或迁移到其他阅读器
                </p>
                <OPMLExportButton />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  导入订阅源
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  从 OPML 文件导入订阅源。支持从其他 RSS 阅读器导出的文件
                </p>
                <OPMLImportDialog />
              </div>
            </div>
          </div>
        </div>

        {/* Save Indicator */}
        {saved && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-200 text-center">
              ✓ 设置已保存
            </p>
          </div>
        )}

        {isSaving && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              保存中...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
