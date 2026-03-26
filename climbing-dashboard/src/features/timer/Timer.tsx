import { useState } from "react";
import { TimerForm } from "./TimerForm";
import { useIntervalTimer } from "./useIntervalTimer";
import type { TimerConfig } from "./types";

export const Timer = () => {
  const [config, setConfig] = useState<TimerConfig>({
    prep: 10,
    work: 20,
    rest: 10,
    cycles: 8,
    sets: 1,
    restBetweenSets: 60,
  });

  const timer = useIntervalTimer(config);

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <TimerForm
        config={config}
        onChange={setConfig}
        onStart={timer.start}
      />

      <div className="p-6 border rounded-lg text-center space-y-2">
        <div className="text-lg font-medium">
          Phase: {timer.phase}
        </div>

        <div className="text-5xl font-bold">
          {timer.timeLeft}s
        </div>

        <div>
          Set {timer.currentSet} / {config.sets}
        </div>

        <div>
          Cycle {timer.currentCycle} / {config.cycles}
        </div>

        <div className="flex gap-4 justify-center mt-4">
          <button
            onClick={timer.pause}
            className="px-4 py-2 border rounded"
          >
            Pause
          </button>

          <button
            onClick={timer.reset}
            className="px-4 py-2 border rounded"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};