export type TimerConfig = {
  prep: number;
  work: number;
  rest: number;
  cycles: number;
  sets: number;
  restBetweenSets: number;
  name?: string;
  id: string;
};

export type TimerPhase =
  | "idle"
  | "prep"
  | "work"
  | "rest"
  | "restBetweenSets"
  | "finished";

export const Phase: Record<TimerPhase, string> = {
  idle: "idle",
  prep: "Подготовка",
  work: "Работа",
  rest: "Отдых",
  restBetweenSets: "Отдых между сетами",
  finished: "Завершено",
} as const;

export type TimerStatus = {
  phase: TimerPhase;
  isPaused: boolean;
};

export const getTimerStatusLabel = ({ phase, isPaused }: TimerStatus) => {
  if (isPaused) {
    return "Пауза";
  }

  return Phase[phase];
};