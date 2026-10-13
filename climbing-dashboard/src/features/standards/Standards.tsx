import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { standardsApi } from "../../api/standards/service";
import { BottomSheet } from "../../shared/ui/bottomSheet";
import type { CurrentAttemptEdit, Standard, StandardsAttempt } from "../../api/standards/types";
import { isValidDecimal, parseDecimal } from "../../shared/functions";
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
            alert(
              error.response.data.message ??
                'The latest attempt cannot be deleted',
            );
            return;
          }
    
          if (
            axios.isAxiosError(error) &&
            error.response?.status === 404
          ) {
            alert('There are no attempts to delete');
            return;
          }
    
          alert('Failed to delete the attempt. Please try again.');
        });
    };
    

  const editAttempt = (attempt: StandardsAttempt, idStandard: string,) => {
    // if (attempt.status === 'inProgress') {
    //   setCurrentAttempt({
    //     standardId: idStandard,
    //     value: attempt.values[idStandard]?.toString() ?? '',
    //     attemptId: attempt.id,
    //   });
    //   setIsEditAttemptOpen(true);
    // }
  }

  const handleSaveAttempt = (e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    let value = e.target.value;
    if (!currentAttempt) return;

    if (!isValidDecimal(value)) {
      return;
    }

    value = parseDecimal(value)?.toString() ?? '';

    setCurrentAttempt({
      ...currentAttempt,
      value,
    });
  }

  const saveStandardAttempt = () => {
    // standardsApi.saveStandardAttempt(currentAttempt as CurrentAttemptEdit)
    //   .then(() => standardsApi.getStandardsAttempts())
    //   .then(setAttempts);
    //   setIsEditAttemptOpen(false);
  }
  
  if (loading) {
    return (
      <div>
        Ожидание данных...
      </div>
    )
  } else {
    return (
      <div>  
        <div className="flex justify-between items-end">
          {!draftAttempt ? (
            canAddAttempt ? (
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 flex items-center justify-center cursor-pointer"
                onClick={addAttempt}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add attempt
              </button>
            ) : (
              <p className="mb-4 text-sm text-gray-500">
                Next attempt available on{" "}
                {nextAvailableDate?.toLocaleDateString("en-GB")}
              </p>
            )
          ) : null}

        {(latestAttempt?.status === 'inProgress' || draftAttempt !== null) && (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md mb-4 flex items-center justify-center cursor-pointer"
            onClick={removeAttempt}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove last attempt
          </button>
        )}
        </div>    
        <table className="w-full border-collapse border border-gray-100 rounded-lg">
          <thead>
            <tr>
              <th className="border p-2"></th>
  
              {displayedAttempts && displayedAttempts.map((attempt) => (
                <th
                  key={attempt.id}
                  className="border p-2 text-center"
                >
                  {formatMonthYear(attempt.date)}
                </th>
              ))}
            </tr>
          </thead>
  
          <tbody>
            {standards.map((standard) => (
              <tr key={standard.id}>
                <td className="border p-2 font-semibold">
                  {standard.name}, {standard.unit}
                </td>
  
                {displayedAttempts && displayedAttempts.map((attempt) => (
                  <td
                    key={attempt.id}
                    className="border p-2 text-center"
                    onClick={() => {editAttempt(attempt, standard.id)}}
                  >
                    {attempt.values[standard.id] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <BottomSheet isOpen={isEditAttemptOpen} onClose={() => setIsEditAttemptOpen(false)} title={standards.find((standard) => standard.id === currentAttempt?.standardId)?.name ?? ''}>
          <div className="flex flex-col gap-2">
            <input 
              type="text"
              inputMode="decimal"
              placeholder="Value" 
              className="border p-2 rounded" 
              ref={inputRef}
              value={currentAttempt?.value ?? ""}
              onChange={(e) => handleSaveAttempt(e)}/>
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center cursor-pointer" 
              onClick={saveStandardAttempt}>
              Save
            </button>
          </div>
        </BottomSheet>
      </div>
    );
  }

};