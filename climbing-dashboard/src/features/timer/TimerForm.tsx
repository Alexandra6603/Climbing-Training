import type { TimerConfig } from './types';

type Props = {
  config: TimerConfig;
  onChange: (config: TimerConfig) => void;
  onStart: () => void;
};

export const TimerForm = ({ config, onChange, onStart }: Props) => {
  const handleChange = (
    key: keyof TimerConfig,
    value: number
  ) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

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
              onChange={(e) =>
                handleChange(key as keyof TimerConfig, Number(e.target.value))
              }
              className="border p-2 rounded"
            />
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full bg-black text-white py-2 rounded"
      >
        Start
      </button>
    </div>
  );
};