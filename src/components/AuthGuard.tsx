import { useAuth } from '../contexts/AuthContext';
import AuthPage from '../auth/AuthPage';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'teacher' | 'parent' | ('student' | 'teacher' | 'parent')[];
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-purple-500/30 animate-pulse">
            🏔️
          </div>
          <div className="text-white/60 text-sm animate-pulse">Loading PinnacleQuiz...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Role check
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return fallback ? (
        <>{fallback}</>
      ) : (
        <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center px-4">
          <div className="max-w-sm text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-black text-white mb-2">Access Restricted</h2>
            <p className="text-white/50 mb-6">
              This section is for{' '}
              {Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole}s only.
            </p>
            <div className="text-white/30 text-sm">
              You're signed in as a <span className="text-purple-400 font-semibold">{user.role}</span>.
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
