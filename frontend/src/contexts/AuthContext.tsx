import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await api.auth.getMe();
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (username: string) => {
    setLoading(true);
    try {
      await api.auth.usernameLogin(username);
      await refreshUser();
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login failed:', err);
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
