import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/auth';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [user, setUser] = useState<User | null>(() => {
    const cachedUser = localStorage.getItem('auth_user_details');
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and validate session from token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('auth_user_details', JSON.stringify(currentUser));
        } catch {
          // Token is invalid or expired
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user_details');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);
      const { access_token, user: loggedUser } = response;
      
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user_details', JSON.stringify(loggedUser));
      
      setToken(access_token);
      setUser(loggedUser);
      setIsLoading(false);
      return loggedUser;
    } catch (err: unknown) {
      setIsLoading(false);
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail 
        || 'Invalid login credentials. Please try again.';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerUser(data);
      const { access_token, user: registeredUser } = response;

      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user_details', JSON.stringify(registeredUser));

      setToken(access_token);
      setUser(registeredUser);
      setIsLoading(false);
      return registeredUser;
    } catch (err: unknown) {
      setIsLoading(false);
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail 
        || 'Registration failed. User with this email may already exist.';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_details');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
