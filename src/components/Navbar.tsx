import { useNavigate } from 'react-router-dom';
import { LogOut, GraduationCap, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Logged out successfully.', 'success');
    } catch {
      // Even if signOut throws, the context clears local state in its finally block.
      // Show a softer message since the user is effectively logged out regardless.
      showToast('You have been logged out.', 'info');
    }
    navigate('/login');
  };

  if (!profile) return null;

  const isAdmin = profile.role === 'ADMIN';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isAdmin ? 'bg-slate-800' : 'bg-blue-600'
              }`}
            >
              {isAdmin ? (
                <Shield className="w-5 h-5 text-white" />
              ) : (
                <GraduationCap className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">Smart Campus</p>
              <p className="text-xs text-slate-500 leading-tight">Complaint Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700 leading-tight">{profile.full_name}</p>
              <p className="text-xs text-slate-500 leading-tight">{profile.email}</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isAdmin ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isAdmin ? 'Admin' : 'Student'}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
