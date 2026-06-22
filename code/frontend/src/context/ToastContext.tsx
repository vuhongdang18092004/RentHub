"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ToastContextType {
  triggerToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ isVisible: boolean; message: string }>({
    isVisible: false,
    message: "",
  });

  const triggerToast = (message: string) => {
    setToast({ isVisible: true, message });
    
    // Tự động đóng Toast trượt ngược lên sau 3 giây
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ triggerToast }}>
      {children}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-500 ease-out flex items-center gap-3 bg-linear-to-r from-[#3F1B6B] to-indigo-900 text-white px-6 py-3.5 rounded-2xl shadow-xl font-medium text-sm border border-white/10 ${
        toast.isVisible ? "translate-y-0 opacity-100" : "-translate-y-16 opacity-0 pointer-events-none"
      }`}>
        <svg className="w-5 h-5 animate-pulse text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        <span>{toast.message}</span>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast phải được đặt trong ToastProvider");
  return context;
}