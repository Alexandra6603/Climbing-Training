import { api } from "../api";
import type { TimerConfig } from "../../features/timer/types";

export type TimerRecord = TimerConfig & { name: string };
export type TimerInput = Omit<TimerRecord, "id">;

export const timersApi = {
  async list(): Promise<TimerRecord[]> {
    const { data } = await api.get<TimerRecord[]>("/timers");
    return data;
  },

  async get(timerId: string): Promise<TimerRecord> {
    const { data } = await api.get<TimerRecord>(`/timers/${encodeURIComponent(timerId)}`);
    return data;
  },

  async create(timer: TimerInput): Promise<TimerRecord> {
    const { data } = await api.post<TimerRecord>("/timers", timer);
    return data;
  },

  async update(timerId: string, timer: TimerInput): Promise<TimerRecord> {
    const { data } = await api.put<TimerRecord>(`/timers/${encodeURIComponent(timerId)}`, timer);
    return data;
  },

  async delete(timerId: string): Promise<void> {
    await api.delete(`/timers/${encodeURIComponent(timerId)}`);
  },
};
