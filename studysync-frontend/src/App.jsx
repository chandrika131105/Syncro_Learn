import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import LandingPage from './pages/LandingPage';
import CourseDetails from './pages/CourseDetails';
import EditCourse from './pages/EditCourse';
import QuizPage from './pages/QuizPage';
import ComparisonPage from './pages/ComparisonPage';
import LeaderboardPage from './pages/LeaderboardPage';
import TutorStudio from './pages/TutorStudio';
import TutorLeaderboard from './pages/TutorLeaderboard';
import AdminDashboard from './pages/AdminDashboard';
import VerifyCertificate from './pages/VerifyCertificate';
import MaintenancePage from './pages/MaintenancePage';
import { getSystemSettings, getCurrentUser } from './services/api';
import { AlertTriangle, X } from 'lucide-react';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppRoutes = ({ isMaintenance }) => {
  const location = useLocation();

  // If maintenance mode is active and user is not admin (calculated in parent),
  // and we are not on the login page, show maintenance page.
  if (isMaintenance && location.pathname !== '/login') {
    return (
      <Routes>
        <Route path="*" element={<MaintenancePage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/verify" element={<VerifyCertificate />} />
      <Route path="/verify/:code" element={<VerifyCertificate />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-course"
        element={
          <ProtectedRoute>
            <CreateCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/course/:id"
        element={
          <ProtectedRoute>
            <CourseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-course/:id"
        element={
          <ProtectedRoute>
            <EditCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:courseId/:moduleId"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compare"
        element={
          <ProtectedRoute>
            <ComparisonPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutor-studio"
        element={
          <ProtectedRoute>
            <TutorStudio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tutor-leaderboard"
        element={
          <ProtectedRoute>
            <TutorLeaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      {/* Catch all route - redirects to home if path doesn't match */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  const [settings, setSettings] = useState(null);
  const [user, setUser] = useState(null);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const s = await getSystemSettings();
        setSettings(s);

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const u = await getCurrentUser();
            setUser(u);
          } catch (e) { console.error("Failed to load user", e); }
        }
      } catch (err) { console.error("Failed to load settings", err); }
    };
    init();
  }, []);

  const isMaintenance = settings?.maintenanceMode && user?.role !== 'ADMIN';

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {settings?.globalAnnouncement && bannerVisible && (
          <div className="bg-indigo-600 text-white px-4 py-3 shadow-lg relative z-50">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center">
                <span className="bg-white/20 p-1.5 rounded-lg mr-3">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </span>
                <p className="font-medium text-sm md:text-base">{settings.globalAnnouncement}</p>
              </div>
              <button onClick={() => setBannerVisible(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        <AppRoutes isMaintenance={isMaintenance} />
      </div>
    </Router>
  );
}

export default App;
