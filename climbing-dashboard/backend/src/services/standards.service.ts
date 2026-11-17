import { standardsRepository } from '../repositories/standards.repository.js';

export const standardsService = {
  getStandards() {
    return standardsRepository.getStandards().then((standards) => standards.map((standard) => ({
      ...standard,
      unit: standard.unit === 'sm' ? 'cm' : standard.unit,
    })));
  },

  async getStandardsAttempts(userId: string) {
    const attempts = await standardsRepository.getStandardsAttempts(userId);
  
    return attempts.map((attempt) => ({
      id: attempt.id,
      date: attempt.date,
      status: attempt.status,
      values: Object.fromEntries(
        attempt.values.map((item) => [
          item.standardId,
          fromStorageValue(item.value, item.standard.unit),
        ]),
      ),
    }));
  },

  async createStandardsAttempt(userId: string, standardId: string, value: number) {
    const standard = await standardsRepository.findStandard(standardId);
    if (!standard) return { created: false as const, nextAvailableDate: null };
    const storedValue = toStorageValue(value, standard.unit);
    const latestAttempt = await standardsRepository.findLatestAttempt(userId);

    if (latestAttempt) {
      const nextAvailableDate = addMonths(latestAttempt.date, 3);
  
      if (new Date() < nextAvailableDate) {
        return {
          created: false as const,
          nextAvailableDate,
        };
      }
    }
  
    const attempt = await standardsRepository.createAttempt(userId, standardId, storedValue)
  
    return {
      created: true as const,
      attempt: mapAttempt(attempt),
    };
  },
  
  async saveStandardAttempt(
    userId: string,
    attemptId: string,
    standardId: string,
    value: number,
  ) {
    const standard = await standardsRepository.findStandard(standardId);
    if (!standard) return { saved: false as const, reason: 'notFound' as const };
    const storedValue = toStorageValue(value, standard.unit);
    const attempt = await standardsRepository.findUniqueAttempt(attemptId, userId)
  
    if (!attempt) {
      return { saved: false as const, reason: 'notFound' as const };
    }
  
    if (attempt.status !== 'inProgress') {
      return { saved: false as const, reason: 'notInProgress' as const };
    }
  
    await standardsRepository.saveAttemptValue(attemptId, standardId, storedValue)
  
    const updatedAttempt = await standardsRepository.updatedAttempt(attemptId)
  
    return {
      saved: true as const,
      attempt: mapAttempt(updatedAttempt),
    };
  },

  async completeStandardsAttempt(userId: string, attemptId: string) {
    const attempt = await standardsRepository.findUniqueAttempt(attemptId, userId);

    if (!attempt) {
      return { completed: false as const, reason: 'notFound' as const };
    }

    if (attempt.status !== 'inProgress') {
      return { completed: false as const, reason: 'notInProgress' as const };
    }

    const updatedAttempt = await standardsRepository.completeAttempt(attemptId);

    return {
      completed: true as const,
      attempt: mapAttempt(updatedAttempt),
    };
  },

  async deleteLatestStandardsAttempt(userId: string) {
    const latestAttempt = await standardsRepository.findLatestAttempt(userId)

    if (!latestAttempt) {
      return { deleted: false as const, reason: 'notFound' as const };
    }

    if (latestAttempt.status !== 'inProgress') {
      return { deleted: false as const, reason: 'notInProgress' as const };
    }

    await standardsRepository.deleteLatestAttempt(latestAttempt.id)

    return { deleted: true as const };
  },
};

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0,
  ).getDate();

  result.setDate(Math.min(day, lastDay));

  return result;
}

function mapAttempt(attempt: {
  id: string;
  date: Date;
  status: string;
  values: { standardId: string; value: number; standard: { unit: string } }[];
}) {
  return {
    id: attempt.id,
    date: attempt.date,
    status: attempt.status,
    values: Object.fromEntries(
      attempt.values.map((item) => [
        item.standardId,
        fromStorageValue(item.value, item.standard.unit),
      ]),
    ),
  };
}

function storageFactor(unit: string): number {
  if (unit === 'kg') return 1000;
  if (unit === 'cm' || unit === 'sm') return 10;
  return 1;
}

function toStorageValue(value: number, unit: string): number {
  if (!Number.isFinite(value)) throw new Error('Standard value must be finite');
  const scaled = value * storageFactor(unit);
  const rounded = Math.round(scaled);
  if (Math.abs(scaled - rounded) > 1e-8) throw new Error('Value has more precision than the stored unit supports');
  if ((unit === 'sec' || unit === 'rep') && !Number.isInteger(value)) {
    throw new Error('Seconds and repetitions must be whole numbers');
  }
  return rounded;
}

function fromStorageValue(value: number, unit: string): number {
  return value / storageFactor(unit);
}
