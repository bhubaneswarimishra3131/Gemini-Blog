import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import * as api from '../services/mockBackend';

interface AuthContextType extends AuthState {
  login: (email: string) => Promise<void>;
  register: (username: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await api.getCurrentUser();
        const token = localStorage.getItem('mern_blog_token');
        if (user && token) {
          setState({ user, token, isAuthenticated: true, isLoading: false });
        } else {
          setState(s => ({ ...s, isLoading: false }));
        }
      } catch (error) {
        setState(s => ({ ...s, isLoading: false }));
      }
    };
    initAuth();
  }, []);

  const login = async (email: string) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const { user, token } = await api.loginUser(email);
      localStorage.setItem('mern_blog_current_user_id', user.id);
      setState({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setState(s => ({ ...s, isLoading: false }));
      throw error;
    }
  };

  const register = async (username: string, email: string) => {
    setState(s => ({ ...s, isLoading: true }));
    try {
      const { user, token } = await api.registerUser(username, email);
      localStorage.setItem('mern_blog_current_user_id', user.id);
      setState({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setState(s => ({ ...s, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    await api.logoutUser();
    localStorage.removeItem('mern_blog_current_user_id');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};