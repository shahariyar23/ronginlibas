'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  timestamp: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: ToastItem = {
      id,
      type,
      message,
      title,
      timestamp: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    // Auto dismiss after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const toast = React.useMemo(
    () => ({
      success: (message: string, title?: string) => addToast('success', message, title),
      error: (message: string, title?: string) => addToast('error', message, title),
      info: (message: string, title?: string) => addToast('info', message, title),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 border shadow-2xl transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-3 ${
              t.type === 'success'
                ? 'bg-[#00231a] text-white border-[#c79a45]'
                : t.type === 'error'
                ? 'bg-[#2b0e0e] text-white border-[#ba1a1a]'
                : 'bg-[#1b1c18] text-white border-[#deddd3]/30'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#b0ecd3]" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-[#ffdad6]" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-[#c79a45]" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#c79a45]">
                  {t.title || (t.type === 'success' ? 'ATELIER SUCCESS' : t.type === 'error' ? 'ATELIER NOTICE' : 'ATELIER UPDATE')}
                </p>
              </div>
              <p className="text-xs font-medium text-white/95 mt-0.5 leading-snug break-words">
                {t.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-white/60 hover:text-white transition-colors p-0.5"
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
