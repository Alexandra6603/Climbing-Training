import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { standardsApi } from "../../api/standards/service";
import { BottomSheet } from "../../shared/ui/bottomSheet";
import type { CurrentAttemptEdit, Standard, StandardsAttempt } from "../../api/standards/types";
import { isValidDecimal } from "../../shared/functions";
import axios from "axios";

const addMonths = (date: Date, months: number): Date => {
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
};

export const Standards = () => {
  const service = standardsApi;
  const inputRef = useRef<HTMLInputElement>(null);

  const [standards, setStandards] = useState<Standard[]>([]);
  const [attempts, setAttempts] = useState<StandardsAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditAttemptOpen, setIsEditAttemptOpen] = useState(false);
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<CurrentAttemptEdit | null>(null);
  const [draftAttempt, setDraftAttempt] = useState<StandardsAttempt | null>(null);
  const displayedAttempts = draftAttempt ? [draftAttempt, ...attempts] : attempts;

  const latestAttempt = [...attempts].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];
  
  const nextAvailableDate = latestAttempt
    ? addMonths(new Date(latestAttempt.date), 3)
    : null;
  
  const canAddAttempt =
    !nextAvailableDate || new Date() >= nextAvailableDate;

  useEffect(() => {
    service.getStandards().then(setStandards)
      .then(() => service.getStandardsAttempts())
      .then(setAttempts)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isEditAttemptOpen) {
      inputRef.current?.focus();
    }
  }, [isEditAttemptOpen]);

  const formatMonthYear = (date: string | Date) =>
    new Intl.DateTimeFormat("ru-RU", {
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));

    const addAttempt = () => {
      if (!canAddAttempt || draftAttempt) return;
    
      setDraftAttempt({
        id: 'local-draft',
        date: new Date().toISOString(),
        status: 'inProgress',
        values: {},
      });
    };



    const removeAttempt = () => {
      if (draftAttempt) {
        setDraftAttempt(null);
        return;
      }
    
      if (!latestAttempt) return;
    
      service.deleteStandardsAttempt()
        .then(() => {
          setAttempts((prev) =>
            prev.filter((attempt) => attempt.id !== latestAttempt.id),
          );
        })
        .catch((error: unknown) => {
          if (
            axios.isAxiosError<{ message?: string }>(error) &&
            error.response?.status === 409
          ) {
            alert(error.response.data.message ?? 'Последнюю попытку нельзя удалить.');
            return;
          }
    
          if (
            axios.isAxiosError(error) &&
            error.response?.status === 404
          ) {
          alert('Нет попыток для удаления.');
            return;
          }
    
          alert('Не удалось удалить попытку. Попробуйте ещё раз.');
        });
    };
    

  const editAttempt = (attempt: StandardsAttempt, standardId: string,) => {
    if (attempt.status === 'inProgress') {
      setCurrentAttempt({
        standardId,
        value: attempt.values[standardId]?.toString() ?? '',
        attemptId: attempt.id,
      });
      setIsEditAttemptOpen(true);
    }
  }

  const handleSaveAttempt = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    let value = e.target.value;
    if (!currentAttempt) return;

    const unit = standards.find((standard) => standard.id === currentAttempt.standardId)?.unit;
    if (!isValidDecimal(value) || ((unit === 'sec' || unit === 'rep') && /[.,]/.test(value))) {
      return;
    }

    value = value.replace(',', '.');

    setCurrentAttempt({
      ...currentAttempt,
      value,
    });
  }

  const saveStandardAttempt = async () => {
    if (!currentAttempt) return;
  
    const value = Number(currentAttempt.value);
  
    if (
      currentAttempt.value.trim() === '' ||
      !Number.isFinite(value)
    ) {
      alert('Введите корректное число.');
      return;
    }
  
    try {
      const isDraft = currentAttempt.attemptId === 'local-draft';
  
      const savedAttempt = isDraft
        ? await service.createStandardsAttempt(
            currentAttempt.standardId,
            value,
          )
        : await service.saveStandardAttempt(
            currentAttempt.attemptId,
            currentAttempt.standardId,
            value,
          );
  
      if (isDraft) {
        setAttempts((prev) => [savedAttempt, ...prev]);
        setDraftAttempt(null);
      } else {
        setAttempts((prev) =>
          prev.map((attempt) =>
            attempt.id === savedAttempt.id
              ? savedAttempt
              : attempt,
          ),
        );
      }
  
      setIsEditAttemptOpen(false);
      setCurrentAttempt(null);
    } catch (error: unknown) {
      if (
        axios.isAxiosError<{ message?: string }>(error)
      ) {
        alert(
          error.response?.data?.message ??
            'Не удалось сохранить норматив. Попробуйте ещё раз.',
        );
        return;
      }
  
      alert('Произошла непредвиденная ошибка.');
    }
  };

  const closeValueEditor = () => {
    setIsEditAttemptOpen(false);
    setCurrentAttempt(null);
  };

  const completeAttempt = async () => {
    if (!latestAttempt || latestAttempt.status !== 'inProgress') return;

    if (Object.keys(latestAttempt.values).length === 0) {
      alert('Укажите хотя бы одно значение норматива перед завершением попытки.');
      return;
    }

    try {
      const completedAttempt = await service.completeStandardsAttempt(latestAttempt.id);
      setAttempts((prev) => prev.map((attempt) =>
        attempt.id === completedAttempt.id ? completedAttempt : attempt,
      ));
      setIsCompleteConfirmOpen(false);
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        alert(error.response?.data?.message ?? 'Не удалось завершить попытку. Попробуйте ещё раз.');
        return;
      }

      alert('Произошла непредвиденная ошибка.');
    }
  };
  
  if (loading) {
    return (
      <div>
        Ожидание данных...
      </div>
    )
  } else {
    return (
      <div>  
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end">
          {!draftAttempt ? (
            canAddAttempt ? (
              <button
                className="min-h-11 w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center cursor-pointer"
                onClick={addAttempt}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить попытку
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Следующую попытку можно добавить после{" "}
                {nextAvailableDate?.toLocaleDateString("ru-RU")}
              </p>
            )
          ) : null}

        {(latestAttempt?.status === 'inProgress' || draftAttempt !== null) && (
          <button
            className="min-h-11 w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-md flex items-center justify-center cursor-pointer"
            onClick={removeAttempt}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Удалить последнюю попытку
          </button>
        )}
        {latestAttempt?.status === 'inProgress' && !draftAttempt && (
          <button
            className="min-h-11 w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-md flex items-center justify-center cursor-pointer"
            onClick={() => setIsCompleteConfirmOpen(true)}
          >
            Завершить попытку
          </button>
        )}
        </div>    
        <div className="w-fit max-w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800" role="region" aria-label="Попытки по нормативам" tabIndex={0}>
        <table className="w-max border-collapse text-sm">
          <colgroup>
            <col className="w-px" />
            {displayedAttempts.map((attempt) => (
              <col key={attempt.id} className="w-24" />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="sticky left-0 z-[1] whitespace-nowrap border border-gray-200 bg-gray-50 p-3 text-left dark:border-gray-800 dark:bg-gray-900"></th>
  
              {displayedAttempts && displayedAttempts.map((attempt) => (
                <th
                  key={attempt.id}
                  className="min-w-24 border border-gray-200 bg-gray-50 p-3 text-center dark:border-gray-800 dark:bg-gray-900"
                >
                  <div>{formatMonthYear(attempt.date)}</div>
                  <div className={`mt-1 text-xs font-normal ${attempt.status === 'inProgress' ? 'text-amber-600' : 'text-gray-500'}`}>
                    {attempt.status === 'inProgress' ? 'В процессе' : 'Завершена'}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
  
          <tbody>
            {standards.map((standard) => (
              <tr key={standard.id}>
                <th scope="row" className="sticky left-0 z-[1] whitespace-nowrap border border-gray-200 bg-white p-3 text-left font-semibold dark:border-gray-800 dark:bg-gray-950">
                  {standard.name}, {standard.unit}
                </th>
  
                {displayedAttempts && displayedAttempts.map((attempt) => (
                  <td
                    key={attempt.id}
                    className={`min-w-24 border border-gray-200 p-3 text-center dark:border-gray-800 ${attempt.status === 'inProgress' ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-900' : ''}`}
                    onClick={() => {editAttempt(attempt, standard.id)}}
                    aria-label={`${standard.name}: ${attempt.values[standard.id] ?? 'нет значения'}, ${attempt.status === 'inProgress' ? 'изменить значение' : 'завершена'}`}
                    tabIndex={attempt.status === 'inProgress' ? 0 : undefined}
                    onKeyDown={(event) => {
                      if (attempt.status === 'inProgress' && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        editAttempt(attempt, standard.id);
                      }
                    }}
                  >
                    {attempt.values[standard.id] === undefined ? "-" : Number(attempt.values[standard.id]).toLocaleString('ru-RU', { maximumFractionDigits: 3 })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <BottomSheet isOpen={isEditAttemptOpen} onClose={closeValueEditor} title={standards.find((standard) => standard.id === currentAttempt?.standardId)?.name ?? ''}>
          <div className="flex flex-col gap-2">
            <input 
              type="text"
              inputMode={['sec', 'rep'].includes(standards.find((standard) => standard.id === currentAttempt?.standardId)?.unit ?? '') ? 'numeric' : 'decimal'}
              placeholder="Значение" 
              className="border p-2 rounded" 
              ref={inputRef}
              value={currentAttempt?.value ?? ""}
              onChange={(e) => handleSaveAttempt(e)}/>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center cursor-pointer" 
              onClick={saveStandardAttempt}>
              Сохранить
            </button>
          </div>
        </BottomSheet>
        <BottomSheet
          isOpen={isCompleteConfirmOpen}
          onClose={() => setIsCompleteConfirmOpen(false)}
          title="Завершить попытку?"
        >
          <p className="text-sm text-gray-600">
            После этого попытку нельзя будет изменить или удалить.
          </p>
          <div className="flex gap-2">
            <button
              className="border px-4 py-2 rounded-md flex-1 cursor-pointer"
              onClick={() => setIsCompleteConfirmOpen(false)}
            >
              Отмена
            </button>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md flex-1 cursor-pointer"
              onClick={completeAttempt}
            >
              Завершить
            </button>
          </div>
        </BottomSheet>
      </div>
    );
  }

};
