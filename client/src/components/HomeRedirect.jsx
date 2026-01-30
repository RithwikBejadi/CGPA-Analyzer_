import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomeRedirect = ({ children }) => {
  const { isAuthenticated, loading, serverStarting } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
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
    return children;
  }

  return null;
};

export default HomeRedirect;
