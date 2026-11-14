import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useIntervalTimer } from "./useIntervalTimer";
import { getTimerStatusLabel, type TimerConfig } from "./types";
import { timersApi } from "../../api/timers/service";

const fallbackConfig: TimerConfig = {
  prep: 10, work: 20, rest: 10, cycles: 8, sets: 1, restBetweenSets: 60,
  id: "", name: "Таймер",
};

const playTone = (
  context: AudioContext,
  frequency: number,
  duration: number,
  waveform: OscillatorType,
  delay = 0,
) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startAt = context.currentTime + delay;

  oscillator.type = waveform;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(0.18, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration);
};

export const Timer = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [config, setConfig] = useState<TimerConfig | null>(null);
  const [loadingError, setLoadingError] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  const unlockAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }
  };

  useEffect(() => {
    if (!id) {
      setLoadingError("Таймер не указан.");
      return;
    }
    timersApi.get(id)
      .then(setConfig)
      .catch(() => setLoadingError("Не удалось загрузить таймер. Возможно, он уже удалён."));
  }, [id]);

  const { phase, timeLeft, currentCycle, currentSet, isPaused, start, pause, resume, reset } =
    useIntervalTimer(config ?? fallbackConfig);

  useEffect(() => {
    const context = audioContextRef.current;
    if (!soundEnabled || !context) return;

    if (phase === "finished") {
      playTone(context, 660, 0.16, "sine");
      playTone(context, 830, 0.16, "sine", 0.14);
      playTone(context, 1046, 0.3, "sine", 0.28);
      return;
    }

    if (timeLeft < 1 || timeLeft > 3) return;
    if (phase === "prep" || phase === "rest" || phase === "restBetweenSets") {
      playTone(context, 660, 0.11, "sine");
    } else if (phase === "work") {
      playTone(context, 1046, 0.12, "triangle");
    }
  }, [phase, soundEnabled, timeLeft]);

  const goBack = () => {
    reset();
    navigate("/timer/list");
  };
  const startTimer = () => {
    if (soundEnabled) unlockAudio();
    start();
  };
  const resumeTimer = () => {
    if (soundEnabled) unlockAudio();
    resume();
  };
  const totalCycles = Math.max(1, config?.cycles ?? 1);
  const totalSets = Math.max(1, config?.sets ?? 1);
  const progress = phase === "finished"
    ? 100
    : (((currentSet - 1) * totalCycles + currentCycle - 1) / (totalCycles * totalSets)) * 100;

  if (loadingError || !config) {
    return (
      <div className="timer-screen">
        <section className="timer-card">
          <p className="timer-form-error" role={loadingError ? "alert" : undefined}>
            {loadingError || "Загружаем таймер…"}
          </p>
          {loadingError && <button className="timer-primary" onClick={() => navigate("/timer/list")}>К списку таймеров</button>}
        </section>
      </div>
    );
  }

  return (
    <div className="timer-screen">
      <section className="timer-card" aria-label="Таймер тренировки">
        <button type="button" onClick={goBack} className="timer-back">
          <ArrowLeft size={16} /> Назад
        </button>
        <button
          type="button"
          className="timer-sound-toggle"
          aria-label={soundEnabled ? "Отключить звук" : "Включить звук"}
          aria-pressed={soundEnabled}
          title={soundEnabled ? "Звук включён" : "Звук выключен"}
          onClick={() => {
            if (!soundEnabled) unlockAudio();
            setSoundEnabled((enabled) => !enabled);
          }}
        >
          {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>
        <p className="timer-eyebrow">ИНТЕРВАЛЬНАЯ ТРЕНИРОВКА</p>
        <h1 className="timer-title">{config.name || "Таймер"}</h1>
        <div className={`timer-status${isPaused ? " is-paused" : ""}`}>
          <span className="timer-status-dot" />
          {phase === "idle" ? "Готов к старту" : getTimerStatusLabel({ phase, isPaused })}
        </div>

        <div className="timer-count" aria-live="polite">{phase === "idle" ? config.prep : timeLeft}</div>
        <div className="timer-unit">СЕКУНД</div>

        <div className="timer-progress-meta">
          <span>ЦИКЛ <strong>{currentCycle}</strong> / {config.cycles}</span>
          <span>СЕТ <strong>{currentSet}</strong> / {config.sets}</span>
        </div>
        <div className="timer-progress" aria-hidden="true">
          <i style={{ width: `${Math.min(100, progress)}%` }} />
        </div>

        <div className="timer-controls">
          {phase === "idle" || phase === "finished" ? (
            <button onClick={startTimer} className="timer-primary">{phase === "finished" ? "Начать снова" : "Начать тренировку"}</button>
          ) : isPaused ? (
            <button onClick={resumeTimer} className="timer-primary">Продолжить</button>
          ) : (
            <button onClick={pause} className="timer-primary">Пауза</button>
          )}
          <button onClick={reset} className="timer-reset">Сброс</button>
        </div>
      </section>
    </div>
  );
};
