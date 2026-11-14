// import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CirclePlay, Pencil, Plus, Trash2 } from "lucide-react";
import { pluralize } from "../../../utils/pluralize";
import { useEffect, useState } from "react";
import { timersApi, type TimerRecord } from "../../../api/timers/service";

export const TimerList = () => {
  const navigate = useNavigate();

  const [timers, setTimers] = useState<TimerRecord[]>([]);
  const [pendingDelete, setPendingDelete] = useState<TimerRecord | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    timersApi.list()
      .then(setTimers)
      .catch(() => setError("Не удалось загрузить таймеры. Попробуй обновить страницу."))
      .finally(() => setLoading(false));
  }, []);

  const openSheet = (timer: TimerRecord) => {
    setPendingDelete(timer);
    setIsMounted(true);
  
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  }; 

  const closeSheet = () => {
    setIsVisible(false);
  
    setTimeout(() => {
      setIsMounted(false);
      setPendingDelete(null);
    }, 300); // время анимации
  };

  const goToTimerWorkout = (timer: TimerRecord) => {
    navigate(`/timer/workout/${timer.id}`);
  };

  const deleteTimer = async () => {
    if (!pendingDelete) return;
    try {
      await timersApi.delete(pendingDelete.id);
      setTimers((current) => current.filter((timer) => timer.id !== pendingDelete.id));
      closeSheet();
    } catch {
      setError("Не удалось удалить таймер. Попробуй ещё раз.");
      closeSheet();
    }
  };

  return (
    <div className="timer-list-page">
      <header className="timer-list-header">
        <div>
          <p className="timer-eyebrow">ТВОЙ ПЛАН</p>
          <h1 className="timer-list-title">Таймеры</h1>
          <p className="timer-list-subtitle">Интервалы для силовой и выносливостной тренировки.</p>
        </div>
        <button
          className="timer-add-button"
          onClick={() => navigate("/timer/add")}
        >
          <Plus size={16} /> Добавить тренировку
        </button>
      </header>

      {loading && <div className="timer-list-empty">Загружаем таймеры…</div>}
      {error && <p className="timer-form-error" role="alert">{error}</p>}
      {!loading && !error && <div className="timer-list-grid">
        {timers.map((timer) => (
          <article key={timer.id} className="timer-list-card">
            <div className="timer-list-card-head">
              <div>
                <span className="timer-list-label">ИНТЕРВАЛЬНЫЙ ТАЙМЕР</span>
                <h2>{timer.name}</h2>
              </div>
              <div className="timer-list-actions">
                <button 
                  onClick={() => {goToTimerWorkout(timer)}}
                  className="timer-icon-button timer-icon-primary"
                  aria-label={`Запустить ${timer.name}`}>
                  <CirclePlay size={17}/>
                </button>
                <button className="timer-icon-button"
                  aria-label={`Изменить ${timer.name}`}
                  onClick={() => navigate(`/timer/edit/${timer.id}`)}>
                  <Pencil size={16}/>
                </button>
                <button 
                  className="timer-icon-button timer-icon-danger"
                  onClick={() => openSheet(timer)}
                  aria-label={`Удалить ${timer.name}`}>
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
            <div className="timer-list-details">
              <div><span>Подготовка</span><strong>{timer.prep} сек</strong></div>
              <div><span>Работа</span><strong>{timer.work} сек</strong></div>
              <div><span>Отдых</span><strong>{timer.rest} сек</strong></div>
              <div><span>Между сетами</span><strong>{timer.restBetweenSets} сек</strong></div>
            </div>
            <div className="timer-list-footer">
              <span>{timer.cycles} {pluralize(timer.cycles, ['цикл', 'цикла', 'циклов'])}</span>
              <span>{timer.sets} {pluralize(timer.sets, ['сет', 'сета', 'сетов'])}</span>
            </div>
          </article>
        ))}
      </div>}

      {!loading && !error && timers.length === 0 && (
        <div className="timer-list-empty">Пока нет тренировок. Добавь свой первый интервальный таймер.</div>
      )}

      {isMounted && (
  <div
    className={`fixed inset-0 flex items-end
    transition-all duration-200 ease-in
    ${isVisible ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0"}`}
    onClick={closeSheet}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className={`timer-delete-sheet
        transform transition-transform duration-300
        ${isVisible ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div className="timer-sheet-handle" />

      <div className="timer-sheet-title">
        Удалить «{pendingDelete?.name}»?
      </div>

      <div className="timer-sheet-actions">
        <button
          onClick={() => void deleteTimer()}
          className="timer-sheet-delete"
        >
          Удалить
        </button>

        <button
          onClick={closeSheet}
          className="timer-sheet-cancel"
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
