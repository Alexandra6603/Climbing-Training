import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../features/auth/useAuth';
import { Settings } from "lucide-react";

type Props = {
  children: ReactNode;
};

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/timer', label: 'Timer' },
  { to: '/goals', label: 'Goals' },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-blue-600 font-medium'
    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white';

export const Layout = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <nav className="flex gap-6">
            {navItems.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>
          
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Settings className="w-5 h-5 cursor-pointer" />
          </button>

          {open && (
            <div className="absolute right-4 top-16 w-48 bg-white dark:bg-gray-900 border rounded shadow-md p-2 space-y-2">
              <button className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                Profile
              </button>

              {/* <button className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800"> */}
              <ThemeToggle />
              {/* </button> */}

              <button
                onClick={logout}
                className="w-full text-left px-2 py-1 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};
