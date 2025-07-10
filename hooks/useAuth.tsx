
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Role } from '../types';
import * as api from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      setLoading(true);
      const loggedInUser = api.getAuthenticatedUser();
      setUser(loggedInUser);
      setLoading(false);
    };
    checkUser();
  }, []);
  
  const login = useCallback(async (email: string) => {
    try {
      const userData = await api.signIn(email);
      setUser(userData);
      if (userData.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    await api.signOut();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
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
