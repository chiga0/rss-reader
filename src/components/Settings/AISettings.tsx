import { useState, useEffect } from 'react';
import { storage } from '@lib/storage';
import type { UserSettings } from '@models/Feed';

const DEFAULT_SETTINGS_PARTIAL = {
  aiProvider: 'openai' as const,
  aiApiKey: '',
  aiBaseUrl: '',
  aiModel: '',
};

export function AISettings() {
  const [provider, setProvider] = useState<'openai' | 'custom'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    storage.get('settings', 'default').then((s) => {
      if (s) {
        setProvider(s.aiProvider || DEFAULT_SETTINGS_PARTIAL.aiProvider);
        setApiKey(s.aiApiKey || '');
        setBaseUrl(s.aiBaseUrl || '');
        setModel(s.aiModel || '');
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const existing = await storage.get('settings', 'default');
      const updated: UserSettings = {
        id: 'default',
        theme: 'system',
        defaultRefreshIntervalMinutes: 60,
        maxArticlesPerFeed: 100,
        enableNotifications: false,
        enableBackgroundSync: true,
        ...existing,
        aiProvider: provider,
        aiApiKey: apiKey,
        aiBaseUrl: baseUrl,
        aiModel: model,
      };
      await storage.put('settings', updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Provider */}
      <div>
        <label
          htmlFor="ai-provider"
          className="block text-sm font-medium text-card-foreground mb-1"
        >
          Provider
        </label>
        <select
          id="ai-provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value as 'openai' | 'custom')}
          className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="openai">OpenAI</option>
          <option value="custom">Custom (OpenAI-compatible)</option>
        </select>
      </div>

      {/* API Key */}
      <div>
        <label
          htmlFor="ai-api-key"
          className="block text-sm font-medium text-card-foreground mb-1"
        >
          API Key
        </label>
        <input
          id="ai-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Custom Base URL (only for custom provider) */}
      {provider === 'custom' && (
        <div>
          <label
            htmlFor="ai-base-url"
            className="block text-sm font-medium text-card-foreground mb-1"
          >
            API Base URL
          </label>
          <input
            id="ai-base-url"
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://your-api-endpoint/v1"
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Any OpenAI-compatible endpoint (e.g. Azure OpenAI, Ollama, etc.)
          </p>
        </div>
      )}

      {/* Model */}
      <div>
        <label
          htmlFor="ai-model"
          className="block text-sm font-medium text-card-foreground mb-1"
        >
          Model
        </label>
        <input
          id="ai-model"
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder={provider === 'openai' ? 'gpt-4o-mini' : 'your-model-name'}
          className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Leave blank to use the default model (gpt-4o-mini)
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save AI Settings'}
      </button>
    </div>
  );
}
