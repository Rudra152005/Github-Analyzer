import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './components/layout';
import Hero from './components/landing/Hero';
import Dashboard from './components/dashboard/Dashboard';
import RepositoriesPage from './components/repositories/RepositoriesPage';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import InsightsPage from './components/insights/InsightsPage';
import CareerAnalyzerPage from './components/career/CareerAnalyzerPage';
import ComparePage from './components/compare/ComparePage';
import ExplorePage from './components/explore/ExplorePage';
import LeaderboardPage from './components/leaderboard/LeaderboardPage';
import ReportsPage from './components/reports/ReportsPage';
import SettingsPage from './components/settings/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/repositories" element={<RepositoriesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/career" element={<CareerAnalyzerPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}


