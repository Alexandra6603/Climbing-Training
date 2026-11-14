import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { TimerConfig } from "../types";
import { timersApi, type TimerInput } from "../../../api/timers/service";

const emptyTimer: TimerConfig = {
  id: "",
  name: "",
  prep: 10,
  work: 30,
  rest: 15,
  cycles: 5,
  sets: 1,
  restBetweenSets: 60,
};

type TimerNumberKey = "prep" | "work" | "rest" | "cycles" | "sets" | "restBetweenSets";

const fields: { key: TimerNumberKey; label: string }[] = [
  { key: "prep", label: "Подготовка (сек)" },
  { key: "work", label: "Работа (сек)" },
  { key: "rest", label: "Отдых между циклами (сек)" },
  { key: "cycles", label: "Циклов в сете" },
  { key: "sets", label: "Количество сетов" },
  { key: "restBetweenSets", label: "Отдых между сетами (сек)" },
];

const toNumericDrafts = (timer: TimerConfig): Record<TimerNumberKey, string> => ({
  prep: String(timer.prep),
  work: String(timer.work),
  rest: String(timer.rest),
  cycles: String(timer.cycles),
  sets: String(timer.sets),
  restBetweenSets: String(timer.restBetweenSets),
});

export const TimerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);
  const [config, setConfig] = useState<TimerConfig>({ ...emptyTimer });
  const [numericDrafts, setNumericDrafts] = useState(() => toNumericDrafts(emptyTimer));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    timersApi.get(id)
      .then((timer) => {
        setConfig(timer);
        setNumericDrafts(toNumericDrafts(timer));
      })
      .catch(() => setError("Не удалось загрузить таймер. Возможно, он уже удалён."))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const timerName = config.name ?? "";
    if (!timerName.trim()) {
      setError("Укажи название тренировки.");
      return;
    }
    if (fields.some(({ key }) => {
      const value = numericDrafts[key];
      const minimum = key === "cycles" || key === "sets" ? 1 : 0;
      return !/^\d+$/.test(value) || Number(value) < minimum;
    })) {
      setError("Укажи целые числа; циклов и сетов должно быть не меньше одного.");
      return;
    }

    const values = Object.fromEntries(
      fields.map(({ key }) => [key, Number(numericDrafts[key])]),
    ) as Record<TimerNumberKey, number>;
    const input: TimerInput = {
      name: timerName.trim(),
      ...values,
    };
    try {
      setSaving(true);
      setError("");
      if (id) await timersApi.update(id, input);
      else await timersApi.create(input);
      navigate("/timer/list");
    } catch {
      setError("Не удалось сохранить таймер. Проверь соединение и попробуй ещё раз.");
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="timer-form-page">Загружаем таймер…</div>;
  }

  if (editing && config.id !== id) {
    return (
      <section className="timer-form-page">
        <p className="timer-form-error" role="alert">{error || "Таймер не найден в вашем аккаунте."}</p>
        <button type="button" className="timer-form-back" onClick={() => navigate("/timer/list")}>
          <ArrowLeft size={16} /> К списку таймеров
        </button>
      </section>
    );
  }

  return (
    <section className="timer-form-page">
      <button type="button" className="timer-form-back" onClick={() => navigate("/timer/list")}>
        <ArrowLeft size={16} /> К списку таймеров
      </button>
      <p className="timer-eyebrow">НАСТРОЙКА ТРЕНИРОВКИ</p>
      <h1 className="timer-form-title">{editing ? "Редактировать таймер" : "Новая тренировка"}</h1>
      <form className="timer-form" onSubmit={save}>
        {error && <p className="timer-form-error" role="alert">{error}</p>}
        <label className="timer-field timer-field-name">
          <span>Название тренировки</span>
          <input
            type="text"
            value={config.name ?? ""}
            onChange={(event) => setConfig((current) => ({ ...current, name: event.target.value }))}
            placeholder="Например, интервалы на выносливость"
            maxLength={100}
            required
          />
        </label>
        <div className="timer-form-grid">
          {fields.map(({ key, label }) => (
            <label className="timer-field" key={key}>
              <span>{label}</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={numericDrafts[key]}
                onChange={(event) => {
                  setNumericDrafts((current) => ({ ...current, [key]: event.target.value }));
                  setError("");
                }}
                onBlur={() => setNumericDrafts((current) => ({
                  ...current,
                  [key]: current[key].replace(/^0+(?=\d)/, ""),
                }))}
                aria-label={label}
              />
            </label>
          ))}
        </div>
        <div className="timer-form-actions">
          <button type="button" className="timer-reset" onClick={() => navigate("/timer/list")}>Отмена</button>
          <button type="submit" className="timer-primary" disabled={saving}>{saving ? "Сохраняем…" : editing ? "Сохранить изменения" : "Создать таймер"}</button>
        </div>
      </form>
    </section>
  );
};
