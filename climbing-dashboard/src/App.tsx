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
import { Timer } from "./features/timer/Timer";
import { TimerList } from "./features/timer/list/TimerList";
import { TimerForm } from "./features/timer/timerForm/TimerForm";
import { StandardsPage } from "./pages/StandardsPage";

type AppRoute = {
  path: string;
  Page: ComponentType;
  children?: AppRoute[];
};

const protectedRoutes: AppRoute[] = [
  { path: "/dashboard", Page: DashboardPage },
  { path: "/workouts", Page: WorkoutsPage },
  { 
    path: "/timer", 
    Page: TimerPage,
    children: [
      { path: "", Page: () => <Navigate to="list" replace /> },
      { path: "list", Page: TimerList },
      { path: "add", Page: TimerForm },
      { path: "edit/:id", Page: TimerForm },
      { path: "workout/:id", Page: Timer },
    ],
  },
  { path: "/standards", Page: StandardsPage },
  { path: "/goals", Page: GoalsPage },
];

const renderRoutes = (routes: AppRoute[]) =>
  routes.map(({ path, Page, children }) => {
    const element = (
      <ProtectedRoute>
        <Layout>
          <Page />
        </Layout>
      </ProtectedRoute>
    );

    if (children) {
      return (
        <Route key={path} path={path} element={element}>
          {children.map((child) => (
            <Route
              key={child.path}
              path={child.path}
              element={<child.Page />}
            />
          ))}
        </Route>
      );
    }

    return <Route key={path} path={path} element={element} />;
  });

  function App() {
    return (
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
  
          {renderRoutes(protectedRoutes)}
  
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    );
  }

export default App;
