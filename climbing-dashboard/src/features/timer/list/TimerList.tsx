// import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TimerConfig } from "../types";
import { CirclePlay, Pencil, Trash2 } from "lucide-react";
import { pluralize } from "../../../utils/pluralize";
import { useState } from "react";

export const TimerList = () => {
  const navigate = useNavigate();

  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const openSheet = () => {
    setIsMounted(true);
  
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  }; 

  const closeSheet = () => {
    setIsVisible(false);
  
    setTimeout(() => {
      setIsMounted(false);
    }, 300); // время анимации
  };

  const goToTimerWorkout = (timer: TimerConfig) => {
    localStorage.removeItem('timer');
    localStorage.setItem('timer', JSON.stringify(timer));
    console.log(timer);
    navigate(`/timer/workout/${timer.id}`);
  };

  const fakeTimers: TimerConfig[] = [
    {
      name: "Тренировка 1",
      prep: 5,
      work: 7,
      rest: 3,
      cycles: 3,
      sets: 2,
      restBetweenSets: 15,
      id: "1",
    },
    {
      name: "Тренировка 2",
      prep: 10,
      work: 7,
      rest: 3,
      cycles: 12,
      sets: 3,
      restBetweenSets: 180,
      id: "2",
    },
    {
      name: "Тренировка 3",
      prep: 10,
      work: 40,
      rest: 20,
      cycles: 3,
      sets: 3,
      restBetweenSets: 240,
      id: "3",
    },
  ];

  return (
    <div>
      <button
        className="bg-blue-400 text-white px-4 py-2 rounded-md mb-4"
        onClick={() => {
          navigate("/timer/add");
        }}>
          Добавить тренировку
      </button>

      <div className="flex flex-col gap-4">
        {fakeTimers.map((timer) => (
          <div key={timer.name} className="border border-gray-300 rounded-md p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">{timer.name}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => {goToTimerWorkout(timer)}}
                  className="bg-green-400 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors">
                  <CirclePlay className="w-4 h-4"/>
                </button>
                <button className="bg-blue-400 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    navigate(`/timer/edit/${timer.id}`);
                  }}>
                  <Pencil className="w-4 h-4"/>
                </button>
                <button 
                  className="bg-red-400 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors"
                  onClick={openSheet}>
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">Подготовка: {timer.prep} сек</p>
            <p className="text-sm text-gray-500">Работа: {timer.work} сек</p>
            <p className="text-sm text-gray-500">Отдых: {timer.rest} сек</p>
            <p className="text-sm text-gray-500">{timer.cycles} {pluralize(timer.cycles, ['цикл', 'цикла', 'циклов'])}</p>
            <p className="text-sm text-gray-500">{timer.sets} {pluralize(timer.sets, ['сета', 'сета', 'сетов'])}</p>
            <p className="text-sm text-gray-500">Отдых между сетами: {timer.restBetweenSets} сек</p>
          </div>
        ))}
      </div>

      {isMounted && (
  <div
    className={`fixed inset-0 flex items-end
    transition-all duration-200 ease-in
    ${isVisible ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0"}`}
    onClick={closeSheet}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className={`
        w-full bg-white dark:bg-gray-900 rounded-t-2xl p-6 space-y-4
        transform transition-transform duration-300
        ${isVisible ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-2" />

      <div className="text-lg font-semibold">
        Удалить тренировку?
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => {
            console.log("delete");
            closeSheet();
          }}
          className="flex-1 bg-red-500 text-white py-2 rounded-lg"
        >
          Удалить
        </button>

        <button
          onClick={closeSheet}
          className="flex-1 border py-2 rounded-lg"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};