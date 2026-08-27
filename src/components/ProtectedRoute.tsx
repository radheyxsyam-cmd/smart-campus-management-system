import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/models';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile.role !== allowedRole) {
    // Redirect to the correct dashboard for their role
    return <Navigate to={profile.role === 'ADMIN' ? '/admin' : '/student'} replace />;
  }

  return <>{children}</>;
}
