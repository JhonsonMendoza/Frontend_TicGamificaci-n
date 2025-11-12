'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types/auth';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    university?: string;
    career?: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario está autenticado al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        apiService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiService.login({ email, password });
      
      if (response.user) {
        setUser(response.user);
        toast.success(`¡Bienvenido, ${response.user.name}!`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    university?: string;
    career?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiService.register(data);
      
      if (response.user) {
        setUser(response.user);
        toast.success(`¡Cuenta creada exitosamente! Bienvenido, ${response.user.name}!`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al crear la cuenta';
      if (error.response?.status === 409) {
        toast.error('Este email ya está registrado');
      } else {
        toast.error(message);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    toast.success('Sesión cerrada correctamente');
  };

  const updateUser = async (data: Partial<User>): Promise<void> => {
    try {
      const updatedUser = await apiService.updateProfile(data);
      setUser(updatedUser);
      toast.success('Perfil actualizado correctamente');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar el perfil';
      toast.error(message);
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (apiService.isAuthenticated()) {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user && apiService.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};