'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import AuthModal, { AuthMode } from '@/components/auth/AuthModal';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  openAuthModal: (mode?: AuthMode, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, openAuthModal, closeAuthModal }}>
      {children}
      <AuthModal
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

