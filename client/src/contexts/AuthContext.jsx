import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../config/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [serverStarting, setServerStarting] = useState(false);
  const navigate = useNavigate();

  const checkAuth = async () => {
    const startTime = Date.now();
    let serverStartTimeout;
    
    // If request takes more than 3 seconds, assume server is starting up
    serverStartTimeout = setTimeout(() => {
      setServerStarting(true);
    }, 3000);

    try {
      const response = await axios.get('/api/users/me', { 
        skipAuthRedirect: true 
      });

      clearTimeout(serverStartTimeout);
      setServerStarting(false);
      setUser(response.data);
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
    } catch (error) {
      clearTimeout(serverStartTimeout);
      setServerStarting(false);
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        checkAuth();
      }, 5 * 60 * 1000); 

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);


  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated') {
        if (e.newValue === null) {
          setUser(null);
          setIsAuthenticated(false);
        } else if (e.newValue === 'true' && !isAuthenticated) {
          checkAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated]);

  const login = async (email, password, rememberMe = false) => {
    try {
      console.log('Login attempt:', { email, rememberMe });
      const response = await axios.post('/api/auth/login', {
        email,
        password,
        rememberMe,
      });

      console.log('Login response:', response.data);
      await checkAuth();
      console.log('After checkAuth, isAuthenticated:', isAuthenticated);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || error.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      navigate('/login');
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Signup failed';
      return { success: false, error: message };
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    serverStarting,
    login,
    logout,
    signup,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
