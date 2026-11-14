import { timersRepository, type TimerInput } from '../repositories/timers.repository.js';

export const defaultTimers: TimerInput[] = [
  { name: 'Тренировка 1', prep: 5, work: 7, rest: 3, cycles: 3, sets: 2, restBetweenSets: 15 },
  { name: 'Тренировка 2', prep: 10, work: 7, rest: 3, cycles: 12, sets: 3, restBetweenSets: 180 },
  { name: 'Тренировка 3', prep: 10, work: 40, rest: 20, cycles: 3, sets: 3, restBetweenSets: 240 },
];

export const timersService = {
  list(userId: string) {
    return timersRepository.list(userId);
  },

  async ensureDefaults(userId: string) {
    if ((await timersRepository.countForUser(userId)) === 0) {
      await timersRepository.createDefaults(userId, defaultTimers);
    }
  },

  find(userId: string, timerId: string) {
    return timersRepository.find(userId, timerId);
  },

  create(userId: string, data: TimerInput) {
    return timersRepository.create(userId, data);
  },

  async update(userId: string, timerId: string, data: TimerInput) {
    const result = await timersRepository.update(userId, timerId, data);
    if (result.count === 0) return null;
    return timersRepository.find(userId, timerId);
  },

  async delete(userId: string, timerId: string) {
    const result = await timersRepository.delete(userId, timerId);
    return result.count > 0;
  },
};
