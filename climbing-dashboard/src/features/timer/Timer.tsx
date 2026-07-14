import { useEffect, useRef, useState } from "react";
// import { TimerForm } from "./timerForm/TimerForm";
import { useIntervalTimer } from "./useIntervalTimer";
import { getTimerStatusLabel, type TimerConfig } from "./types";

export const Timer = () => {
  const defaultConfig: TimerConfig = {
    prep: 10,
    work: 20,
    rest: 10,
    cycles: 8,
    sets: 1,
    restBetweenSets: 60,
    id: "1",
    name: "Тренировка 1",
  };

  const [{ config, shouldAutoStart }] = useState<{
    config: TimerConfig;
    shouldAutoStart: boolean;
  }>(() => {
    const savedTimer = localStorage.getItem("timer");
    if (!savedTimer) {
      return {
        config: defaultConfig,
        shouldAutoStart: false,
      };
    }

    try {
      return {
        config: { ...defaultConfig, ...JSON.parse(savedTimer) },
        shouldAutoStart: true,
      };
    } catch (error) {
      console.error("Failed to parse timer config from localStorage", error);
      return {
        config: defaultConfig,
        shouldAutoStart: false,
      };
    }
  });

  const { phase, timeLeft, currentCycle, currentSet, isPaused, start, pause, resume, reset } =
    useIntervalTimer(config);
  const hasStartedFromStorage = useRef(false);

  useEffect(() => {
    if (!shouldAutoStart || hasStartedFromStorage.current) {
      return;
    }
    if (phase !== "idle") {
      return;
    }

    hasStartedFromStorage.current = true;
    start();
  }, [shouldAutoStart, phase, start]);

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="p-6 border rounded-lg text-center space-y-2">
        <div className="text-lg font-medium">
          {getTimerStatusLabel({ phase, isPaused })}
        </div>

        <div className="text-5xl font-bold">
          {timeLeft}
        </div>

        <div>
          Цикл {currentCycle} / {config.cycles}
        </div>

        <div>
          Сет {currentSet} / {config.sets}
        </div>

        <div className="flex gap-4 justify-center mt-4">
          {isPaused ? (
            <button
              onClick={resume}
              className="px-4 py-2 border rounded"
            >
              Продолжить
            </button>
          ) : (
            <button
              onClick={pause}
              className="px-4 py-2 border rounded"
            >
              Пауза
            </button>
          )}

          <button
            onClick={reset}
            className="px-4 py-2 border rounded"
          >
            Сброс
          </button>
        </div>
      </div>
    </div>
  );
};