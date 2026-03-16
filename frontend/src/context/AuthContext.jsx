import { createContext, useContext, useState, useEffect } from 'react';
import { api, authApi } from '../services/api';

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
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            // Token invalid
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Login function
  const login = async (studentId, department) => {
    const response = await authApi.studentLogin(studentId, department);
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return { success: true };
    }
    
    return { success: false, message: response.data.message };
  };

  // Register function
  const register = async (name, email, password, phone) => {
    const response = await authApi.register(name, email, password, phone);
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return { success: true };
    }
    
    return { success: false, message: response.data.message };
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const loginAdmin = async (email, password) => {
    const response = await authApi.adminLogin(email, password);

    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return { success: true };
    }

    return { success: false, message: response.data.message };
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginAdmin,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
