import { createContext } from 'react';

export type User = {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string;
  lastName: string | null;
  photoUrl: string | null;
  profileType: 'CLIMBER' | 'TRAINER' | null;
  isAdmin: boolean;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  loginWithTelegram: (initData: string) => Promise<User>;
  chooseProfileType: (profileType: 'CLIMBER' | 'TRAINER') => Promise<User>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
