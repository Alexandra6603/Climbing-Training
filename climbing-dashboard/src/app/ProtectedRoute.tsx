import type { ReactNode } from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="auth-loading" role="status">Загружаем профиль…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.profileType && location.pathname !== '/choose-role') {
    return <Navigate to="/choose-role" replace />;
  }

  if (user.profileType && location.pathname === '/choose-role') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
