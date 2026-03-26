import type { ComponentType } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { Layout } from "./app/Layout";
import { WorkoutsPage } from "./pages/WorkoutsPage";
import { TimerPage } from "./pages/TimerPage";
import { GoalsPage } from "./pages/GoalsPage";

const protectedRoutes: { path: string; Page: ComponentType }[] = [
  { path: "/dashboard", Page: DashboardPage },
  { path: "/workouts", Page: WorkoutsPage },
  { path: "/timer", Page: TimerPage },
  { path: "/goals", Page: GoalsPage },
];

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {protectedRoutes.map(({ path, Page }) => {
          return (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute>
                  <Layout>
                    <Page />
                  </Layout>
                </ProtectedRoute>
              }
            />
          );
        })}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
