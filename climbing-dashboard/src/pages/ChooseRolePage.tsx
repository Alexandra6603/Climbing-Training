import { useState } from 'react';
import { ArrowRight, Mountain, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

export const ChooseRolePage = () => {
  const { user, chooseProfileType } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState<'CLIMBER' | 'TRAINER' | null>(null);
  const [error, setError] = useState('');

  const choose = async (profileType: 'CLIMBER' | 'TRAINER') => {
    setSaving(profileType);
    setError('');
    try {
      await chooseProfileType(profileType);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Не удалось сохранить выбор. Попробуй ещё раз.');
      setSaving(null);
    }
  };

  return (
    <main className="role-page">
      <div className="role-top"><a className="brand" href="/" aria-label="Crux"><span className="brand-mark"><Mountain size={19} strokeWidth={2.5} /></span><span>crux<span className="brand-period">.</span></span></a><span>ШАГ 1 ИЗ 1</span></div>
      <section className="role-content">
        <p className="role-eyebrow">НАСТРОИМ CRUX ПОД ТЕБЯ</p>
        <h1>Какую роль ты<br /><span>выберешь?</span></h1>
        <p className="role-subtitle">Это поможет настроить приложение под твои задачи. Позже можно будет добавить дополнительные возможности.</p>
        <div className="role-options">
          <button className="role-option" type="button" disabled={saving !== null} onClick={() => void choose('CLIMBER')}>
            <span className="role-icon"><Mountain size={22} /></span>
            <span className="role-option-copy"><strong>Я скалолаз</strong><small>Хочу отслеживать тренировки и прогресс</small></span>
            <ArrowRight size={18} className="role-arrow" />
            {saving === 'CLIMBER' && <span className="role-saving">Сохраняем…</span>}
          </button>
          <button className="role-option" type="button" disabled={saving !== null} onClick={() => void choose('TRAINER')}>
            <span className="role-icon"><UsersRound size={22} /></span>
            <span className="role-option-copy"><strong>Я тренер</strong><small>Хочу вести спортсменов и их планы</small></span>
            <ArrowRight size={18} className="role-arrow" />
            {saving === 'TRAINER' && <span className="role-saving">Сохраняем…</span>}
          </button>
        </div>
        {error && <p className="role-error" role="alert">{error}</p>}
        <p className="role-user">Вошли как <strong>{user?.firstName}{user?.username ? ` (@${user.username})` : ''}</strong> через Telegram</p>
      </section>
    </main>
  );
};
