import { createContext } from 'react';

export type AuthContextType = {
  user: { id: string; email: string } | null;
  login: (email: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
