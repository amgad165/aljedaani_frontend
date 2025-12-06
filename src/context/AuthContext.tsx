import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { LoginData, RegisterData } from '../services/authService';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'doctor' | 'staff' | 'patient';
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  medical_record_number?: string;
  national_id?: string;
  marital_status?: string;
  religion?: string;
  address?: string;
  profile_photo?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  // Load token from localStorage on mount and verify session
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      
      if (savedToken && savedUser) {
        try {
          // Set the token and user from localStorage first
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (err) {
          // If parsing fails, clear invalid data
          console.error('Error parsing saved user data:', err);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
      
      // Mark loading as complete
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(data);
      setUser(response.user);
      setToken(response.token);
      
      // Save to localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
    } catch (err: unknown) {
      const errorMsg = typeof err === 'object' && err !== null && 'message' in err 
        ? (err as { message: string }).message 
        : 'Login failed. Please try again.';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.register(data);
      setUser(response.user);
      setToken(response.token);
      
      // Save to localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
    } catch (err: unknown) {
      const errorMsg = typeof err === 'object' && err !== null && 'message' in err 
        ? (err as { message: string }).message 
        : 'Registration failed. Please try again.';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (token) {
        await authService.logout(token);
      }
      
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } catch (err: unknown) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = data.user || data;
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser,
    isAuthenticated: !!token && !!user,
    isAdmin: !!user && user.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
