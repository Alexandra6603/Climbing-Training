import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { fakeStandardsApi } from "../../api/standards/service";
import { BottomSheet } from "../../shared/ui/bottomSheet";
import type { CurrentAttemptEdit, Standard, StandardsAttempt } from "../../api/standards/types";
import { isValidDecimal, parseDecimal } from "../../shared/functions";

export const Standards = () => {
  const standardsApi = fakeStandardsApi;
  const inputRef = useRef<HTMLInputElement>(null);

  const [standards, setStandards] = useState<Standard[]>([]);
  const [attempts, setAttempts] = useState<StandardsAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditAttemptOpen, setIsEditAttemptOpen] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState<CurrentAttemptEdit | null>(null);

  useEffect(() => {
    standardsApi.getStandards().then(setStandards)
      .then(() => standardsApi.getStandardsAttempts())
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
    // const currentMonth = formatMonthYear(new Date().toISOString()).slice(0, 2);
    // const previousMonth = formatMonthYear(attempts[0].date).slice(0, 2);

    // if (Number(currentMonth) - Number(previousMonth) < 3) {
    //   alert('You can only add an attempt every 3 months');
    //   return;
    // }

    standardsApi.addStandardsAttempt()
      .then(() => standardsApi.getStandardsAttempts())
      .then(setAttempts);
  };

  //удалить можно только последнюю попытку, если она в статусе inProgress
  const removeAttempt = () => {
    if (attempts && attempts[0].status === 'inProgress') {
      standardsApi.deleteStandardsAttempt(attempts[0].id)
        .then(() => standardsApi.getStandardsAttempts())
        .then(setAttempts);
    }
  }

  const editAttempt = (attempt: StandardsAttempt, idStandard: string,) => {
    setCurrentAttempt({
      standardId: idStandard,
      value: attempt.values[idStandard]?.toString() ?? '',
      attemptId: attempt.id,
    });
    setIsEditAttemptOpen(true);
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
  
  if (loading) {
    return (
      <div>
        Ожидание данных...
      </div>
    )
  } else {
    return (
      <div>  
        <div className="flex justify-end gap-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 flex items-center justify-center cursor-pointer"
            onClick={() => {addAttempt()}}>
            <Plus className="w-4 h-4 mr-2" />
            Add attempt
          </button>
          {attempts && attempts[0].status === 'inProgress' && (
            <button className="bg-red-500 text-white px-4 py-2 rounded-md mb-4 flex items-center justify-center cursor-pointer"
              onClick={() => {removeAttempt()}}>
              <Trash2 className="w-4 h-4 mr-2" />
              Remove attempt
            </button>
          )}
        </div>    
        <table className="w-full border-collapse border border-gray-100 rounded-lg">
          <thead>
            <tr>
              <th className="border p-2"></th>
  
              {attempts && attempts.map((attempt) => (
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
  
                {attempts && attempts.map((attempt) => (
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
              onClick={() => {setIsEditAttemptOpen(false)}}>
              Save
            </button>
          </div>
        </BottomSheet>
      </div>
    );
  }

};