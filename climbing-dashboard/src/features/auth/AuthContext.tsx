import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { api } from '../../api/api';
import { AuthContext, type User } from './auth-context';

const SESSION_KEY = 'crux-session';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem(SESSION_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.get<{ user: User }>('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        sessionStorage.removeItem(SESSION_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const loginWithTelegram = useCallback(async (initData: string) => {
    const { data } = await api.post<{ token: string; user: User }>('/auth/telegram', { initData });
    sessionStorage.setItem(SESSION_KEY, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const chooseProfileType = useCallback(async (profileType: 'CLIMBER' | 'TRAINER') => {
    const { data } = await api.put<{ user: User }>('/auth/profile-type', { profileType });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => undefined);
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithTelegram, chooseProfileType, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
