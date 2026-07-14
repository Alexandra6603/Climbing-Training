export interface Standard {
  id: string;
  name: string;
  unit: "kg" | "sec" | "rep";
}

export interface StandardsAttempt {
  id: string;
  date: string;
  status: 'completed' | 'inProgress';
  values: Record<string, number>;
}

export interface DataToAdd {
  id: number;
  value: number;
  idDate: string;
}

export interface CurrentAttemptEdit {
  attemptId: string;
  standardId: string;
  value: string;
}
