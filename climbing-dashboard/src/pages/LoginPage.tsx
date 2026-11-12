import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, Check, Mountain, Send } from "lucide-react";
import { useAuth } from "../features/auth/useAuth";

const telegramBotUrl = import.meta.env.VITE_TELEGRAM_BOT_URL;
const highlights = ["Тренировки и прогресс в одном месте", "План под твои цели", "Всегда под рукой в Telegram"];

export const LoginPage = () => {
  const { user, isLoading, loginWithTelegram } = useAuth();
  const navigate = useNavigate();
  const submitted = useRef(false);
  const [status, setStatus] = useState<'checking' | 'outside' | 'error'>('checking');

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      navigate(user.profileType ? '/dashboard' : '/choose-role', { replace: true });
      return;
    }

    const webApp = window.Telegram?.WebApp;
    webApp?.ready();
    webApp?.expand();
    const initData = webApp?.initData;
    if (!initData) {
      setStatus('outside');
      return;
    }
    if (submitted.current) return;
    submitted.current = true;

    loginWithTelegram(initData)
      .then((authenticatedUser) => {
        navigate(authenticatedUser.profileType ? '/dashboard' : '/choose-role', { replace: true });
      })
      .catch(() => setStatus('error'));
  }, [isLoading, user, loginWithTelegram, navigate]);

  return (
    <main className="login-page">
      <div className="login-grain" aria-hidden="true" />
      <header className="login-header">
        <a className="brand" href="/" aria-label="Crux, на главную">
          <span className="brand-mark"><Mountain size={19} strokeWidth={2.5} /></span>
          <span>crux<span className="brand-period">.</span></span>
        </a>
        <span className="header-note"><span className="status-dot" /> ТВОЯ СИСТЕМА ТРЕНИРОВОК</span>
      </header>

      <section className="login-content">
        <div className="login-copy">
          <div className="eyebrow"><span>01</span><span className="eyebrow-line" /> ДЛЯ ТЕХ, КТО ЛЕЗЕТ ВЫШЕ</div>
          <h1>Сильнее<br />с каждой<br /><span>тренировкой.</span></h1>
          <p className="login-description">Твой прогресс в скалолазании начинается здесь. Войди через Telegram — без паролей и лишних форм.</p>
          <ul className="login-highlights">
            {highlights.map((item) => <li key={item}><Check size={15} strokeWidth={2.5} />{item}</li>)}
          </ul>
          <div className="login-aside"><ArrowDownRight size={18} /><span>Весь твой climbing journey<br />в одном приложении</span></div>
        </div>

        <div className="login-panel-wrap">
          <div className="panel-topline"><span>ВХОД В АККАУНТ</span><span>TELEGRAM AUTH</span></div>
          <section className="login-panel" aria-labelledby="login-title">
            <div className="telegram-emblem"><Send size={24} fill="currentColor" /></div>
            <p className="panel-kicker">РАДЫ ТЕБЯ ВИДЕТЬ</p>
            <h2 id="login-title">Входи и<br />забирайся выше.</h2>
            <p className="panel-description">Авторизуйся через Telegram — это быстро, безопасно и удобно.</p>

            {status === 'checking' && <p className="telegram-button login-status" role="status">Проверяем авторизацию Telegram…</p>}
            {status === 'outside' && (telegramBotUrl ? (
              <a className="telegram-button" href={telegramBotUrl}>
                <Send size={18} fill="currentColor" /><span>Открыть в Telegram</span><ArrowUpRight size={17} className="button-arrow" />
              </a>
            ) : <p className="setup-message" role="status">Открой Crux через кнопку меню своего Telegram-бота.</p>)}
            {status === 'error' && (
              <div className="auth-error" role="alert">
                <p>Не удалось проверить вход. Убедись, что backend запущен и настроен.</p>
                <button type="button" onClick={() => window.location.reload()}>Попробовать снова</button>
              </div>
            )}

            <div className="panel-divider"><span /> <span>БЕЗОПАСНЫЙ ВХОД</span> <span /></div>
            <p className="privacy-note">Данные Telegram проверяются на сервере. Пароль и доступ к сообщениям не нужны.</p>
          </section>
          <div className="panel-foot"><span>01 / 03</span><div className="panel-progress"><i /></div><span>СТАРТ</span></div>
        </div>
      </section>

      <footer className="login-footer"><span>© 2026 CRUX TRAINING</span><span>СОЗДАНО ДЛЯ ТВОЕГО СЛЕДУЮЩЕГО УРОВНЯ <span className="footer-star">✳</span></span></footer>
    </main>
  );
};
