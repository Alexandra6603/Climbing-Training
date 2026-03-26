import { useEffect, useState } from 'react';

function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (stored) {
    document.documentElement.classList.toggle('dark', stored === 'dark');
    return stored;
  }
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', systemDark);
  return systemDark ? 'dark' : 'light';
}

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <button
      onClick={toggle}
      className='px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer'
    >
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  );
};
