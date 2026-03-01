import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface RefreshIntervalSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
}

export const RefreshIntervalSelector: FC<RefreshIntervalSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation('settings');

  const INTERVAL_OPTIONS = [
    { labelKey: 'refreshInterval.minutes', labelDefault: '15 分钟', value: 15 },
    { labelKey: 'refreshInterval.minutes', labelDefault: '30 分钟', value: 30 },
    { labelKey: 'refreshInterval.hours', labelDefault: '1 小时', value: 60 },
    { labelKey: 'refreshInterval.hours', labelDefault: '2 小时', value: 120 },
    { labelKey: 'refreshInterval.hours', labelDefault: '4 小时', value: 240 },
    { labelKey: 'refreshInterval.manual', labelDefault: '手动刷新', value: 0 },
  ];

  const getIntervalLabel = (option: typeof INTERVAL_OPTIONS[0]) => {
    if (option.value === 0) {
      return t('refreshInterval.manual');
    }
    const count = option.value >= 60 ? option.value / 60 : option.value;
    const key = option.value >= 60 ? 'refreshInterval.hours' : 'refreshInterval.minutes';
    return t(key, { count });
  };

  const getDescription = () => {
    if (value === 0) {
      return t('refreshInterval.description_manual');
    }
    const interval = value >= 60 
      ? t('refreshInterval.hours', { count: value / 60 })
      : t('refreshInterval.minutes', { count: value });
    return t('refreshInterval.description_interval', { interval });
  };

  return (
    <div className="space-y-2">
      <label htmlFor="refresh-interval" className="block text-sm font-medium text-card-foreground">
        {t('refreshInterval.title')}
      </label>
      <select
        id="refresh-interval"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
      >
        {INTERVAL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {getIntervalLabel(option)}
          </option>
        ))}
      </select>
      <p className="text-sm text-muted-foreground">
        {getDescription()}
      </p>
    </div>
  );
};