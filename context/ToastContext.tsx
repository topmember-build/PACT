'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { Toast, ToastType } from '../lib/types';

interface ToastContextValue {
  toasts: Toast[];
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration = 4000
  ) => {
    const id = `toast-${++counter.current}`;
    setToasts(prev => [...prev.slice(-4), { id, type, title, message, duration }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
