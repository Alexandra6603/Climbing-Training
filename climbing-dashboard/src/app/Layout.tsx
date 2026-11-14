import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { Settings, Mountain } from "lucide-react";

type Props = {
  children: ReactNode;
};

const navItems = [
  { to: '/dashboard', label: 'Обзор' },
  { to: '/workouts', label: 'Тренировки' },
  { to: '/standards', label: 'Нормативы' },
  { to: '/timer', label: 'Таймер' },
  // { to: '/goals', label: 'Goals' },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `app-nav-link${isActive ? ' is-active' : ''}`;

export const Layout = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="app-shell dark">
      <header className="app-header">
        <div className="app-header-inner">
          <a className="app-brand" href="/dashboard" aria-label="Crux — главная">
            <span className="app-brand-mark"><Mountain size={18} strokeWidth={2.5} /></span>
            <span>crux<span>.</span></span>
          </a>
          <nav className="app-nav">
            {navItems.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>
          
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="app-settings-button"
            aria-label="Открыть настройки"
          >
            <Settings className="w-5 h-5 cursor-pointer" />
          </button>

          {open && (
            <div className="app-settings-menu">
              <span className="app-settings-label">АККАУНТ</span>
              <button
                onClick={logout}
                className="app-logout-button"
              >
                Выйти из аккаунта
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {children}
      </main>
    </div>
  );
};
