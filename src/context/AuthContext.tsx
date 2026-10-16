import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.ts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  studentId?: string;
  teacherId?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('academy_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('academy_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('academy_token');
      if (storedToken) {
        try {
          const res = await authAPI.me();
          if (res.data?.user) {
            const updatedUser: User = {
              ...res.data.user,
              studentId: res.data.student?._id,
              teacherId: res.data.teacher?._id,
            };
            setUser(updatedUser);
            localStorage.setItem('academy_user', JSON.stringify(updatedUser));
          }
        } catch (_) {
          // Token expired or invalid
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.data?.token && res.data?.user) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('academy_token', res.data.token);
        localStorage.setItem('academy_user', JSON.stringify(res.data.user));
        return { success: true };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('academy_token');
    localStorage.removeItem('academy_user');
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.me();
      if (res.data?.user) {
        const updatedUser: User = {
          ...res.data.user,
          studentId: res.data.student?._id,
          teacherId: res.data.teacher?._id,
        };
        setUser(updatedUser);
        localStorage.setItem('academy_user', JSON.stringify(updatedUser));
      }
    } catch (_) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
