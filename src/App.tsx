import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import StudentDashboard from '@/pages/StudentDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';

function RootRedirect() {
  const { profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }
  if (!profile) return <Navigate to="/login" replace />;
  return <Navigate to={profile.role === 'ADMIN' ? '/admin' : '/student'} replace />;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRole="STUDENT">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
