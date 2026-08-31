'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthUser } from './types';
import { getUserProfile, loginUser, logoutUser, registerUser } from './api';
import AuthModal, { AuthMode } from '@/components/auth/AuthModal';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<any>;
  register: (payload: { name: string; email: string; password: string; password_confirmation: string }) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  openAuthModal: (mode?: AuthMode, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthMode>('login');
  const [modalSuccessCallback, setModalSuccessCallback] = useState<(() => void) | undefined>(undefined);

  const openAuthModal = useCallback((mode: AuthMode = 'login', onSuccess?: () => void) => {
    setModalMode(mode);
    setModalSuccessCallback(() => onSuccess);
    setModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setModalOpen(false);
    setModalSuccessCallback(undefined);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await getUserProfile();
      if (res?.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Failed to load user profile, token may be expired:', err);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleLogin = async (payload: { email: string; password: string }) => {
    const res = await loginUser(payload);
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const handleRegister = async (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    const res = await registerUser(payload);
    if (res?.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      <AuthModal
        key={modalOpen ? `modal-${modalMode}` : 'modal-closed'}
        isOpen={modalOpen}
        initialMode={modalMode}
        onClose={closeAuthModal}
        onSuccess={modalSuccessCallback}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
