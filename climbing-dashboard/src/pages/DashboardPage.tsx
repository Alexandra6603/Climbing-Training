import { useAuth } from '../features/auth/useAuth';

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Welcome, {user?.email}
      </h1>

      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};