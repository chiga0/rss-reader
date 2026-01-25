import type { FC } from 'react';

interface RefreshIntervalSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
}

const INTERVAL_OPTIONS = [
  { label: '15 分钟', value: 15 },
  { label: '30 分钟', value: 30 },
  { label: '1 小时', value: 60 },
  { label: '2 小时', value: 120 },
  { label: '4 小时', value: 240 },
  { label: '手动刷新', value: 0 }, // 0 means manual only
];

export const RefreshIntervalSelector: FC<RefreshIntervalSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label htmlFor="refresh-interval" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        自动刷新间隔
      </label>
      <select
        id="refresh-interval"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        {INTERVAL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {value === 0 
          ? '订阅源将不会自动刷新,需要手动刷新' 
          : `订阅源将每 ${value >= 60 ? `${value / 60} 小时` : `${value} 分钟`} 自动刷新`}
      </p>
    </div>
  );
};
