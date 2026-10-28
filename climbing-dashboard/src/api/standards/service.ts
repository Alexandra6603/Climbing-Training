import type { Standard, StandardsAttempt } from "./types";
import { api } from "../api";

export interface StandardsApi {
  getStandards: () => Promise<Standard[]>; //get
  getStandardsAttempts: () => Promise<StandardsAttempt[]>; //get
  createStandardsAttempt: (standardId: string, value: number) => Promise<StandardsAttempt>; //post? ПОЯСНЕНИЕ: для добавления попытки с фронта ничего передавать не нужно
  //просто доваляем новый элемент в начало массива, в ответе ничего не возвращаем (умпех или ошибка)
  saveStandardAttempt: (attemptId: string, standardId: string, value: number) => Promise<StandardsAttempt>;
  deleteStandardsAttempt: () => Promise<void>; //delete
  //saveStandardAttempt: (attempt: CurrentAttemptEdit) => Promise<void>; //хз, чисто сохранение одного поля, подумать как лучше передавать
}

export const standardsApi: StandardsApi = {
  async getStandards() {
    const response = await api.get("/standards");
    return response.data;
  },

  async getStandardsAttempts() {
    const response = await api.get("/standards/attempts");
    return response.data;
  },

  async createStandardsAttempt(
    standardId: string,
    value: number,
  ): Promise<StandardsAttempt> {
    const { data } = await api.post<StandardsAttempt>(
      '/standards/attempts',
      { standardId, value },
    );
  
    return data;
  },

  async saveStandardAttempt(
    attemptId: string,
    standardId: string,
    value: number,
  ): Promise<StandardsAttempt> {
    const { data } = await api.put<StandardsAttempt>(
      `/standards/attempts/${encodeURIComponent(attemptId)}`,
      { 
        standardId,
        value,
      },
    );
  
    return data;
  },

  async deleteStandardsAttempt(): Promise<void> {
    await api.delete('/standards/delete-last-attempt');
  },
}
