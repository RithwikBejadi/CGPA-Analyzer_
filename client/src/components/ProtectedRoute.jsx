import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireProfileSetup = true }) => {
  const { isAuthenticated, loading, user, serverStarting } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          {serverStarting ? (
            <>
              <p className="mt-4 text-gray-900 font-semibold text-lg">Server is starting up...</p>
              <p className="mt-2 text-gray-600 text-sm">This may take 30-60 seconds on first load. Please wait.</p>
              <p className="mt-2 text-gray-500 text-xs">The server sleeps when inactive to save resources.</p>
            </>
          ) : (
            <p className="mt-4 text-gray-600">Loading...</p>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If profile is not completed and we're not on the profile-setup page, redirect to profile-setup
  if (requireProfileSetup && user && !user.profileCompleted && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  // If profile is completed and user tries to access profile-setup, redirect to dashboard
  if (!requireProfileSetup && user && user.profileCompleted && location.pathname === '/profile-setup') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
