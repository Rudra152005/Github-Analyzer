import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';

export default function MainLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex">
      <Sidebar />
      <div className="flex-1 ml-[240px] transition-all duration-200">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

