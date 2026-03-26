export type TimerConfig = {
  prep: number;
  work: number;
  rest: number;
  cycles: number;
  sets: number;
  restBetweenSets: number;
};

export type TimerPhase =
  | "idle"
  | "prep"
  | "work"
  | "rest"
  | "restBetweenSets"
  | "finished";