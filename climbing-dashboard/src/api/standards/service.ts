import type { CurrentAttemptEdit, Standard, StandardsAttempt } from "./types";
import { standards, standardsAttempts } from "./mocks";

const fakeStandards: Standard[] = [...standards] as const;
let fakeStandardsAttempts: StandardsAttempt[] = [...standardsAttempts];

export interface StandardsApi {
  getStandards: () => Promise<Standard[]>; //get
  getStandardsAttempts: () => Promise<StandardsAttempt[]>; //get
  addStandardsAttempt: () =>Promise<void>; //post? ПОЯСНЕНИЕ: для добавления попытки с фронта ничего передавать не нужно
  //просто доваляем новый элемент в начало массива, в ответе ничего не возвращаем (умпех или ошибка)
  deleteStandardsAttempt: (id: string) => Promise<void>; //delete
  saveStandardAttempt: (attempt: CurrentAttemptEdit) => Promise<void>; //хз, чисто сохранение одного поля, подумать как лучше передавать
}

export const fakeStandardsApi: StandardsApi = {
  async getStandards() {
    return [...fakeStandards];
  },

  async getStandardsAttempts() {
    return [...fakeStandardsAttempts];
  },

  async addStandardsAttempt() {
    fakeStandardsAttempts.unshift({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: 'inProgress',
      values: {},
    });
  },

  async deleteStandardsAttempt(id: string) {
    const attempt = fakeStandardsAttempts.find(
      item => item.id === id
    );
  
    if (!attempt) {
      throw new Error('Attempt not found');
    }
  
    if (attempt.status !== 'inProgress') {
      throw new Error('Attempt cannot be deleted');
    }
  
    fakeStandardsAttempts =
      fakeStandardsAttempts.filter(
        item => item.id !== id
      );
  },

  async saveStandardAttempt(attempt: CurrentAttemptEdit) {
    if (!attempt.attemptId || !attempt.standardId || attempt.value === "") {
      throw new Error("Invalid attempt data");
    }

    const target = fakeStandardsAttempts.find(
      (item) => item.id === attempt.attemptId
    );

    if (!target) {
      throw new Error("Attempt not found");
    }

    target.values[attempt.standardId] = attempt.value;
  }
};