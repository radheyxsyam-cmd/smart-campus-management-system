import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { login } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { refreshProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const profile = await login({ email, password });
      await refreshProfile();
      showToast(`Welcome back, ${profile.full_name}!`, 'success');
      navigate(profile.role === 'ADMIN' ? '/admin' : '/student');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-slate-800 mb-3">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Smart Campus</h1>
          <p className="text-sm text-slate-500 mt-1">Complaint & Maintenance Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Sign in to your account</h2>
          <p className="text-sm text-slate-500 mb-5">Enter your credentials to continue.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="you@campus.edu"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition disabled:bg-slate-50"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition disabled:bg-slate-50"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" /> : <>Sign In</>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-slate-700 hover:text-slate-900 underline">
              Register here
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-white/70 backdrop-blur rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" /> Demo Accounts (click to fill)
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() => fillDemo('admin@campus.edu', 'Admin@123')}
              className="w-full text-left text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md px-3 py-2 transition border border-slate-200"
            >
              <span className="font-semibold text-slate-700">Admin:</span> admin@campus.edu / Admin@123
            </button>
            <button
              onClick={() => fillDemo('student1@campus.edu', 'Student@123')}
              className="w-full text-left text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md px-3 py-2 transition border border-slate-200"
            >
              <span className="font-semibold text-slate-700">Student:</span> student1@campus.edu / Student@123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
