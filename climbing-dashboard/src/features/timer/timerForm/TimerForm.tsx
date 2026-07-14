import { useState } from 'react';
import type { TimerConfig } from '../types';

export const TimerForm = () => {
  const [config] = useState<TimerConfig>(() => {
    const timer = localStorage.getItem('timer');
    if (!timer) {
      return {} as TimerConfig;
    }

    try {
      return JSON.parse(timer);
    } catch (error) {
      console.error('Failed to parse timer config from localStorage', error);
      return {} as TimerConfig;
    }
  });

  // const handleChange = (
  //   key: keyof TimerConfig,
  //   value: number
  // ) => {
  //   onChange({
  //     ...config,
  //     [key]: value,
  //   });
  // };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label className="text-sm capitalize">{key}</label>
            <input
              type="number"
              value={value}
              min={0}
              className="border p-2 rounded"
            />
          </div>
        ))}
      </div>

      <button
        
        className="w-full bg-black text-white py-2 rounded"
      >
        Start
      </button>
    </div>
  );
};